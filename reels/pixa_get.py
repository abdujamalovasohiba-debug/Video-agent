import json, os, sys, time, urllib.request
K = os.environ["PIXABAY_KEY"]; H = {"User-Agent": "Mozilla/5.0"}
os.makedirs('broll', exist_ok=True)
for id in sys.argv[1:]:
    p = f'broll/px_{id}.mp4'
    if os.path.exists(p) and os.path.getsize(p) > 100000: continue
    m = json.load(urllib.request.urlopen(urllib.request.Request(f"https://pixabay.com/api/videos/?key={K}&id={id}", headers=H)))
    v = m['hits'][0]['videos']; k0 = next(k for k in ('large', 'medium') if v[k]['url'] and v[k]['width'])
    for a in range(6):
        try: d = urllib.request.urlopen(urllib.request.Request(v[k0]['url'], headers=H), timeout=180).read()
        except Exception as e: print(id, e); d = b''
        if len(d) > 100000: open(p, 'wb').write(d); print(id, v[k0]['width'], v[k0]['height'], flush=True); break
        time.sleep(20 * (a + 1))
    time.sleep(6)
