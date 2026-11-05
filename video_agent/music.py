"""Referens videodan fon musiqasini ajratib olish (ovozni olib tashlash).

UVR MDX-Net modeli (audio-separator, ONNX) nutqni musiqadan ajratadi. Model
birinchi ishga tushganda GitHub'dan yuklanadi. Musiqa video uzunligidan qisqa
bo'lsa, ulanish joylari silliq (crossfade) qilib takrorlanadi.
"""

from __future__ import annotations

import logging
import math
from pathlib import Path

from . import ffmpeg_utils as ff

log = logging.getLogger("video_agent")

MODEL = "UVR-MDX-NET-Inst_HQ_3.onnx"
MODEL_DIR = Path(__file__).resolve().parent.parent / "models"


def extract_instrumental(src: Path, workdir: Path) -> Path:
    try:
        from audio_separator.separator import Separator
    except ImportError as e:
        raise RuntimeError("Musiqani ajratish uchun: pip install 'audio-separator[cpu]'") from e
    workdir.mkdir(parents=True, exist_ok=True)
    wav = workdir / "music_src.wav"
    ff.run(["-i", src, "-vn", "-ac", "2", "-ar", "44100", wav])
    sep = Separator(output_dir=str(workdir), model_file_dir=str(MODEL_DIR), output_format="WAV",
                    log_level=logging.WARNING)
    sep.load_model(model_filename=MODEL)
    outs = sep.separate(str(wav))
    inst = next((workdir / Path(o).name for o in outs if "Instrumental" in o), None)
    if not inst or not inst.exists():
        raise RuntimeError("Musiqani ajratib bo'lmadi")
    return inst


def loop_to(music: Path, out: Path, duration: float, xfade: float = 3.0) -> Path:
    """Musiqani kerakli uzunlikkacha silliq ulanishlar bilan takrorlaydi."""
    d = ff.probe(music).duration
    if d >= duration or d <= xfade * 2:
        return music
    n = math.ceil((duration - xfade) / (d - xfade))  # n*d - (n-1)*xfade >= duration
    args: list = []
    for _ in range(n):
        args += ["-i", music]
    graph, prev = [], "[0:a]"
    for i in range(1, n):
        graph.append(f"{prev}[{i}:a]acrossfade=d={xfade}:c1=qsin:c2=qsin[x{i}]")
        prev = f"[x{i}]"
    ff.run([*args, "-filter_complex", ";".join(graph), "-map", prev, "-ar", "48000", out])
    return out
