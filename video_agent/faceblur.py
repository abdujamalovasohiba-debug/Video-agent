"""Yuzni estetik yashirish: yuz kadrma-kadr kuzatiladi va yumshoq chetli xiralik
(yoki emoji) bilan yopiladi. OpenCV YuNet detektori ishlatiladi."""

from __future__ import annotations

import logging
import subprocess
import urllib.request
from pathlib import Path

import numpy as np

from . import ffmpeg_utils as ff

log = logging.getLogger("video_agent")

MODEL = Path(__file__).resolve().parent.parent / "models" / "face_detection_yunet_2023mar.onnx"
MODEL_URL = ("https://media.githubusercontent.com/media/opencv/opencv_zoo/main/models/"
             "face_detection_yunet/face_detection_yunet_2023mar.onnx")
ANALYSIS_W = 540  # aniqlash uchun kichraytirilgan kenglik (tezlik uchun)


def _cv2():
    try:
        import cv2
        return cv2
    except ImportError as e:
        raise RuntimeError("Yuzni yashirish uchun OpenCV kerak: pip install opencv-python-headless") from e


def ensure_model() -> Path:
    if not MODEL.exists() or MODEL.stat().st_size < 10_000:
        MODEL.parent.mkdir(parents=True, exist_ok=True)
        log.info("    YuNet modeli yuklanmoqda...")
        urllib.request.urlretrieve(MODEL_URL, MODEL)
    return MODEL


