"""Bitta videodan 16:9 va 9:16 formatlarni yasash uchun ffmpeg filtrlari."""

from __future__ import annotations


def reframe_filter(src_w: int, src_h: int, dst_w: int, dst_h: int, mode: str = "blur",
                   focus_x: float = 0.5, inp: str = "[0:v]", out: str = "[rf]") -> str:
    """mode: 'crop' - ekranni to'ldirib qirqish, 'blur' - xira fon ustida to'liq kadr.

    focus_x: qirqishda gorizontal markaz (0=chap, 0.5=o'rta, 1=o'ng).
    """
    src_ar, dst_ar = src_w / src_h, dst_w / dst_h
    if abs(src_ar - dst_ar) / dst_ar < 0.01:
        return f"{inp}scale={dst_w}:{dst_h}:flags=lanczos,setsar=1{out}"
    cover = f"scale={dst_w}:{dst_h}:force_original_aspect_ratio=increase:flags=lanczos"
    fx = min(max(focus_x, 0.0), 1.0)
    crop = f"crop={dst_w}:{dst_h}:(iw-{dst_w})*{fx:.3f}:(ih-{dst_h})/2"
    # Tik videodan gorizontal kadr qirqilsa bosh/oyoq kesilib ketadi -> doim xira fon.
    if mode == "crop" and src_h > src_w and dst_w > dst_h:
        mode = "blur"
    if mode == "crop":
        return f"{inp}{cover},{crop},setsar=1{out}"
    # Xira fon: kichraytirib xiralash (tez), keyin kattalashtirish.
    bw, bh = dst_w // 4 // 2 * 2, dst_h // 4 // 2 * 2
    return (
        f"{inp}split=2[rf_bg][rf_fg];"
        f"[rf_bg]scale={bw}:{bh}:force_original_aspect_ratio=increase,crop={bw}:{bh},"
        f"gblur=sigma=12,eq=brightness=-0.08:saturation=1.2,scale={dst_w}:{dst_h}[rf_bgb];"
        f"[rf_fg]scale={dst_w}:{dst_h}:force_original_aspect_ratio=decrease:flags=lanczos[rf_fgs];"
        f"[rf_bgb][rf_fgs]overlay=(W-w)/2:(H-h)/2,setsar=1{out}"
    )
