import subprocess, json
P=[(14.47,15.22),(25.64,26.38),(39.74,40.48),(50.40,51.16),(54.55,56.17),(59.68,60.64),(69.11,69.78),(79.32,80.69),(82.77,84.28),(86.22,86.83),(90.32,91.36),(97.56,98.31),(99.24,99.89),(108.98,109.64),(113.29,114.13),(117.72,118.48)]
A=0.22; Bm=0.12; END=120.3
segs=[]; s=0.0
for a,b in P:
    segs.append((s,a+A)); s=b-Bm
segs.append((s,END))
m=[]; T=0
for a,b in segs: m.append([a,b,T]); T+=b-a
json.dump(m,open('cutmap.json','w'))
def fwd(t):
    for a,b,t0 in m:
        if t<=b: return t0+max(0,t-a)
    a,b,t0=m[-1]; return t0+b-a
TOP=[(0,"6144",2,.5),(8.6,"33379",0.5,.6),(15.2,"45556",2,.5),(20,"47501",3,.45),(25.6,"16075",0.3,.4),(31,"2856",1,.5),(35.4,"51399",2,.5),(40.5,"45983",1,.45),
     (45,"8739",1,.5),(51,"4534",0.5,.55),(60.6,"46708",1,.45),(69.8,"32056",1,.55),(80.6,"8754",1,.5),(86.3,"6213",3,.62),(97.4,"4737",1,.5),(99.9,"47898",1,.5),
     (105,"45555",2,.5),(109.6,"42974",2,.4),(114,"46095",0.2,.5)]
TOTAL=T+0.6
inp=["-i","cat.mov","-i","voice.wav"]; fl=[]
# pastki: gapiruvchi
for k,(a,b) in enumerate(segs):
    y=70 if a>=113.95 else 200
    z=1.0 if k%2==0 else 1.06
    fl.append(f"[0:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS,scale=w='trunc(1080*{z}/2)*2':h=-2,crop=1080:960:(in_w-1080)/2:{y}*{z},setsar=1,format=yuv420p[d{k}]")
    fl.append(f"[1:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st={b-a-0.01:.3f}:d=0.01[a{k}]")
n=len(segs)
fl.append("".join(f"[d{k}]" for k in range(n))+f"concat=n={n}:v=1:a=0,tpad=stop_mode=clone:stop_duration=0.6[bot]")
fl.append("".join(f"[a{k}]" for k in range(n))+f"concat=n={n}:v=0:a=1,apad=pad_dur=0.6[aud]")
# tepa: B-roll
starts=[fwd(t) for t,_,_,_ in TOP]+[TOTAL]
labs=[]; nin=2
for j,(t,c,ss,fx) in enumerate(TOP):
    d=starts[j+1]-starts[j]
    inp+=["-ss",str(ss),"-t",f"{d+0.5:.3f}","-i",f"clips/{c}.mp4"]
    idx=nin; nin+=1
    fl.append(f"[{idx}:v]fps=30,scale=-2:960,crop=1080:960:(in_w-1080)*{fx}:0,setsar=1,tpad=stop_mode=clone:stop_duration=1,trim=0:{d:.3f},setpts=PTS-STARTPTS,format=yuv420p[t{j}]")
    labs.append(f"[t{j}]"); print(c, round(starts[j],2), round(d,2))
fl.append("".join(labs)+f"concat=n={len(labs)}:v=1:a=0[top]")
fl.append("[top][bot]vstack=inputs=2,format=yuv420p[v]")
subprocess.run(["ffmpeg","-v","error","-y",*inp,"-filter_complex",";".join(fl),"-map","[v]","-map","[aud]","-shortest","-c:v","libx264","-crf","16","-preset","veryfast","-c:a","pcm_s16le","split.mov"],check=True)
print("total",round(TOTAL,2))
