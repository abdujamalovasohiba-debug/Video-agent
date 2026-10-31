import sys, json, glob, os
from faster_whisper import WhisperModel
import wave, numpy as np
def load(p):
    w=wave.open(p); x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
    return x / (np.abs(x).max() + 1e-9) * 0.9   # sokin yozuvlarda so'zlar yo'qolmasin
m = WhisperModel(sys.argv[1], device="cpu", compute_type="int8")
out = {}
n = len(glob.glob(os.path.join(sys.argv[2], "a*.wav")))
for i in range(1, n + 1):
    segs, info = m.transcribe(load(f"{sys.argv[2]}/a{i}.wav"), language="uz", word_timestamps=True, beam_size=5)
    words = [dict(w=w.word.strip(), s=round(w.start,2), e=round(w.end,2)) for s in segs for w in s.words]
    out[i] = words
    print(i, " ".join(x["w"] for x in words), flush=True)
json.dump(out, open(f"{sys.argv[2]}/words_{sys.argv[1]}.json","w"), ensure_ascii=False, indent=0)
