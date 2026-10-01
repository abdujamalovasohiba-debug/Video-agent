"""Uslub (style) presetlari va format o'lchamlari."""

from __future__ import annotations

import copy
import json
from dataclasses import dataclass, field, fields, asdict
from pathlib import Path

FORMATS = {
    "16:9": (1920, 1080),  # YouTube
    "9:16": (1080, 1920),  # Reels / Shorts / TikTok
}


@dataclass
class CutConfig:
    noise_db: float = -35.0       # shundan past ovoz "jimlik" hisoblanadi
    min_silence: float = 0.45     # shundan qisqa pauzalar qoldiriladi
    padding: float = 0.12         # nutq atrofida qoldiriladigan zaxira (s)
    min_segment: float = 0.25     # juda qisqa bo'laklar tashlab yuboriladi


@dataclass
class TransitionConfig:
    type: str = "fade"            # ffmpeg xfade turi: fade, smoothleft, circleopen...
    duration: float = 0.12        # kesimlar orasidagi o'tish (s)
    edge_duration: float = 0.5    # intro/outro o'tishi (s)


@dataclass
class CaptionConfig:
    enabled: bool = True
    font: str = "DejaVu Sans"
    size: int = 92                # 1080 piksel balandlikdagi qisqa tomon uchun
    uppercase: bool = True
    max_words: int = 3            # bir ekrandagi so'zlar soni
    max_chars: int = 22
    color: str = "#FFFFFF"
    highlight: str = "#FACC15"    # aktiv so'z rangi
    keyword_color: str = "#22D3EE"
    outline: int = 6
    shadow: int = 3
    position: float = 0.68        # 9:16 da ekran balandligiga nisbatan (0=yuqori, 1=past)
    position_wide: float = 0.84   # 16:9 da
    pop: float = 1.18             # aktiv so'z kattalashuvi


@dataclass
class HighlightConfig:
    enabled: bool = True
    zoom: float = 1.12            # muhim so'zda zoom darajasi
    per_minute: float = 6.0       # bir daqiqadagi maksimal urg'ular
    min_gap: float = 4.0          # urg'ular orasidagi minimal masofa (s)
    hold: float = 0.6             # zoom ushlanib turish vaqti (s)
    ramp: float = 0.18            # zoomga kirish/chiqish (s)


@dataclass
class MotionConfig:
    enabled: bool = True
    renderer: str = "auto"        # auto | remotion | ffmpeg
    intro: bool = True
    outro: bool = True
    intro_duration: float = 2.5
    outro_duration: float = 3.0
    title_duration: float = 3.5
    title_start: float = 0.3
    lower_third_start: float = 1.0
    lower_third_duration: float = 4.5
    primary: str = "#1E1B4B"
    accent: str = "#FACC15"
    text_color: str = "#FFFFFF"
    cta: str = "Obuna bo'ling!"


@dataclass
class AudioConfig:
    denoise: bool = True
    denoise_strength: float = 12.0  # afftdn nr (dB)
    target_lufs: float = -14.0
    music_volume_db: float = -8.0   # nutqqa nisbatan musiqa darajasi (nutq paytida yana ~14 dB pasayadi)
    duck_ratio: float = 8.0         # nutq paytida musiqani qanchalik bosish
    duck_threshold: float = 0.03
    music_fade: float = 1.5


@dataclass
class StyleConfig:
    name: str = "reels"
    formats: list[str] = field(default_factory=lambda: ["16:9", "9:16"])
    reframe: str = "blur"           # 16:9 -> 9:16: blur (xira fon) | crop (markazdan qirqish)
    fps: int = 30
    crf: int = 20
    preset: str = "medium"
    cut: CutConfig = field(default_factory=CutConfig)
    transition: TransitionConfig = field(default_factory=TransitionConfig)
    captions: CaptionConfig = field(default_factory=CaptionConfig)
    highlight: HighlightConfig = field(default_factory=HighlightConfig)
    motion: MotionConfig = field(default_factory=MotionConfig)
    audio: AudioConfig = field(default_factory=AudioConfig)

    def to_dict(self) -> dict:
        return asdict(self)


def _reels() -> StyleConfig:
    s = StyleConfig(name="reels", reframe="crop")
    s.cut.min_silence = 0.35
    s.cut.padding = 0.08
    return s


def _youtube() -> StyleConfig:
    s = StyleConfig(name="youtube", reframe="blur")
    s.cut.min_silence = 0.6
    s.cut.padding = 0.15
    s.transition.duration = 0.2
    s.captions.size = 64
    s.captions.uppercase = False
    s.captions.max_words = 6
    s.captions.max_chars = 38
    s.captions.position = 0.74
    s.captions.position_wide = 0.87
    s.captions.pop = 1.08
    s.highlight.zoom = 1.07
    s.highlight.per_minute = 3.0
    s.audio.music_volume_db = -10.0
    return s


def _minimal() -> StyleConfig:
    s = StyleConfig(name="minimal", reframe="blur")
    s.cut.min_silence = 0.8
    s.transition.type = "fade"
    s.captions.size = 58
    s.captions.uppercase = False
    s.captions.max_words = 7
    s.captions.max_chars = 42
    s.captions.highlight = "#FFFFFF"
    s.captions.keyword_color = "#FFFFFF"
    s.captions.pop = 1.0
    s.captions.position = 0.76
    s.captions.position_wide = 0.89
    s.highlight.enabled = False
    s.motion.intro = False
    s.motion.outro = False
    s.audio.music_volume_db = -12.0
    return s


STYLES = {"reels": _reels, "youtube": _youtube, "minimal": _minimal}


def _merge(obj, data: dict):
    """Dataclass ichiga lug'atdan qiymatlarni (ichma-ich) yozadi."""
    names = {f.name for f in fields(obj)}
    for key, value in data.items():
        if key not in names:
            raise ValueError(f"Noma'lum sozlama: {key}")
        cur = getattr(obj, key)
        if hasattr(cur, "__dataclass_fields__") and isinstance(value, dict):
            _merge(cur, value)
        else:
            setattr(obj, key, copy.deepcopy(value))
    return obj


def load_style(name: str, overrides: dict | None = None, config_path: str | Path | None = None) -> StyleConfig:
    if name not in STYLES:
        raise ValueError(f"Noma'lum uslub '{name}'. Mavjud: {', '.join(STYLES)}")
    style = STYLES[name]()
    if config_path:
        _merge(style, json.loads(Path(config_path).read_text(encoding="utf-8")))
    if overrides:
        _merge(style, overrides)
    for f in style.formats:
        if f not in FORMATS:
            raise ValueError(f"Noma'lum format '{f}'. Mavjud: {', '.join(FORMATS)}")
    return style
