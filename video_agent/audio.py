"""Ovoz: tozalash, balanslash, fon musiqasi va nutq paytida musiqani pasaytirish (ducking)."""

from __future__ import annotations

import json
import logging
import re
from pathlib import Path

from . import ffmpeg_utils as ff
from .config import AudioConfig

log = logging.getLogger("video_agent")


def voice_chain(cfg: AudioConfig) -> str:
    """Nutqni tozalash zanjiri: past shovqinni kesish, shovqin kamaytirish, sibilyant, kompressor."""
    chain = ["highpass=f=80", "lowpass=f=14000"]
    if cfg.denoise:
        chain.append(f"afftdn=nr={cfg.denoise_strength:.1f}:nf=-45:tn=1")
    chain += [
        "deesser=i=0.4",
        "equalizer=f=3000:t=q:w=1.2:g=2",  # nutq aniqligi
        "acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2",
    ]
    return ",".join(chain)


def clean_voice(src: Path, out: Path, cfg: AudioConfig) -> Path:
    """Nutqni tozalaydi va standart balandlikka keltiradi.

    Past yozilgan ovozda bu muhim: aks holda musiqa nutqdan baland chiqib qoladi,
    chunki musiqa darajasi target_lufs ga nisbatan hisoblanadi.
    """
    raw = out.with_name(out.stem + "_raw.wav")
    ff.run(["-i", src, "-vn", "-af", voice_chain(cfg), "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", raw])
    norm = loudnorm_filter(raw, cfg.target_lufs)
    ff.run(["-i", raw, "-af", f"{norm},aresample=48000", "-ar", "48000", "-c:a", "pcm_s16le", out])
    return out


def _measure_loudness(src: Path, target: float) -> dict | None:
    log_txt = ff.run_stderr(["-i", src, "-af", f"loudnorm=I={target}:TP=-1.5:LRA=11:print_format=json",
                             "-f", "null", "-"])
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", log_txt, re.S)
    if not m:
        return None
    data = json.loads(m.group(0))
    if data.get("input_i") in ("-inf", None):
        return None
    return data


def loudnorm_filter(src: Path, target: float) -> str:
    """Ikki bosqichli EBU R128 normallashtirish (aniqroq natija)."""
    meas = _measure_loudness(src, target)
    base = f"loudnorm=I={target}:TP=-1.5:LRA=11"
    if not meas:
        return base
    return (f"{base}:measured_I={meas['input_i']}:measured_TP={meas['input_tp']}"
            f":measured_LRA={meas['input_lra']}:measured_thresh={meas['input_thresh']}"
            f":offset={meas['target_offset']}:linear=true")


def music_gain_db(music: Path, cfg: AudioConfig) -> float:
    """Musiqani nutqdan music_volume_db pastroq turadigan qilib kuchaytirish/pasaytirish (dB)."""
    meas = _measure_loudness(music, cfg.target_lufs)
    if not meas:
        return cfg.music_volume_db
    target = cfg.target_lufs + cfg.music_volume_db
    return max(-40.0, min(30.0, target - float(meas["input_i"])))


def mix(voice: Path, out: Path, cfg: AudioConfig, total: float, voice_offset: float = 0.0,
        music: Path | None = None) -> Path:
    """Nutqni vaqt bo'yicha joylab, fon musiqasi bilan aralashtiradi va normallashtiradi."""
    delay_ms = int(round(voice_offset * 1000))
    pre = out.with_name(out.stem + "_pre.wav")
    voice_f = f"[0:a]adelay={delay_ms}|{delay_ms},apad,atrim=0:{total:.3f}"
    if music and cfg.music_percent is not None:
        # Musiqa asl balandligining aniq foizida, butun video davomida bir xil (ducking'siz)
        fade_out = max(0.0, total - cfg.music_fade)
        graph = (
            f"{voice_f}[v];"
            f"[1:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{total:.3f},"
            f"volume={cfg.music_percent / 100:.4f},afade=t=in:d={cfg.music_fade}:curve=tri,"
            f"afade=t=out:st={fade_out:.3f}:d={cfg.music_fade}[m];"
            f"[v][m]amix=inputs=2:duration=first:normalize=0[out]"
        )
    elif music:
        gain = music_gain_db(music, cfg)
        log.debug("musiqa kuchaytirish: %.1f dB", gain)
        fade_out = max(0.0, total - cfg.music_fade)
        graph = (
            f"{voice_f},asplit=2[v][key];"
            f"[1:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{total:.3f},"
            f"volume={gain:.2f}dB,afade=t=in:d={cfg.music_fade}:curve=tri,"
            f"afade=t=out:st={fade_out:.3f}:d={cfg.music_fade}[m];"
            f"[m][key]sidechaincompress=threshold={cfg.duck_threshold}:ratio={cfg.duck_ratio}"
            f":attack=30:release=400:makeup=1[duck];"
            f"[v][duck]amix=inputs=2:duration=first:normalize=0[out]"
        )
    if music:
        ff.run(["-i", voice, "-stream_loop", "-1", "-i", music, "-filter_complex", graph, "-map", "[out]",
                "-t", f"{total:.3f}", "-ar", "48000", "-c:a", "pcm_s16le", pre])
    else:
        ff.run(["-i", voice, "-filter_complex", voice_f + "[out]", "-map", "[out]",
                "-t", f"{total:.3f}", "-ar", "48000", "-c:a", "pcm_s16le", pre])
    norm = loudnorm_filter(pre, cfg.target_lufs)
    ff.run(["-i", pre, "-af", f"{norm},alimiter=limit=0.95,aresample=48000", "-ar", "48000",
            "-c:a", "pcm_s16le", out])
    return out
