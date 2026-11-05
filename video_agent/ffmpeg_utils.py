"""ffmpeg / ffprobe chaqiruvlari uchun yordamchilar."""

from __future__ import annotations

import json
import logging
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

log = logging.getLogger("video_agent")


class FFmpegError(RuntimeError):
    pass


def require_ffmpeg() -> None:
    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            raise FFmpegError(f"'{tool}' topilmadi. O'rnating: https://ffmpeg.org/download.html")


def run(args: list[str], capture: bool = False) -> subprocess.CompletedProcess:
    cmd = ["ffmpeg", "-hide_banner", "-nostdin", "-y", "-loglevel", "error", *map(str, args)]
    log.debug("$ %s", " ".join(cmd))
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise FFmpegError(f"ffmpeg xatosi:\n{proc.stderr.strip()[-3000:]}")
    return proc


def run_stderr(args: list[str]) -> str:
    """Filtrlar natijasi (silencedetect kabi) stderr'ga yoziladi."""
    cmd = ["ffmpeg", "-hide_banner", "-nostdin", "-y", *map(str, args)]
    log.debug("$ %s", " ".join(cmd))
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise FFmpegError(f"ffmpeg xatosi:\n{proc.stderr.strip()[-3000:]}")
    return proc.stderr


@dataclass
class MediaInfo:
    duration: float
    width: int
    height: int
    fps: float
    has_audio: bool
    has_video: bool


def probe(path: str | Path) -> MediaInfo:
    proc = subprocess.run(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)],
        capture_output=True, text=True,
    )
    if proc.returncode != 0:
        raise FFmpegError(f"Faylni o'qib bo'lmadi: {path}\n{proc.stderr}")
    data = json.loads(proc.stdout)
    streams = data.get("streams", [])
    video = next((s for s in streams if s.get("codec_type") == "video"), None)
    audio = next((s for s in streams if s.get("codec_type") == "audio"), None)
    fps = 30.0
    if video and video.get("avg_frame_rate", "0/0") != "0/0":
        n, d = video["avg_frame_rate"].split("/")
        fps = float(n) / float(d) if float(d) else 30.0
    width, height = (int(video["width"]), int(video["height"])) if video else (0, 0)
    rotation = 0
    if video:
        rotation = int(video.get("tags", {}).get("rotate", 0) or 0)
        for sd in video.get("side_data_list", []) or []:
            if "rotation" in sd:
                rotation = int(sd["rotation"])
    if abs(rotation) % 180 == 90:  # telefonda tik olingan video
        width, height = height, width
    duration = float(data.get("format", {}).get("duration") or (video or audio or {}).get("duration") or 0)
    return MediaInfo(duration, width, height, fps, audio is not None, video is not None)


def hex_to_ffmpeg(color: str) -> str:
    return "0x" + color.lstrip("#")
