# Mavzuga oid qidiruvlardan bir muallif (bitta suratga olish) kadrlarini guruhlaydi
import json, os, sys, re, glob, urllib.parse, urllib.request, collections
key = os.environ["PIXABAY_KEY"]
used = set()
for f in glob.glob('/home/user/Video-agent/reels/**/project.json', recursive=True):
    for b in json.load(open(f)).get('broll', []):
        used.add(int(re.search(r'px_(\d+)', b['file']).group(1)))
by = collections.defaultdict(dict)
for q in sys.argv[1:]:
    for page in (1, 2):
        url = "https://pixabay.com/api/videos/?" + urllib.parse.urlencode(dict(key=key, q=q, per_page=100, page=page, safesearch="true"))
        try: hits = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=30))["hits"]
        except Exception: break
        for h in hits:
            if "ai generated" in h["tags"] or "generated" in h["tags"] or "3d" in h["tags"] or "cartoon" in h["tags"] or h["id"] in used: continue
            by[h["user"]][h["id"]] = (h["videos"]["large"]["width"] or h["videos"]["medium"]["width"], h["tags"][:70])
for u, v in sorted(by.items(), key=lambda x: -len(x[1]))[:15]:
    print(f"## {u} ({len(v)})")
    for i, (w, t) in sorted(v.items()): print(f"   {i} w{w} {t}")
