"""Har bir format uchun yakuniy render: reframe + zoom + motion grafika + subtitr + intro/outro."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from . import ffmpeg_utils as ff
from .motion import Overlay, _fesc
from .reframe import reframe_filter


@dataclass
class ComposeJob:
    video: Path                     # montaj qilingan video (cut.mov)
    audio: Path                     # yakuniy aralashtirilgan ovoz
    out: Path
    src_size: tuple[int, int]
    size: tuple[int, int]
    fps: int
    main_duration: float
    reframe: str = "blur"
    focus_x: float = 0.5
    zoom_expr: str = "1"
    ass: Path | None = None
    overlays: list[Overlay] = field(default_factory=list)
    intro: Path | None = None
    intro_duration: float = 0.0
    outro: Path | None = None
    outro_duration: float = 0.0
    edge: float = 0.5               # intro/outro o'tish davomiyligi
    edge_type: str = "fade"
    crf: int = 20
    preset: str = "medium"
    workdir: Path | None = None
    look: list[str] = field(default_factory=list)   # rang/vinyetka filtrlari (overlay'lardan oldin)


def total_duration(job: ComposeJob) -> float:
    t = job.main_duration
    if job.intro:
        t += job.intro_duration - job.edge
    if job.outro:
        t += job.outro_duration - job.edge
    return t


def main_offset(job: ComposeJob) -> float:
    """Asosiy video yakuniy videoda qaysi soniyadan boshlanadi."""
    return job.intro_duration - job.edge if job.intro else 0.0


def zoom_filter(expr: str, w: int, h: int, inp: str, out: str) -> str:
    """Kadrni har freymda z(t) marta kattalashtirib, markazdan asl o'lchamda qirqadi."""
    sw = f"trunc({w}*({expr})/2)*2"
    sh = f"trunc({h}*({expr})/2)*2"
    return (f"{inp}scale=w='{sw}':h='{sh}':eval=frame:flags=bicubic,"
            f"crop={w}:{h}:x='({sw}-{w})/2':y='({sh}-{h})/2',setsar=1{out}")


def build_graph(job: ComposeJob, overlay_inputs: dict[int, int], intro_idx: int | None,
                outro_idx: int | None) -> tuple[str, str]:
    w, h = job.size
    norm = f"fps={job.fps},format=yuv420p,setsar=1,settb=AVTB"
    g = [reframe_filter(*job.src_size, w, h, job.reframe, job.focus_x, "[0:v]", "[rf]")]
    cur = "[rf]"
    if job.src_size[1] < h * 0.8 and job.src_size[0] < w * 0.8:
        # Kichik manba kattalashtirilganda yumshoqlikni kompensatsiya qilamiz
        g.append(f"{cur}unsharp=5:5:0.7:5:5:0.0[sh]")
        cur = "[sh]"
    if job.zoom_expr != "1":
        g.append(zoom_filter(job.zoom_expr, w, h, cur, "[zm]"))
        cur = "[zm]"
    if job.look:
        g.append(f"{cur}{','.join(job.look)}[lk]")
        cur = "[lk]"
    for i, ov in enumerate(job.overlays):
        nxt = f"[ov{i}]"
        if ov.file is not None:
            idx = overlay_inputs[i]
            g.append(f"[{idx}:v]setpts=PTS-STARTPTS+{ov.start:.3f}/TB[ovs{i}]")
            g.append(f"{cur}[ovs{i}]overlay=eof_action=pass:repeatlast=0{nxt}")
        else:
            g.append(f"{cur}{ov.filter}{nxt}")
        cur = nxt
    if job.ass:
        g.append(f"{cur}ass=filename='{_fesc(job.ass)}'[sub]")
        cur = "[sub]"
    g.append(f"{cur}{norm}[main]")
    cur, length = "[main]", job.main_duration
    if intro_idx is not None:
        g.append(f"[{intro_idx}:v]scale={w}:{h},{norm}[intro]")
        off = job.intro_duration - job.edge
        g.append(f"[intro]{cur}xfade=transition={job.edge_type}:duration={job.edge:.3f}:offset={off:.3f}[xi]")
        cur, length = "[xi]", job.intro_duration + length - job.edge
    if outro_idx is not None:
        g.append(f"[{outro_idx}:v]scale={w}:{h},{norm}[outro]")
        off = length - job.edge
        g.append(f"{cur}[outro]xfade=transition={job.edge_type}:duration={job.edge:.3f}:offset={off:.3f}[xo]")
        cur = "[xo]"
    return ";".join(g), cur


def compose(job: ComposeJob) -> Path:
    args: list = ["-i", job.video]
    idx = 1
    overlay_inputs: dict[int, int] = {}
    for i, ov in enumerate(job.overlays):
        if ov.file is not None:
            args += ["-i", ov.file]
            overlay_inputs[i] = idx
            idx += 1
    intro_idx = outro_idx = None
    if job.intro:
        args += ["-i", job.intro]
        intro_idx, idx = idx, idx + 1
    if job.outro:
        args += ["-i", job.outro]
        outro_idx, idx = idx, idx + 1
    args += ["-i", job.audio]
    audio_idx = idx
    graph, vout = build_graph(job, overlay_inputs, intro_idx, outro_idx)
    graph_file = (job.workdir or job.out.parent) / f"{job.out.stem}.filter.txt"
    graph_file.write_text(graph, encoding="utf-8")
    ff.run([*args, "-filter_complex_script", graph_file, "-map", vout, "-map", f"{audio_idx}:a",
            "-t", f"{total_duration(job):.3f}",
            "-c:v", "libx264", "-preset", job.preset, "-crf", str(job.crf), "-pix_fmt", "yuv420p",
            "-profile:v", "high", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", job.out])
    return job.out
