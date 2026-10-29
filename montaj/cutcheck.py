"""Kesish nuqtalarini tekshirish: gap boshi/oxiri kesilmaganini ko'radi.

Foydalanish: python3 montaj/cutcheck.py projects/<nom>/edit.json
"""
import json,sys,os,subprocess,numpy as np
p=sys.argv[1]; c=json.load(open(p)); base=os.path.dirname(p)
cache={}
def env(clip,t):
    if clip not in cache:
        raw=subprocess.run(["ffmpeg","-v","error","-i",os.path.join(base,c['clips'][clip]),"-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout
        cache[clip]=np.frombuffer(raw,np.int16).astype(float)/32768
    x=cache[clip]; a=int(max(t,0)*16000); seg=x[a:a+800]
    return 20*np.log10(np.sqrt(np.mean(seg**2))+1e-9) if len(seg) else -99
for s in c['segments']:
    pre=max(env(s['clip'],s['in']-0.05*k) for k in (1,2,3))
    post=max(env(s['clip'],s['out']+0.05*k) for k in (0,1,2))
    flag=("  <-- KIRISH kesilgan?" if pre>-50 else "")+("  <-- OXIRI kesilgan?" if post>-50 else "")
    print(f"{s['clip']} {s['in']:.2f}-{s['out']:.2f}  oldin {pre:5.1f}dB  keyin {post:5.1f}dB{flag}")
