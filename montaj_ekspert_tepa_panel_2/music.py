#!/usr/bin/env python3
"""Original xotirjam fon musiqasi (pianino + pad), mualliflik muammosisiz.
Ishlatish: python3 music.py <davomiylik_soniya> <chiqish.wav>
"""
import sys, wave
import numpy as np

SR = 48000
BPM = 66
BEAT = 60 / BPM
rng = np.random.default_rng(7)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def piano(freq, dur, vel=0.5):
    t = np.arange(int(SR * dur)) / SR
    env = np.exp(-t * 1.8) * (1 - np.exp(-t * 300))
    sig = np.zeros_like(t)
    for h, a in [(1, 1.0), (2, 0.45), (3, 0.18), (4, 0.08), (5, 0.04)]:
        sig += a * np.sin(2 * np.pi * freq * h * t * (1 + 0.0004 * h)) * np.exp(-t * 0.9 * h)
    return vel * sig * env


def pad(freqs, dur):
    t = np.arange(int(SR * dur)) / SR
    att = np.clip(t / 1.6, 0, 1)
    rel = np.clip((dur - t) / 1.6, 0, 1)
    sig = np.zeros((len(t), 2))
    for f in freqs:
        for d, ch in [(-0.25, 0), (0.25, 1)]:
            sig[:, ch] += np.sin(2 * np.pi * (f + d) * t) + 0.25 * np.sin(2 * np.pi * 2 * (f + d) * t)
    return sig * (att * rel)[:, None] / len(freqs) * 0.22


def reverb(x):
    # oddiy Schroeder reverb
    out = np.zeros_like(x)
    for ch in range(2):
        y = np.zeros(len(x))
        for dl, g in [(1557, .84), (1617, .83), (1491, .82), (1422, .81), (1277, .8), (1356, .8)]:
            d = dl + ch * 23
            buf = np.copy(x[:, ch])
            for i in range(d, len(buf), d):
                buf[i:i + d] += g * buf[i - d:i][:len(buf[i:i + d])]
            y += buf
        out[:, ch] = y / 6
    return out


def main():
    total = float(sys.argv[1]) + 2.0
    n = int(SR * total)
    mix = np.zeros((n, 2))
    # Am - F - C - G (har akkord 2 takt = 8 zarb)
    prog = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [55, 60, 64]), (55, [55, 59, 62])]
    melody = [[76, 72, 74, 72], [72, 69, 72, 74], [76, 79, 76, 74], [74, 71, 72, 74]]
    bar = 8 * BEAT
    k = 0
    pos = 0.0
    while pos < total:
        root, chord = prog[k % 4]
        s = int(pos * SR)
        p = pad([midi(x - 12) for x in chord] + [midi(root - 24)], bar + 1.0)
        e = min(n, s + len(p))
        mix[s:e] += p[:e - s]
        # arpeggio (chap qo'l) har zarbda
        arp = chord + [chord[1] + 12]
        for b in range(8):
            ts = pos + b * BEAT
            note = arp[[0, 1, 2, 3, 2, 1, 2, 3][b]]
            pn = piano(midi(note), 3.0, 0.16 + 0.03 * rng.random())
            si = int(ts * SR); ei = min(n, si + len(pn))
            if si >= n:
                break
            pan = 0.4 + 0.2 * rng.random()
            mix[si:ei, 0] += pn[:ei - si] * pan
            mix[si:ei, 1] += pn[:ei - si] * (1 - pan)
        # sodda kuy (o'ng qo'l), 2-sikldan boshlab
        if k >= 2:
            for j, note in enumerate(melody[k % 4]):
                ts = pos + j * 2 * BEAT
                pn = piano(midi(note), 4.0, 0.22)
                si = int(ts * SR); ei = min(n, si + len(pn))
                if si >= n:
                    break
                mix[si:ei] += pn[:ei - si, None] * 0.5
        pos += bar
        k += 1
    mix = mix + 0.35 * reverb(mix)
    t = np.arange(n) / SR
    fade = np.clip(t / 2.0, 0, 1) * np.clip((total - 2.0 - t) / 3.0, 0, 1)
    mix *= fade[:, None]
    mix = np.tanh(mix / np.max(np.abs(mix)) * 1.2) * 0.8
    pcm = (mix * 32767).astype(np.int16)
    with wave.open(sys.argv[2], "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    main()