def _frames(src: Path, w: int, h: int):
    proc = subprocess.Popen(["ffmpeg", "-v", "error", "-i", str(src), "-vf", f"scale={w}:{h}",
                             "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
    size = w * h * 3
    try:
        while True:
            buf = proc.stdout.read(size)
            if len(buf) < size:
                break
            yield np.frombuffer(buf, np.uint8).reshape(h, w, 3)
    finally:
        proc.stdout.close()
        proc.wait()


def fill_and_smooth(boxes: list[list[float] | None], window: int = 9) -> list[list[float] | None]:
    """Topilmagan kadrlarni qo'shnilaridan to'ldiradi va titrashni silliqlaydi."""
    idx = [i for i, b in enumerate(boxes) if b is not None]
    if not idx:
        return boxes
    arr = np.array([boxes[i] for i in idx], dtype=float)
    full = np.stack([np.interp(range(len(boxes)), idx, arr[:, k]) for k in range(arr.shape[1])], axis=1)
    pad = window // 2
    padded = np.pad(full, ((pad, pad), (0, 0)), mode="edge")
    kernel = np.ones(window) / window
    smooth = np.stack([np.convolve(padded[:, k], kernel, mode="valid") for k in range(full.shape[1])], axis=1)
    return smooth.tolist()


def detect_faces(src: Path, width: int, height: int) -> list[list[float] | None]:
    """Har bir kadr uchun eng ishonchli yuz qutisi (x, y, w, h) asl o'lchamda."""
    cv2 = _cv2()
    aw = ANALYSIS_W
    ah = int(round(height * aw / width)) // 2 * 2
    det = cv2.FaceDetectorYN.create(str(ensure_model()), "", (aw, ah), 0.6, 0.3, 5000)
    k = width / aw
    boxes: list[list[float] | None] = []
    for frame in _frames(src, aw, ah):
        _, faces = det.detect(frame)
        if faces is not None and len(faces):
            best = max(faces, key=lambda f: f[-1])
            boxes.append([float(v) * k for v in best[:4]])
        else:
            boxes.append(None)
    return boxes


def _emoji_image(emoji: str, size: int):
    from PIL import Image, ImageDraw, ImageFont

    font_path = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"
    font = ImageFont.truetype(font_path, 109)  # rangli emoji shrifti faqat 109 o'lchamda
    img = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    ImageDraw.Draw(img).text((80, 80), emoji, font=font, embedded_color=True, anchor="mm")
    img = img.crop(img.getbbox()).resize((size, size), Image.LANCZOS)
    rgba = np.array(img)
    return rgba[:, :, 2::-1].copy(), rgba[:, :, 3:4].astype(np.float32) / 255.0


def hide_faces(src: Path, out: Path, mode: str = "blur", emoji: str = "🍂", scale: float = 1.0) -> Path:
    """mode: blur - yumshoq chetli kuchli xiralik, emoji - yuz ustiga emoji."""
    cv2 = _cv2()
    info = ff.probe(src)
    w, h = info.width // 2 * 2, info.height // 2 * 2
    boxes = fill_and_smooth(detect_faces(src, w, h))
    found = sum(b is not None for b in boxes)
    if not found:
        log.warning("    yuz topilmadi - video o'zgarmaydi")
    log.info("    yuz kuzatildi: %d kadr", len(boxes))
    out = out.with_suffix(".mov")
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{w}x{h}",
         "-r", f"{info.fps:.6f}", "-i", "-", "-i", str(src), "-map", "0:v", "-map", "1:a?",
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "14", "-pix_fmt", "yuv420p",
         "-c:a", "pcm_s16le", str(out)],
        stdin=subprocess.PIPE,
    )
    sticker = None
    for i, frame in enumerate(_frames(src, w, h)):
        frame = frame.copy()
        box = boxes[i] if i < len(boxes) else (boxes[-1] if boxes else None)
        if box is not None:
            x, y, bw, bh = box
            cx, cy = x + bw / 2, y + bh * 0.46
            rx, ry = bw * 0.78 * scale, bh * 0.72 * scale  # peshona va iyakni ham qoplaydi
            if mode == "emoji":
                size = int(max(rx, ry) * 2.1)
                if sticker is None or sticker[0].shape[0] != size:
                    sticker = _emoji_image(emoji, size)
                rgb, a = sticker
                x0, y0 = int(cx - size / 2), int(cy - size / 2)
                xs, ys = max(0, x0), max(0, y0)
                xe, ye = min(w, x0 + size), min(h, y0 + size)
                if xe > xs and ye > ys:
                    roi = frame[ys:ye, xs:xe].astype(np.float32)
                    sr, sa = rgb[ys - y0:ye - y0, xs - x0:xe - x0], a[ys - y0:ye - y0, xs - x0:xe - x0]
                    frame[ys:ye, xs:xe] = (roi * (1 - sa) + sr * sa).astype(np.uint8)
            else:
                m = int(max(rx, ry) * 1.6)
                x0, y0 = max(0, int(cx - m)), max(0, int(cy - m))
                x1, y1 = min(w, int(cx + m)), min(h, int(cy + m))
                roi = frame[y0:y1, x0:x1]
                # Kichraytirib-kattalashtirish + Gauss: kuchli, "muzli oyna" kabi xiralik
                small = cv2.resize(roi, (max(1, roi.shape[1] // 12), max(1, roi.shape[0] // 12)),
                                   interpolation=cv2.INTER_AREA)
                blurred = cv2.GaussianBlur(cv2.resize(small, (roi.shape[1], roi.shape[0]),
                                                      interpolation=cv2.INTER_LINEAR), (0, 0), m / 10)
                mask = np.zeros(roi.shape[:2], np.float32)
                cv2.ellipse(mask, (int(cx - x0), int(cy - y0)), (int(rx), int(ry)), 0, 0, 360, 1.0, -1)
                mask = cv2.GaussianBlur(mask, (0, 0), max(rx, ry) * 0.18)[:, :, None]  # yumshoq chet
                frame[y0:y1, x0:x1] = (roi * (1 - mask) + blurred * mask).astype(np.uint8)
        enc.stdin.write(frame.tobytes())
    enc.stdin.close()
    if enc.wait() != 0:
        raise ff.FFmpegError("Yuz yashirilgan videoni yozib bo'lmadi")
    return out
