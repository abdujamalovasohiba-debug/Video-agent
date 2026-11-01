import json, os, sys, re, glob, urllib.parse, urllib.request
key = os.environ["PIXABAY_KEY"]
used = set()
for f in glob.glob('/home/user/Video-agent/reels/**/project.json', recursive=True):
    for b in json.load(open(f)).get('broll', []):
        used.add(int(re.search(r'px_(\d+)', b['file']).group(1)))
for q in sys.argv[1:]:
    url = "https://pixabay.com/api/videos/?" + urllib.parse.urlencode(dict(key=key, q=q, per_page=80, safesearch="true"))
    hits = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=30))["hits"]
    out = []
    for h in hits:
        m = h["videos"]["medium"]
        if h["id"] in used: continue
        v = "V" if m["height"] > m["width"] else "h"
        out.append(f'{h["id"]}{v}{h["duration"]}:{",".join(h["tags"].split(", ")[:4])}')
    print(f"== {q}: " + " | ".join(out[:7]))
