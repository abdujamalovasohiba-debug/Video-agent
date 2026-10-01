"""Motion grafika: Remotion (asosiy) yoki ffmpeg drawtext (zaxira) orqali.

- Intro / Outro: to'liq kadrli alohida kliplar (montaj boshiga/oxiriga ulanadi).
- Sarlavha va pastki yozuv (lower third): shaffof fonli overlay'lar.
"""

from __future__ import annotations

import glob
import json
import logging
import os
import shutil
import subprocess
import textwrap
from dataclasses import dataclass
from pathlib import Path

from . import ffmpeg_utils as ff
from .config import MotionConfig

log = logging.getLogger("video_agent")

REMOTION_DIR = Path(__file__).resolve().parent.parent / "remotion"


@dataclass
class Overlay:
    start: float
    duration: float
    file: Path | None = None      # shaffof video (Remotion)
    filter: str | None = None     # ffmpeg filtri (zaxira usul)


@dataclass
class MotionText:
    title: str = ""
    subtitle: str = ""
    name: str = ""
    role: str = ""
    handle: str = ""


def _props(cfg: MotionConfig, text: MotionText, w: int, h: int, fps: int, dur: float) -> dict:
    return {
        "width": w, "height": h, "fps": fps, "durationInFrames": max(1, round(dur * fps)),
        "primary": cfg.primary, "accent": cfg.accent, "textColor": cfg.text_color,
        "fontFamily": 'Montserrat, "DejaVu Sans", Arial, sans-serif', "titleFont": cfg.title_font,
        "handle": text.handle,
        **({"textY": cfg.text_y} if cfg.text_y is not None else {}),
        "title": text.title, "subtitle": text.subtitle, "name": text.name, "role": text.role, "cta": cfg.cta,
    }


def find_browser() -> str | None:
    env = os.environ.get("REMOTION_BROWSER_EXECUTABLE")
    if env:
        return env
    for pattern in ("/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell",
                    os.path.expanduser("~/.cache/ms-playwright/chromium_headless_shell-*/chrome-linux/headless_shell")):
        hits = sorted(glob.glob(pattern))
        if hits:
            return hits[-1]
    return None  # Remotion o'zi yuklab oladi


@dataclass
class MotionJob:
    """Bitta motion grafika elementi: to'liq klip (intro/outro) yoki overlay."""
    fmt: str
    comp: str                     # Intro | Outro | TitleOverlay | LowerThird
    size: tuple[int, int]
    fps: int
    duration: float
    out: Path                     # kengaytmasiz yo'l
    start: float = 0.0            # overlay boshlanish vaqti
    alpha: bool = False           # True -> shaffof overlay


class RemotionRenderer:
    name = "remotion"

    def __init__(self, project: Path = REMOTION_DIR):
        self.project = project

    def available(self) -> bool:
        return bool(shutil.which("node")) and (self.project / "node_modules" / "@remotion" / "renderer").exists()

    def render_all(self, jobs: list[MotionJob], cfg: MotionConfig, text: MotionText) -> dict[int, Overlay | Path]:
        """Barcha elementlarni bitta Node jarayonida render qiladi (bundle bir marta)."""
        if not jobs:
            return {}
        spec = []
        for j in jobs:
            out = j.out.with_suffix(".mov" if j.alpha else ".mp4")
            spec.append({"composition": j.comp, "props": _props(cfg, text, *j.size, j.fps, j.duration),
                         "output": str(out.resolve()), "alpha": j.alpha})
        jobs_file = jobs[0].out.parent / "remotion_jobs.json"
        jobs_file.write_text(json.dumps(spec, ensure_ascii=False), encoding="utf-8")
        env = dict(os.environ)
        browser = find_browser()
        if browser:
            env["REMOTION_BROWSER_EXECUTABLE"] = browser
        cmd = ["node", "render.mjs", str(jobs_file.resolve())]
        log.debug("$ %s", " ".join(cmd))
        proc = subprocess.run(cmd, cwd=self.project, capture_output=True, text=True, env=env)
        if proc.returncode != 0:
            raise RuntimeError(f"Remotion xatosi:\n{(proc.stderr or proc.stdout)[-2000:]}")
        results: dict[int, Overlay | Path] = {}
        for i, (j, s) in enumerate(zip(jobs, spec)):
            out = Path(s["output"])
            if not out.exists():
                raise RuntimeError(f"Remotion natijasi topilmadi: {out}")
            results[i] = Overlay(j.start, j.duration, file=out) if j.alpha else out
        return results


# ----------------------------------------------------------------- ffmpeg zaxira

def font_file(family: str = "DejaVu Sans", bold: bool = True) -> str:
    try:
        out = subprocess.run(["fc-match", "-f", "%{file}", f"{family}:{'bold' if bold else 'regular'}"],
                             capture_output=True, text=True).stdout.strip()
        if out:
            return out
    except FileNotFoundError:
        pass
    return "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def _fesc(path: Path | str) -> str:
    """ffmpeg filtri ichidagi fayl yo'lini ekranlash."""
    return str(path).replace("\\", "/").replace(":", "\\:").replace("'", "\\'")


