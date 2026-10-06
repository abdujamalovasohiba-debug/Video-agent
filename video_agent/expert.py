"""'Expert' uslubi (gapiradigan odam videolari): nutqdan avtomatik montaj rejasi.

Reja elementlari (Remotion ExpertOverlay chizadi):
  hook    - boshida krem plashkadagi ikki qatorli sarlavha
  card    - to'liq ekranli jigarrang karta, matn so'zma-so'z chiqadi
  number  - "1/4" raqamli plashka (ro'yxat punktlari)
  caption - kalit so'z (KATTA) + so'zma-so'z chiqadigan qatorlar
  leak    - light leak o'tishi
  flash   - oq flash o'tishi
Reja <video>.plan.json ga saqlanadi: tahrirlab, --plan bilan qayta ishlatish mumkin.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from .highlights import STOPWORDS, normalize
from .transcribe import Word

# Punkt sarlavhasi bo'la olmaydigan umumiy so'zlar
GENERIC = {"sabab", "sababi", "qoida", "qoidasi", "qadam", "usul", "usuli", "punkt", "nuqta", "narsa", "jihat"}
ORDINALS = ["birinchi", "ikkinchi", "uchinchi", "to'rtinchi", "toʻrtinchi", "beshinchi",
            "oltinchi", "yettinchi", "sakkizinchi", "to'qqizinchi", "o'ninchi"]


def _w(word: Word) -> dict:
    return {"w": word.text.strip(), "t": round(word.start, 3)}


def phrases(words: list[Word], max_words: int = 5, max_gap: float = 0.45) -> list[list[Word]]:
    out, cur = [], []
    for w in words:
        if cur and (len(cur) >= max_words or w.start - cur[-1].end > max_gap
                    or cur[-1].text.rstrip()[-1:] in ".!?,;:"):
            out.append(cur)
            cur = []
        cur.append(w)
    if cur:
        out.append(cur)
    # 1-2 so'zlik bo'laklar o'qib bo'lmaydigan darajada qisqa chiqadi:
    # gap oxiridagi qoldiq oldingi iboraga, gap boshidagisi keyingi iboraga qo'shiladi.
    merged: list[list[Word]] = []
    for ph in out:
        prev_open = merged and merged[-1][-1].text.rstrip()[-1:] not in ".!?,;:"
        if merged and len(ph) <= 2 and prev_open and ph[0].start - merged[-1][-1].end <= max_gap:
            merged[-1] = merged[-1] + ph
        else:
            merged.append(ph)
    result: list[list[Word]] = []
    carry: list[Word] = []
    for ph in merged:
        ph = carry + ph
        carry = []
        if len(ph) <= 2 and ph[-1].text.rstrip()[-1:] not in ".!?":
            carry = ph
            continue
        result.append(ph)
    if carry:
        if result:
            result[-1] = result[-1] + carry
        else:
            result.append(carry)
    return result


def split_title(title: str) -> tuple[str, str]:
    """'kichik qator|KATTA QATOR' yoki avtomatik: oxirgi 2-3 so'z katta qatorga."""
    if "|" in title:
        a, b = title.split("|", 1)
        return a.strip(), b.strip()
    ws = title.split()
    k = 2 if len(ws) <= 5 else 3
    return " ".join(ws[:-k]), " ".join(ws[-k:])


def _caption_lines(ph: list[Word]) -> list[dict]:
    first = 1 if len(normalize(ph[0].text)) >= 4 or len(ph) < 3 else 2
    head, rest = ph[:first], ph[first:]
    lines = [{"style": "caps", "words": [{"w": w.text.upper(), "t": round(w.start, 3)} for w in head]}]
    if len(rest) >= 3:
        mid = (len(rest) + 1) // 2
        lines.append({"style": "sans", "align": "left", "words": [_w(w) for w in rest[:mid]]})
        lines.append({"style": "sans", "align": "right", "words": [_w(w) for w in rest[mid:]]})
    elif rest:
        lines.append({"style": "sans", "words": [_w(w) for w in rest]})
    return lines


