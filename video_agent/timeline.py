"""Kesilgan bo'laklar va vaqtni asl videodan yangi videoga o'tkazish.

Bo'laklar xfade bilan ulanadi, shuning uchun har bir ulanishda ``T`` soniya
ustma-ust tushadi: i-bo'lakning yangi boshlanishi = sum(d_j, j<i) - i*T.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Segment:
    start: float
    end: float

    @property
    def duration(self) -> float:
        return self.end - self.start


class Timeline:
    def __init__(self, segments: list[Segment], transition: float = 0.0):
        if not segments:
            raise ValueError("Timeline bo'sh bo'lishi mumkin emas")
        self.segments = segments
        self.transition = transition
        self.out_starts: list[float] = []
        t = 0.0
        for i, seg in enumerate(segments):
            self.out_starts.append(t)
            t += seg.duration - (transition if i < len(segments) - 1 else 0.0)
        self.duration = t

    def map_time(self, t: float) -> float | None:
        """Asl vaqtni yangi vaqtga o'tkazadi. Kesilgan joy bo'lsa None."""
        for seg, out in zip(self.segments, self.out_starts):
            if seg.start - 1e-6 <= t <= seg.end + 1e-6:
                return out + (t - seg.start)
        return None

    def map_span(self, start: float, end: float) -> tuple[float, float] | None:
        """So'z oralig'ini o'tkazadi. So'z qisman kesilgan bo'lsa saqlangan qismiga qisqartiriladi."""
        best = None
        for seg, out in zip(self.segments, self.out_starts):
            s, e = max(start, seg.start), min(end, seg.end)
            if e - s > 1e-6:
                span = (out + s - seg.start, out + e - seg.start)
                if best is None or span[1] - span[0] > best[1] - best[0]:
                    best = span
        return best


def invert(silences: list[tuple[float, float]], duration: float) -> list[Segment]:
    """Jimlik oraliqlaridan nutq (saqlanadigan) oraliqlarini oladi."""
    out, cur = [], 0.0
    for s, e in sorted(silences):
        if s > cur:
            out.append(Segment(cur, s))
        cur = max(cur, e)
    if cur < duration:
        out.append(Segment(cur, duration))
    return out


def subtract(segments: list[Segment], holes: list[tuple[float, float]]) -> list[Segment]:
    """Bo'laklardan berilgan oraliqlarni (masalan, 'eee' so'zlari) olib tashlaydi."""
    result = list(segments)
    for hs, he in holes:
        nxt = []
        for seg in result:
            if he <= seg.start or hs >= seg.end:
                nxt.append(seg)
                continue
            if hs > seg.start:
                nxt.append(Segment(seg.start, hs))
            if he < seg.end:
                nxt.append(Segment(he, seg.end))
        result = nxt
    return result


def build_keep_segments(
    silences: list[tuple[float, float]],
    duration: float,
    padding: float,
    min_segment: float,
    remove: list[tuple[float, float]] | None = None,
    fps: float = 30.0,
) -> list[Segment]:
    """Jimliklarni kesib, nutq atrofida padding qoldiradi va bo'laklarni kadrga moslaydi."""
    speech = invert(silences, duration)
    if remove:
        speech = subtract(speech, remove)
    padded: list[Segment] = []
    for seg in speech:
        s, e = max(0.0, seg.start - padding), min(duration, seg.end + padding)
        if padded and s <= padded[-1].end:
            padded[-1] = Segment(padded[-1].start, max(e, padded[-1].end))
        else:
            padded.append(Segment(s, e))
    snapped = []
    for seg in padded:
        s = round(seg.start * fps) / fps
        e = min(round(seg.end * fps) / fps, duration)
        if e - s >= min_segment:
            snapped.append(Segment(s, e))
    return snapped or [Segment(0.0, duration)]
