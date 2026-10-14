"""TikTok/Reels uslubidagi so'zma-so'z animatsiyali subtitrlar (ASS formatida)."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .config import CaptionConfig
from .transcribe import Word


def ass_color(hex_color: str, alpha: int = 0) -> str:
    h = hex_color.lstrip("#")
    r, g, b = h[0:2], h[2:4], h[4:6]
    return f"&H{alpha:02X}{b}{g}{r}".upper()


def ass_time(t: float) -> str:
    t = max(0.0, t)
    cs = int(round(t * 100))
    h, cs = divmod(cs, 360000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def _escape(text: str) -> str:
    return text.replace("\\", "").replace("{", "(").replace("}", ")").replace("\n", " ")


@dataclass
class Chunk:
    words: list[Word]

    @property
    def start(self) -> float:
        return self.words[0].start

    @property
    def end(self) -> float:
        return self.words[-1].end


def chunk_words(words: list[Word], max_words: int, max_chars: int, max_gap: float = 0.6) -> list[Chunk]:
    """So'zlarni ekranga sig'adigan kichik guruhlarga bo'ladi."""
    chunks: list[Chunk] = []
    cur: list[Word] = []
    for w in words:
        if cur:
            chars = sum(len(x.text) + 1 for x in cur) + len(w.text)
            sentence_end = cur[-1].text.rstrip()[-1:] in ".!?,;:"
            if len(cur) >= max_words or chars > max_chars or w.start - cur[-1].end > max_gap or sentence_end:
                chunks.append(Chunk(cur))
                cur = []
        cur.append(w)
    if cur:
        chunks.append(Chunk(cur))
    return chunks


def build_ass(words: list[Word], cfg: CaptionConfig, width: int, height: int) -> str:
    unit = min(width, height) / 1080
    size = round(cfg.size * unit)
    outline = max(1, round(cfg.outline * unit))
    shadow = round(cfg.shadow * unit)
    margin = round(60 * unit)
    x, y = width // 2, round(height * (cfg.position if height > width else cfg.position_wide))
    pop = round(cfg.pop * 100)
    white, hi, kw = ass_color(cfg.color), ass_color(cfg.highlight), ass_color(cfg.keyword_color)

    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {width}
PlayResY: {height}
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,{cfg.font},{size},{white},{hi},&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,{outline},{shadow},5,{margin},{margin},{margin},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines = []
    chunks = chunk_words(words, cfg.max_words, cfg.max_chars)
    for ci, chunk in enumerate(chunks):
        nxt = chunks[ci + 1].start if ci + 1 < len(chunks) else None
        chunk_end = chunk.end + 0.25
        if nxt is not None:
            # Qisqa bo'shliqda subtitr "miltillamasligi" uchun keyingi guruhgacha cho'zamiz.
            chunk_end = nxt if nxt - chunk.end < 0.4 else min(chunk_end, nxt)
        for wi, active in enumerate(chunk.words):
            start = chunk.start if wi == 0 else active.start
            end = chunk.words[wi + 1].start if wi + 1 < len(chunk.words) else chunk_end
            if end - start < 0.02:
                continue
            parts = []
            for j, w in enumerate(chunk.words):
                text = _escape(w.text.upper() if cfg.uppercase else w.text)
                base = kw if w.keyword else white
                if j == wi:
                    color = kw if w.keyword else hi
                    p = pop + (8 if w.keyword else 0)
                    parts.append(
                        f"{{\\c{color}\\fscx100\\fscy100\\t(0,90,\\fscx{p}\\fscy{p})"
                        f"\\t(90,180,\\fscx{p - 6}\\fscy{p - 6})}}{text}"
                        f"{{\\c{base}\\fscx100\\fscy100}}"
                    )
                else:
                    parts.append(f"{{\\c{base}}}{text}" if w.keyword else text)
            # Guruh ekranga chiqqanda pastdan yuqoriga "sakrab" chiqadi.
            intro = f"\\move({x},{y + round(18 * unit)},{x},{y},0,90)\\fad(70,0)" if wi == 0 else f"\\pos({x},{y})"
            lines.append(
                f"Dialogue: 0,{ass_time(start)},{ass_time(end)},Caption,,0,0,0,,{{{intro}}}" + " ".join(parts)
            )
    return header + "\n".join(lines) + "\n"


def write_ass(words: list[Word], cfg: CaptionConfig, width: int, height: int, out: Path) -> Path:
    out.write_text(build_ass(words, cfg, width, height), encoding="utf-8")
    return out


def write_srt(words: list[Word], out: Path, max_words: int = 7, max_chars: int = 42) -> Path:
    """Platformalarga yuklash uchun oddiy SRT ham chiqariladi."""
    def ts(t: float) -> str:
        ms = int(round(max(0.0, t) * 1000))
        h, ms = divmod(ms, 3600000)
        m, ms = divmod(ms, 60000)
        s, ms = divmod(ms, 1000)
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

    blocks = []
    for i, c in enumerate(chunk_words(words, max_words, max_chars), 1):
        blocks.append(f"{i}\n{ts(c.start)} --> {ts(c.end)}\n{' '.join(w.text for w in c.words)}\n")
    out.write_text("\n".join(blocks), encoding="utf-8")
    return out