def _find_points(phs: list[list[Word]], points: list[str]) -> list[int]:
    """Har bir punkt sarlavhasi (yoki 'birinchi', 'ikkinchi'...) qaysi iboradan boshlanishini topadi."""
    found: list[int] = []
    if points:
        for pt in points:
            key = normalize(pt.split()[0])
            for i, ph in enumerate(phs):
                if i in found or (found and i < found[-1]):
                    continue
                if any(normalize(w.text).startswith(key[:max(4, len(key) - 2)]) for w in ph):
                    found.append(i)
                    break
        return found
    for i, ph in enumerate(phs):
        if any(normalize(w.text) in {normalize(o) for o in ORDINALS} for w in ph):
            found.append(i)
    return found


def build_plan(words: list[Word], duration: float, title: str = "", points: list[str] | None = None,
               card_every: float = 11.0, hook_max: float = 4.5) -> list[dict]:
    items: list[dict] = []
    t0 = 0.0
    if title:
        small, big = split_title(title)
        first_end = next((w.end for w in words if w.text.rstrip()[-1:] in ".!?" and w.end > 2.0), hook_max)
        t0 = round(min(hook_max, max(2.5, first_end), duration), 3)
        items.append({"type": "hook", "start": 0.0, "end": t0, "small": small.upper(), "big": big.upper()})
    words = [w for w in words if w.start >= t0 - 0.05]
    phs = phrases(words)
    point_idx = _find_points(phs, points or [])
    total = len(points) if points else len(point_idx)
    used = set()
    # Raqamli punktlar: punkt iborasi + gap oxirigacha (ko'pi bilan 2 ibora)
    ords = {normalize(o) for o in ORDINALS}
    for n, pi in enumerate(point_idx, 1):
        group = [pi]
        while (len(group) < 2 and group[-1] + 1 < len(phs) and group[-1] + 1 not in point_idx
               and phs[group[-1]][-1].text.rstrip()[-1:] not in ".!?"):
            group.append(group[-1] + 1)
        ws = [w for g in group for w in phs[g]]
        body = [w for w in ws if normalize(w.text) not in ords]
        title_ws = [w for w in body if normalize(w.text) not in GENERIC and normalize(w.text) not in STOPWORDS][:1]
        title_words = [_w(w) for w in title_ws]
        if points and n <= len(points):
            # Foydalanuvchi bergan punkt nomi, nutqda shu so'z aytilgan paytda chiqadi
            key = normalize(points[n - 1].split()[0])
            hit = next((w for w in ws if normalize(w.text).startswith(key[:max(4, len(key) - 2)])), ws[0])
            title_ws = [hit]
            title_words = [{"w": t, "t": round(hit.start + i * 0.12, 3)} for i, t in enumerate(points[n - 1].split())]
        title_keys = {normalize(t["w"])[:5] for t in title_words}
        sub_ws = [w for w in body if w.start > (title_ws[0].start if title_ws else 0)
                  and normalize(w.text)[:5] not in title_keys][:4]
        lines = [{"style": "sans", "words": title_words}]
        if sub_ws:
            lines.append({"style": "small", "words": [_w(w) for w in sub_ws]})
        prev_end = phs[pi - 1][-1].end if pi > 0 else t0
        # Plashka sarlavha so'zidan ko'pi bilan 0.6 s oldin chiqadi (bo'sh turib qolmasin)
        first_t = title_words[0]["t"] if title_words else ws[0].start
        start = max(t0, prev_end, first_t - 0.6)
        items.append({"type": "number", "start": round(start, 3), "end": round(ws[-1].end + 0.4, 3),
                      "n": n, "total": max(total, n), "lines": lines})
        used.update(group)
    # Band oraliqlar: plashka oxiridagi 0.4 s "nafas" keyingi iborani to'smasin
    busy = [(it["start"], it["end"] - (0.4 if it["type"] == "number" else 0.0)) for it in items]

    def free(a: float, b: float) -> bool:
        return all(b <= s or a >= e for s, e in busy)

    last_card = t0
    for i, ph in enumerate(phs):
        if i in used:
            continue
        a, b = ph[0].start, ph[-1].end
        nxt = phs[i + 1][0].start if i + 1 < len(phs) else duration
        end = round(min(b + 0.35, nxt), 3)
        if not free(a, b):
            continue
        content = [w for w in ph if normalize(w.text) not in STOPWORDS]
        complete = ph[-1].text.rstrip()[-1:] in ".!?"  # karta faqat tugal fikr bilan
        if a - last_card >= card_every and len(ph) >= 3 and content and complete:
            head = ph[:1] if len(ph[0].text) >= 3 else ph[:2]
            items.append({"type": "card", "start": round(a - 0.05, 3), "end": end, "lines": [
                {"style": "caps", "words": [{"w": w.text.upper(), "t": round(w.start, 3)} for w in head]},
                {"style": "sans", "words": [_w(w) for w in ph[len(head):]]},
            ]})
            # Kartadan keyin video light leak bilan qaytadi
            items.append({"type": "leak", "start": round(end, 3), "dur": 0.9})
            last_card = a
        else:
            items.append({"type": "caption", "start": round(a - 0.05, 3), "end": end, "lines": _caption_lines(ph)})
        busy.append((a, end))
    # Oq flash: har ~15 s da iboralar orasida (karta/punktga to'g'ri kelmasa)
    t = 15.0
    while t < duration - 3:
        gap = next(((p[-1].end, q[0].start) for p, q in zip(phs, phs[1:]) if p[-1].end >= t), None)
        if not gap:
            break
        mid = (gap[0] + gap[1]) / 2
        in_card = any(it["start"] - 0.5 < mid < it["end"] + 0.5 for it in items if it["type"] in ("card", "hook", "number"))
        if not in_card:
            items.append({"type": "flash", "start": round(max(0.0, mid - 0.15), 3), "dur": 0.35})
        t = mid + 15.0
    return _clip_overlaps(sorted(items, key=lambda it: it["start"]))


