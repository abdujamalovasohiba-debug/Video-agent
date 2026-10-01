"""Whisper bilan nutqni so'zma-so'z vaqt belgilari bilan matnga aylantirish."""

from __future__ import annotations

import json
import logging
from dataclasses import asdict, dataclass
from pathlib import Path

from . import ffmpeg_utils as ff
from .transliterate import cyr_to_lat, has_cyrillic

log = logging.getLogger("video_agent")

# Whisper'ni o'zbek lotin yozuviga yo'naltiruvchi boshlang'ich matn.
UZ_PROMPT = "Assalomu alaykum, aziz do'stlar! Bugun sizlarga o'zbek tilida qiziqarli ma'lumot beraman."


@dataclass
class Word:
    text: str
    start: float
    end: float
    probability: float = 1.0
    keyword: bool = False


def save_words(words: list[Word], path: Path, language: str) -> None:
    path.write_text(json.dumps({"language": language, "words": [asdict(w) for w in words]},
                               ensure_ascii=False, indent=1), encoding="utf-8")


def load_words(path: Path) -> list[Word]:
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    items = data["words"] if isinstance(data, dict) else data
    words = [Word(text=str(w["text"]).strip(), start=float(w["start"]), end=float(w["end"]),
                  probability=float(w.get("probability", 1.0))) for w in items]
    return [w for w in words if w.text]


def extract_audio(src: Path, out: Path) -> Path:
    ff.run(["-i", src, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", out])
    return out


def _clean(words: list[Word], latin: bool) -> list[Word]:
    out = []
    for w in words:
        text = w.text.strip()
        if latin and has_cyrillic(text):
            text = cyr_to_lat(text)
        text = text.replace("‘", "ʻ").replace("`", "ʻ")
        if text:
            out.append(Word(text, round(w.start, 3), round(max(w.end, w.start + 0.05), 3), w.probability))
    return out


def _faster_whisper(audio: Path, model: str, language: str | None, device: str) -> list[Word]:
    from faster_whisper import WhisperModel

    compute = "float16" if device == "cuda" else "int8"
    m = WhisperModel(model, device=device, compute_type=compute)
    segments, info = m.transcribe(
        str(audio), language=language, word_timestamps=True, vad_filter=True, beam_size=5,
        initial_prompt=UZ_PROMPT if language == "uz" else None,
    )
    words = []
    for seg in segments:
        for w in seg.words or []:
            words.append(Word(w.word, w.start, w.end, w.probability))
    log.info("Aniqlangan til: %s (%.0f%%)", info.language, info.language_probability * 100)
    return words


def _openai_whisper(audio: Path, model: str, language: str | None, device: str) -> list[Word]:
    import whisper

    m = whisper.load_model(model, device=None if device == "auto" else device)
    result = m.transcribe(str(audio), language=language, word_timestamps=True,
                          initial_prompt=UZ_PROMPT if language == "uz" else None)
    return [Word(w["word"], w["start"], w["end"], w.get("probability", 1.0))
            for seg in result["segments"] for w in seg.get("words", [])]


def transcribe(audio: Path, model: str = "medium", language: str | None = "uz",
               device: str = "auto", latin: bool = True) -> list[Word]:
    """faster-whisper (tezroq) yoki openai-whisper orqali transkripsiya."""
    errors = []
    if device == "auto":
        try:
            import torch  # noqa: F401
            device = "cuda" if torch.cuda.is_available() else "cpu"
        except ImportError:
            device = "cpu"
    for name, fn in (("faster-whisper", _faster_whisper), ("openai-whisper", _openai_whisper)):
        try:
            log.info("Whisper (%s, model=%s, til=%s) ishga tushdi...", name, model, language or "auto")
            return _clean(fn(audio, model, language, device), latin)
        except ImportError as e:
            errors.append(f"{name}: {e}")
    raise RuntimeError(
        "Whisper o'rnatilmagan. O'rnating: pip install faster-whisper  (yoki openai-whisper)\n"
        + "\n".join(errors)
    )
