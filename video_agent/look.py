"""Kadr ko'rinishi: rang uslubi (color grading), vinyetka, plyonka donadorligi, fade."""

from __future__ import annotations

from .config import LookConfig

GRADES = {
    "none": "",
    # Iliq yorug'lik, sovuqroq soyalar (teal & orange), yumshoq kontrast, ko'tarilgan qora.
    "cinematic": ("curves=master='0/0.04 0.25/0.21 0.5/0.5 0.75/0.79 1/0.96',"
                  "colorbalance=rs=-0.03:gs=0.0:bs=0.05:rm=0.03:gm=0.0:bm=-0.03:rh=0.06:gh=0.02:bh=-0.06,"
                  "eq=saturation=0.88:contrast=1.04"),
    "warm": "colorbalance=rm=0.06:bm=-0.05:rh=0.05:bh=-0.04,eq=saturation=1.05",
    "vivid": "eq=saturation=1.3:contrast=1.08,unsharp=5:5:0.4",
    "pastel": "curves=master='0/0.08 1/0.95',eq=saturation=0.75:brightness=0.03",
    "bw": "hue=s=0,curves=preset=medium_contrast",
}


def look_filters(cfg: LookConfig, duration: float) -> list[str]:
    if cfg.grade not in GRADES:
        raise ValueError(f"Noma'lum rang uslubi '{cfg.grade}'. Mavjud: {', '.join(GRADES)}")
    out = [GRADES[cfg.grade]] if GRADES[cfg.grade] else []
    if cfg.vignette > 0:
        # angle kattaroq -> kuchliroq vinyetka (PI/5 ~ yumshoq)
        out.append(f"vignette=angle={0.2 + 0.6 * min(cfg.vignette, 1.0):.3f}")
    if cfg.grain > 0:
        out.append(f"noise=alls={int(cfg.grain)}:allf=t")
    if cfg.fade_in > 0:
        out.append(f"fade=t=in:st=0:d={cfg.fade_in:.2f}")
    if cfg.fade_out > 0 and duration > cfg.fade_out:
        out.append(f"fade=t=out:st={duration - cfg.fade_out:.3f}:d={cfg.fade_out:.2f}")
    return out
