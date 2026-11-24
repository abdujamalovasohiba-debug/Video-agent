"""Muhim so'zlarni tanlash va ular uchun zoom (punch-in) effektini yaratish."""

from __future__ import annotations

import re
from dataclasses import dataclass

from .transcribe import Word

# O'zbekcha (va inglizcha) yordamchi so'zlar - urg'u berilmaydi.
STOPWORDS = {
    "va", "bilan", "uchun", "ham", "bu", "shu", "u", "men", "sen", "biz", "siz", "ular", "bir", "lekin",
    "ammo", "yoki", "deb", "edi", "ekan", "esa", "da", "ga", "ni", "dan", "mi", "chi", "endi", "juda",
    "qanday", "nima", "nega", "ya'ni", "yaʼni", "agar", "keyin", "oldin", "hozir", "bor", "yo'q", "yoʻq",
    "kerak", "mumkin", "bo'ladi", "boʻladi", "qilib", "qiladi", "shunday", "mana", "hamma", "har", "o'z",
    "oʻz", "bizning", "sizning", "mening", "the", "a", "an", "and", "to", "of", "is", "in", "we", "my",
    "with", "your", "you", "about", "this", "that", "it",
}
# Pauza to'ldiruvchi so'zlar - montajda kesib tashlanishi mumkin.
FILLERS = {"e", "ee", "eee", "eeee", "mm", "mmm", "hmm", "xm", "xmm", "a", "aa", "aaa", "uh", "um", "uhm", "eh"}

_PUNCT = re.compile(r"[^\wʻʼ']+", re.UNICODE)


def normalize(text: str) -> str:
    return _PUNCT.sub("", text.lower().replace("‘", "ʻ").replace("’", "ʼ"))


def filler_spans(words: list[Word]) -> list[tuple[float, float]]:
    return [(w.start, w.end) for w in words if normalize(w.text) in FILLERS]


def score(word: Word) -> float:
    n = normalize(word.text)
    if not n or n in STOPWORDS or n in FILLERS:
        return 0.0
    s = min(len(n), 12) / 12
    if any(c.isdigit() for c in n):
        s += 0.8  # raqamlar odatda muhim (narx, yil, foiz)
    if word.text.rstrip().endswith("!"):
        s += 0.5
    if word.text[:1].isupper():
        s += 0.15
    s += 0.3 * max(0.0, word.end - word.start - 0.35)  # cho'zib aytilgan so'z
    return s * word.probability


@dataclass
class Highlight:
    start: float
    end: float
    word: str


def pick_keywords(words: list[Word], duration: float, per_minute: float, min_gap: float,
                  manual: list[str] | None = None) -> list[Highlight]:
    """Foydalanuvchi bergan so'zlar + avtomatik tanlangan eng 'og'ir' so'zlar."""
    manual_set = {normalize(m) for m in (manual or []) if normalize(m)}
    budget = max(1, int(per_minute * max(duration, 1) / 60))
    chosen: list[Word] = []

    def far_enough(w: Word) -> bool:
        return all(abs(w.start - c.start) >= min_gap for c in chosen)

    for w in words:
        n = normalize(w.text)
        if n and any(n.startswith(m) for m in manual_set) and far_enough(w):
            chosen.append(w)
    if not manual_set or len(chosen) < budget:
        ranked = sorted((w for w in words if score(w) > 0.45), key=score, reverse=True)
        for w in ranked:
            if len(chosen) >= budget:
                break
            if w not in chosen and far_enough(w):
                chosen.append(w)
    for w in chosen:
        w.keyword = True
    return sorted((Highlight(w.start, w.end, w.text) for w in chosen), key=lambda h: h.start)


def zoom_expression(highlights: list[Highlight], zoom: float, ramp: float, hold: float) -> str:
    """z(t) ifodasi: har bir urg'uda silliq zoom-in -> ushlash -> zoom-out."""
    if not highlights or zoom <= 1.0:
        return "1"
    amp = zoom - 1.0
    terms = []
    for h in highlights:
        a = max(0.0, h.start - ramp * 0.5)
        b = a + ramp
        c = max(b, h.end) + hold
        d = c + ramp
        # smoothstep: 3x^2 - 2x^3
        up = f"(3*pow((t-{a:.3f})/{ramp:.3f},2)-2*pow((t-{a:.3f})/{ramp:.3f},3))"
        down = f"(1-3*pow((t-{c:.3f})/{ramp:.3f},2)+2*pow((t-{c:.3f})/{ramp:.3f},3))"
        terms.append(
            f"if(between(t,{a:.3f},{b:.3f}),{up},if(between(t,{b:.3f},{c:.3f}),1,"
            f"if(between(t,{c:.3f},{d:.3f}),{down},0)))"
        )
    # Bir vaqtda bitta urg'u faol bo'ladi (min_gap), shuning uchun max o'rniga yig'indi yetarli.
    return f"1+{amp:.4f}*min(1,{'+'.join(terms)})"