class FFmpegRenderer:
    name = "ffmpeg"

    def __init__(self, workdir: Path):
        self.workdir = workdir
        self.font = font_file()

    def available(self) -> bool:
        return True

    def render_all(self, jobs: list[MotionJob], cfg: MotionConfig, text: MotionText) -> dict[int, Overlay | Path]:
        out: dict[int, Overlay | Path] = {}
        for i, j in enumerate(jobs):
            if j.alpha:
                out[i] = self.overlay(j.comp, cfg, text, j.size, j.fps, j.start, j.duration, j.out)
            else:
                out[i] = self.clip(j.comp, cfg, text, j.size, j.fps, j.duration, j.out)
        return out

    def _textfile(self, name: str, text: str, width_chars: int) -> Path:
        p = self.workdir / f"{name}.txt"
        p.write_text("\n".join(textwrap.wrap(text, width_chars)) or " ", encoding="utf-8")
        return p

    def clip(self, comp: str, cfg: MotionConfig, text: MotionText, size, fps, dur, out: Path) -> Path:
        w, h = size
        u = min(w, h) / 1080
        vertical = h > w
        main = (text.title if comp == "Intro" else text.handle if comp == "EndCard" else cfg.cta) or " "
        tf = self._textfile(f"{out.stem}_main", main.upper(), 14 if vertical else 22)
        fs = round((100 if comp == "Intro" else 90) * u)
        alpha = f"min(1\\,t/0.4)*min(1\\,({dur:.2f}-t)/0.4)"
        slide = f"(1-min(1\\,t/0.45))*{round(80 * u)}"
        acc = ff.hex_to_ffmpeg(cfg.accent)
        vf = [
            f"drawtext=fontfile='{_fesc(self.font)}':textfile='{_fesc(tf)}':fontsize={fs}:"
            f"fontcolor={ff.hex_to_ffmpeg(cfg.text_color) if comp == 'Intro' else acc}:line_spacing={round(10 * u)}:"
            f"x=(w-text_w)/2:y=(h-text_h)/2+{slide}:alpha='{alpha}':shadowx=3:shadowy=3",
            f"drawbox=x=(iw-{round(360 * u)})/2:y=ih/2+{round(150 * u)}:w={round(360 * u)}:h={round(12 * u)}:"
            f"color={acc}:t=fill:enable='gt(t\\,0.4)'",
        ]
        sub = text.subtitle if comp == "Intro" else "" if comp == "EndCard" else text.name
        if sub:
            sf = self._textfile(f"{out.stem}_sub", sub, 40)
            vf.append(f"drawtext=fontfile='{_fesc(self.font)}':textfile='{_fesc(sf)}':fontsize={round(46 * u)}:"
                      f"fontcolor={acc if comp == 'Intro' else ff.hex_to_ffmpeg(cfg.text_color)}:"
                      f"x=(w-text_w)/2:y=h/2+{round(200 * u)}:alpha='{alpha}'")
        vf += ["fade=t=in:d=0.3", f"fade=t=out:st={max(0, dur - 0.4):.2f}:d=0.4", "format=yuv420p"]
        out = out.with_suffix(".mp4")
        ff.run(["-f", "lavfi", "-i", f"color=c={ff.hex_to_ffmpeg(cfg.primary)}:s={w}x{h}:r={fps}:d={dur:.3f}",
                "-vf", ",".join(vf), "-c:v", "libx264", "-crf", "16", "-preset", "veryfast", out])
        return out

    def overlay(self, comp: str, cfg: MotionConfig, text: MotionText, size, fps, start, dur, out: Path) -> Overlay:
        w, h = size
        u = min(w, h) / 1080
        vertical = h > w
        end = start + dur
        en = f"between(t\\,{start:.2f}\\,{end:.2f})"
        alpha = f"min(1\\,(t-{start:.2f})/0.3)*min(1\\,({end:.2f}-t)/0.3)"
        acc = ff.hex_to_ffmpeg(cfg.accent)
        if comp == "AestheticText":
            serif = font_file("Liberation Serif", bold=False)
            tf = self._textfile(f"{out.stem}_t", text.title, 34 if vertical else 60)
            f = (f"drawtext=fontfile='{_fesc(serif)}':textfile='{_fesc(tf)}':fontsize={round(44 * u)}:"
                 f"fontcolor=0xF7F3EC:x=(w-text_w)/2:y=h*{cfg.text_y if cfg.text_y is not None else (0.36 if vertical else 0.3)}:shadowcolor=black@0.5:"
                 f"shadowx=0:shadowy=1:alpha='{alpha}':enable='{en}'")
            if text.handle:
                hf = self._textfile(f"{out.stem}_h", text.handle.upper(), 40)
                f += (f",drawtext=fontfile='{_fesc(self.font)}':textfile='{_fesc(hf)}':fontsize={round(25 * u)}:"
                      f"fontcolor=white:x=w-text_w-{round(44 * u)}:y=h*{0.29 if vertical else 0.16}:"
                      f"alpha='{alpha}':enable='{en}'")
            return Overlay(start, dur, filter=f)
        if comp == "CinematicTitle":
            serif = font_file("Liberation Serif", bold=False)
            tf = self._textfile(f"{out.stem}_t", " ".join(text.title.upper()), 30 if vertical else 60)
            fade = f"min(1\\,max(0\\,(t-{start:.2f})/0.9))*min(1\\,max(0\\,({end:.2f}-t)/0.9))"
            f = (f"drawtext=fontfile='{_fesc(serif)}':textfile='{_fesc(tf)}':fontsize={round(80 * u)}:"
                 f"fontcolor=0xF5EEDF:line_spacing={round(14 * u)}:x=(w-text_w)/2:y=h*{0.7 if vertical else 0.74}:"
                 f"shadowcolor=black@0.4:shadowx=0:shadowy=2:alpha='{fade}':enable='{en}',"
                 f"drawbox=x=(iw-{round(160 * u)})/2:y=ih*{0.7 if vertical else 0.74}+{round(120 * u)}:w={round(160 * u)}:h=2:"
                 f"color={acc}@0.8:t=fill:enable='between(t\\,{start + 0.6:.2f}\\,{end - 0.4:.2f})'")
            return Overlay(start, dur, filter=f)
        if comp == "TitleOverlay":
            tf = self._textfile(f"{out.stem}_t", text.title.upper(), 18 if vertical else 32)
            fs = round(64 * u)
            y = round(h * (0.12 if vertical else 0.08))
            f = (f"drawtext=fontfile='{_fesc(self.font)}':textfile='{_fesc(tf)}':fontsize={fs}:fontcolor=black:"
                 f"box=1:boxcolor={acc}:boxborderw={round(22 * u)}:line_spacing={round(8 * u)}:"
                 f"x=(w-text_w)/2:y={y}-(1-min(1\\,(t-{start:.2f})/0.3))*{round(60 * u)}:"
                 f"alpha='{alpha}':enable='{en}'")
            return Overlay(start, dur, filter=f)
        # LowerThird: chapdan siljib kiruvchi blok
        nf = self._textfile(f"{out.stem}_n", text.name, 40)
        rf = self._textfile(f"{out.stem}_r", text.role or " ", 50)
        base_y = round(h * (0.48 if vertical else 0.6))
        x0 = round((60 if vertical else 90) * u)
        slide = f"{x0}-(1-min(1\\,(t-{start:.2f})/0.35))*{round(400 * u)}"
        f = (f"drawbox=x={x0 - round(14 * u)}:y={base_y - round(16 * u)}:w={round(12 * u)}:h={round(130 * u)}:"
             f"color={acc}:t=fill:enable='{en}',"
             f"drawtext=fontfile='{_fesc(self.font)}':textfile='{_fesc(nf)}':fontsize={round(56 * u)}:fontcolor=white:"
             f"box=1:boxcolor=black@0.7:boxborderw={round(14 * u)}:x='{slide}':y={base_y}:alpha='{alpha}':enable='{en}',"
             f"drawtext=fontfile='{_fesc(self.font)}':textfile='{_fesc(rf)}':fontsize={round(36 * u)}:fontcolor={acc}:"
             f"x='{slide}':y={base_y + round(78 * u)}:alpha='{alpha}':enable='{en}'")
        return Overlay(start, dur, filter=f)


def get_renderer(cfg: MotionConfig, workdir: Path):
    if cfg.renderer in ("auto", "remotion"):
        r = RemotionRenderer()
        if r.available():
            return r
        if cfg.renderer == "remotion":
            raise RuntimeError("Remotion topilmadi. O'rnating: cd remotion && npm install")
        log.warning("Remotion o'rnatilmagan -> ffmpeg motion grafika ishlatiladi (cd remotion && npm install)")
    return FFmpegRenderer(workdir)


def render_motion(jobs: list[MotionJob], cfg: MotionConfig, text: MotionText, workdir: Path):
    """Remotion bilan render qiladi; xato bo'lsa ffmpeg zaxirasiga o'tadi."""
    renderer = get_renderer(cfg, workdir)
    log.info("    renderer: %s (%d element)", renderer.name, len(jobs))
    try:
        return renderer.render_all(jobs, cfg, text)
    except Exception as e:
        if isinstance(renderer, FFmpegRenderer) or cfg.renderer == "remotion":
            raise
        log.warning("    Remotion xatosi, ffmpeg zaxira ishlatiladi: %s", str(e).strip().splitlines()[-1])
        return FFmpegRenderer(workdir).render_all(jobs, cfg, text)
