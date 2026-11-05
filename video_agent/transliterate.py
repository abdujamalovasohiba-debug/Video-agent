"""O'zbek kirill -> lotin transliteratsiyasi (Whisper ba'zan kirillda yozadi)."""

from __future__ import annotations

_MAP = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo", "ж": "j", "з": "z",
    "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r",
    "с": "s", "т": "t", "у": "u", "ф": "f", "х": "x", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "sh",
    "ъ": "ʼ", "ы": "i", "ь": "", "э": "e", "ю": "yu", "я": "ya", "ў": "oʻ", "қ": "q", "ғ": "gʻ",
    "ҳ": "h",
}
_VOWELS = set("аеёиоуэюяў")


def cyr_to_lat(text: str) -> str:
    out = []
    for i, ch in enumerate(text):
        low = ch.lower()
        if low not in _MAP:
            out.append(ch)
            continue
        lat = _MAP[low]
        # "е" so'z boshida yoki unlidan keyin "ye" bo'ladi
        if low == "е" and (i == 0 or not text[i - 1].isalpha() or text[i - 1].lower() in _VOWELS):
            lat = "ye"
        if ch.isupper() and lat:
            nxt_upper = i + 1 < len(text) and text[i + 1].isupper()
            lat = lat.upper() if nxt_upper else lat[0].upper() + lat[1:]
        out.append(lat)
    return "".join(out)


def has_cyrillic(text: str) -> bool:
    return any("Ѐ" <= c <= "ӿ" for c in text)
