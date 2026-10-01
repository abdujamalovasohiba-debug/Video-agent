#!/usr/bin/env python3
"""Professional video montaj agenti.

Misollar:
    python agent.py video.mp4 --style reels
    python agent.py video.mp4 --style youtube --music fon.mp3 --title "Yangi dars" --name "Ali Valiyev" --role "Dasturchi"
    python agent.py video.mp4 --formats 9:16 --keywords pul,biznes,2024
    python agent.py video.mp4 --style cinematic --music fon.mp3 --title "Toshkent kuzi"
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

from video_agent.config import FORMATS, STYLES, load_style
from video_agent.pipeline import Options, run


def parse_args(argv=None) -> argparse.Namespace:
    p = argparse.ArgumentParser(
        prog="agent.py",
        description="Video montaj agenti: jimlikni kesish, subtitr, motion grafika, 16:9 + 9:16, ovoz.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__.split("Misollar:")[1] if __doc__ else None,
    )
    p.add_argument("video", type=Path, help="kirish video fayli")
    p.add_argument("--style", choices=list(STYLES), default="reels", help="uslub (standart: reels)")
    p.add_argument("--formats", default=None,
                   help=f"chiqish formatlari, vergul bilan: {','.join(FORMATS)} yoki 'both' (standart: both)")
    p.add_argument("-o", "--output", type=Path, default=Path("output"), help="natijalar papkasi")
    p.add_argument("--config", type=Path, help="qo'shimcha sozlamalar (JSON)")

    g = p.add_argument_group("matn va grafika")
    g.add_argument("--title", help="sarlavha/intro matni (berilmasa nutqdan olinadi)")
    g.add_argument("--subtitle", default="", help="intro ostidagi kichik matn (kanal nomi)")
    g.add_argument("--name", default="", help="pastki yozuv: ism")
    g.add_argument("--role", default="", help="pastki yozuv: lavozim")
    g.add_argument("--handle", default="", help="Instagram @username (belgi va yakuniy karta uchun)")
    g.add_argument("--text-y", type=float, help="estetik matn balandligi 0..1 (masalan 0.15 - yuqorida)")
    g.add_argument("--hide-face", choices=["flowers", "blur", "emoji"],
                   help="yuzni yashirish: flowers - gul buketi, blur - xiralik, emoji - bitta emoji")
    g.add_argument("--face-emoji", default="🌸", help="buket/emoji belgilari, masalan 🌸 yoki 🌼🍁")
    g.add_argument("--cta", help="outro chaqiruvi (standart: \"Obuna bo'ling!\")")
    g.add_argument("--keywords", default="", help="zoom bilan ajratiladigan so'zlar, vergul bilan")
    g.add_argument("--accent", help="asosiy urg'u rangi, masalan #FACC15")
    g.add_argument("--font", help="subtitr shrifti (tizimdagi nomi)")
    g.add_argument("--no-intro", action="store_true")
    g.add_argument("--no-outro", action="store_true")
    g.add_argument("--no-motion", action="store_true", help="motion grafikani o'chirish")
    g.add_argument("--no-subs", action="store_true", help="subtitrni o'chirish")
    g.add_argument("--no-zoom", action="store_true", help="muhim so'zlarda zoomni o'chirish")
    g.add_argument("--renderer", choices=["auto", "remotion", "ffmpeg"], help="motion grafika renderi")

    g = p.add_argument_group("montaj")
    g.add_argument("--no-cut", action="store_true", help="jimliklarni kesmaslik")
    g.add_argument("--keep-fillers", action="store_true", help="'eee', 'mmm' kabi so'zlarni qoldirish")
    g.add_argument("--silence-db", type=float, help="jimlik chegarasi, dB (masalan -35)")
    g.add_argument("--min-silence", type=float, help="kesiladigan eng qisqa pauza, s")
    g.add_argument("--transition", help="o'tish turi (fade, smoothleft, circleopen, ...)")
    g.add_argument("--grade", choices=["none", "cinematic", "moody", "warm", "vivid", "pastel", "bw"],
                   help="rang uslubi (color grading)")
    g.add_argument("--speed", type=float, help="tezlik: 0.85 = sekinroq (kinematik), 1 = asl")
    g.add_argument("--reframe", choices=["blur", "crop"], help="16:9 -> 9:16 usuli")
    g.add_argument("--focus-x", type=float, default=0.5, help="crop markazi 0..1 (standart 0.5)")

    g = p.add_argument_group("ovoz")
    g.add_argument("--music", type=Path, help="fon musiqasi fayli")
    g.add_argument("--music-volume", type=float, help="musiqa darajasi, dB (masalan -18)")
    g.add_argument("--no-denoise", action="store_true", help="shovqin tozalashni o'chirish")
    g.add_argument("--lufs", type=float, help="yakuniy balandlik (standart -14 LUFS)")

    g = p.add_argument_group("whisper")
    g.add_argument("--model", default="medium", help="Whisper modeli: tiny/base/small/medium/large-v3")
    g.add_argument("--language", default="uz", help="nutq tili (standart: uz; 'auto' - avtomatik)")
    g.add_argument("--device", default="auto", help="cpu / cuda / auto")
    g.add_argument("--transcript", type=Path, help="tayyor transkript JSON (qayta ishlatish/tahrirlash uchun)")

    g = p.add_argument_group("boshqa")
    g.add_argument("--draft", action="store_true", help="tez, past sifatli qoralama render")
    g.add_argument("--keep-temp", action="store_true", help="oraliq fayllarni saqlash")
    g.add_argument("-v", "--verbose", action="store_true", help="ffmpeg buyruqlarini ko'rsatish")
    return p.parse_args(argv)


def build_overrides(a: argparse.Namespace) -> dict:
    o: dict = {}

    def put(path: str, value):
        if value is None:
            return
        d = o
        *head, last = path.split(".")
        for k in head:
            d = d.setdefault(k, {})
        d[last] = value

    if a.formats:
        put("formats", list(FORMATS) if a.formats == "both" else [f.strip() for f in a.formats.split(",")])
    put("reframe", a.reframe)
    put("look.grade", a.grade)
    put("look.speed", a.speed)
    put("cut.noise_db", a.silence_db)
    put("cut.min_silence", a.min_silence)
    put("transition.type", a.transition)
    put("captions.font", a.font)
    put("motion.renderer", a.renderer)
    put("motion.cta", a.cta)
    put("motion.text_y", a.text_y)
    put("audio.music_volume_db", a.music_volume)
    put("audio.target_lufs", a.lufs)
    if a.accent:
        put("motion.accent", a.accent)
        put("captions.highlight", a.accent)
    if a.no_subs:
        put("captions.enabled", False)
    if a.no_zoom:
        put("highlight.enabled", False)
    if a.no_motion:
        put("motion.enabled", False)
    if a.no_intro:
        put("motion.intro", False)
    if a.no_outro:
        put("motion.outro", False)
    if a.no_denoise:
        put("audio.denoise", False)
    if a.draft:
        put("preset", "ultrafast")
        put("crf", 28)
    return o


def main(argv=None) -> int:
    a = parse_args(argv)
    logging.basicConfig(level=logging.DEBUG if a.verbose else logging.INFO, format="%(message)s")
    log = logging.getLogger("video_agent")
    try:
        style = load_style(a.style, build_overrides(a), a.config)
        if a.music and not a.music.exists():
            raise FileNotFoundError(f"Musiqa fayli topilmadi: {a.music}")
        log.info("🎬 Video agent | uslub: %s | formatlar: %s", style.name, ", ".join(style.formats))
        result = run(Options(
            input=a.video, style=style, output_dir=a.output, music=a.music, title=a.title,
            subtitle=a.subtitle, name=a.name, role=a.role, handle=a.handle,
            keywords=[k.strip() for k in a.keywords.split(",") if k.strip()],
            transcript=a.transcript, whisper_model=a.model,
            language=None if a.language == "auto" else a.language, device=a.device,
            cut=not a.no_cut, remove_fillers=not a.keep_fillers, focus_x=a.focus_x, keep_temp=a.keep_temp,
            hide_face=a.hide_face, face_emoji=a.face_emoji,
        ))
    except KeyboardInterrupt:
        log.error("To'xtatildi.")
        return 130
    except Exception as e:  # foydalanuvchiga tushunarli xabar
        if a.verbose:
            raise
        log.error("❌ Xato: %s", e)
        return 1
    log.info("\n✅ Tayyor! %.1fs -> %.1fs, %d bo'lak", result.original_duration, result.edited_duration,
             result.segments)
    for fmt, path in result.outputs.items():
        log.info("   %s: %s", fmt, path)
    if result.srt:
        log.info("   subtitr: %s", result.srt)
    if result.transcript:
        log.info("   transkript: %s  (tahrirlab, --transcript bilan qayta ishlating)", result.transcript)
    return 0


if __name__ == "__main__":
    sys.exit(main())