def _clip_overlaps(items: list[dict]) -> list[dict]:
    """Matnli elementlar bir-birini yopmasligi uchun har birini keyingisining boshigacha qisqartiradi."""
    blocks = [it for it in items if "end" in it]
    for cur, nxt in zip(blocks, blocks[1:]):
        if cur["end"] > nxt["start"]:
            cur["end"] = round(max(cur["start"] + 0.3, nxt["start"]), 3)
    return items


def align_script(text: str, speech: list[tuple[float, float]]) -> list[Word]:
    """Whisper bo'lmasa: tayyor matnni nutq bo'laklariga harflar soniga mutanosib taqsimlaydi."""
    toks = re.findall(r"\S+", text)
    if not toks or not speech:
        return []
    total_speech = sum(e - s for s, e in speech)
    total_chars = sum(len(t) + 1 for t in toks)
    words, si = [], 0
    pos = speech[0][0]
    for tok in toks:
        d = total_speech * (len(tok) + 1) / total_chars
        while si < len(speech) - 1 and pos + d * 0.5 > speech[si][1]:
            si += 1
            pos = max(pos, speech[si][0])
        words.append(Word(tok, round(pos, 3), round(pos + d * 0.9, 3)))
        pos += d
    return words


def caption_top(video: Path, width: int, height: int, default: float = 0.355) -> float:
    """Yuz qayerdaligini aniqlab, matnni yuzdan pastga joylaydi (iyakdan +3%)."""
    try:
        from .faceblur import detect_faces
        boxes = [b for b in detect_faces(video, width, height)[::5] if b is not None]
    except Exception:
        return default
    if not boxes:
        return default
    bottoms = sorted((b[1] + b[3]) / height for b in boxes)
    chin = bottoms[int(len(bottoms) * 0.9) - 1 if len(bottoms) > 1 else 0]  # 90-persentil
    return round(min(0.62, max(default, chin + 0.03)), 3)


def save_plan(items: list[dict], path: Path) -> Path:
    path.write_text(json.dumps({"items": items}, ensure_ascii=False, indent=1), encoding="utf-8")
    return path


def load_plan(path: Path) -> list[dict]:
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    return data["items"] if isinstance(data, dict) else data
