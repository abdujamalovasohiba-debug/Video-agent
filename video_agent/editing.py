"""Montaj: bo'laklarni kesish va ular orasiga silliq o'tish (xfade) qo'shish."""

from __future__ import annotations

import logging
from pathlib import Path

from . import ffmpeg_utils as ff
from .timeline import Segment

log = logging.getLogger("video_agent")

BATCH = 32  # bitta ffmpeg buyrug'idagi maksimal kirishlar
MAX_SIDE = 1920  # oraliq fayllar uchun maksimal o'lcham


def working_size(width: int, height: int) -> tuple[int, int]:
    """Oraliq fayl o'lchami: 1920 dan katta bo'lsa kichraytiriladi, juft sonlar."""
    scale = min(1.0, MAX_SIDE / max(width, height)) if max(width, height) else 1.0
    w, h = int(width * scale) // 2 * 2, int(height * scale) // 2 * 2
    return max(w, 2), max(h, 2)


def _encode_args(crf: int = 16) -> list[str]:
    return ["-c:v", "libx264", "-preset", "veryfast", "-crf", str(crf), "-pix_fmt", "yuv420p",
            "-c:a", "pcm_s16le", "-ar", "48000", "-ac", "2"]


def extract_segment(src: Path, seg: Segment, out: Path, size: tuple[int, int], fps: int, has_audio: bool) -> Path:
    w, h = size
    d = seg.duration
    vf = f"scale={w}:{h}:flags=lanczos,setsar=1,fps={fps},format=yuv420p,trim=duration={d:.6f}"
    args = ["-ss", f"{seg.start:.6f}", "-t", f"{d + 0.5:.6f}", "-i", src]
    if not has_audio:
        args += ["-f", "lavfi", "-t", f"{d:.6f}", "-i", "anullsrc=r=48000:cl=stereo"]
    af = f"aresample=48000,aformat=channel_layouts=stereo,apad,atrim=duration={d:.6f}"
    args += ["-map", "0:v:0", "-map", "0:a:0" if has_audio else "1:a:0",
             "-vf", vf, "-af", af, "-t", f"{d:.6f}", *_encode_args(), out.with_suffix(".mov")]
    ff.run(args)
    return out.with_suffix(".mov")


def _xfade_graph(durations: list[float], transition: str, t: float) -> tuple[str, str, str]:
    parts, offset = [], durations[0]
    vprev, aprev = "[0:v]", "[0:a]"
    for i in range(1, len(durations)):
        offset -= t
        vout, aout = f"[v{i}]", f"[a{i}]"
        parts.append(f"{vprev}[{i}:v]xfade=transition={transition}:duration={t:.4f}:offset={offset:.6f}{vout}")
        parts.append(f"{aprev}[{i}:a]acrossfade=d={t:.4f}:c1=tri:c2=tri{aout}")
        vprev, aprev = vout, aout
        offset += durations[i]
    return ";".join(parts), vprev, aprev


def join_clips(clips: list[Path], durations: list[float], out: Path, transition: str, t: float) -> Path:
    """Kliplarni xfade bilan ulaydi (ko'p bo'lsa, guruhlab)."""
    if len(clips) == 1:
        return clips[0]
    if len(clips) > BATCH:
        groups, gdurs = [], []
        for gi in range(0, len(clips), BATCH):
            chunk, cd = clips[gi:gi + BATCH], durations[gi:gi + BATCH]
            p = out.with_name(f"{out.stem}_g{gi // BATCH}.mov")
            groups.append(join_clips(chunk, cd, p, transition, t))
            gdurs.append(sum(cd) - t * (len(cd) - 1))
        return join_clips(groups, gdurs, out, transition, t)
    args: list = []
    for c in clips:
        args += ["-i", c]
    if t > 0:
        graph, v, a = _xfade_graph(durations, transition, t)
    else:
        n = len(clips)
        graph = "".join(f"[{i}:v][{i}:a]" for i in range(n)) + f"concat=n={n}:v=1:a=1[v][a]"
        v, a = "[v]", "[a]"
    out = out.with_suffix(".mov")
    ff.run([*args, "-filter_complex", graph, "-map", v, "-map", a, *_encode_args(), out])
    return out


def effective_transition(segments: list[Segment], t: float) -> float:
    """O'tish eng qisqa bo'lakning yarmidan oshmasligi kerak."""
    if len(segments) < 2 or t <= 0:
        return 0.0
    shortest = min(s.duration for s in segments)
    return max(0.0, min(t, shortest / 2 - 0.02))


def cut_and_join(src: Path, segments: list[Segment], workdir: Path, size: tuple[int, int], fps: int,
                 has_audio: bool, transition: str, t: float) -> Path:
    segdir = workdir / "segments"
    segdir.mkdir(parents=True, exist_ok=True)
    clips = []
    for i, seg in enumerate(segments):
        clips.append(extract_segment(src, seg, segdir / f"seg_{i:04d}", size, fps, has_audio))
        log.debug("bo'lak %d/%d: %.2f-%.2f", i + 1, len(segments), seg.start, seg.end)
    return join_clips(clips, [s.duration for s in segments], workdir / "cut", transition, t)
