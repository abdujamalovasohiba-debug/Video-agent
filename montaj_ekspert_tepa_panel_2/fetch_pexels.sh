#!/bin/bash
# $1=seg $2=pexels id
seg=$1; id=$2
for r in hd_1920_1080 hd_1280_720 uhd_2560_1440 uhd_3840_2160 uhd_4096_2160; do for f in 25 30 24 50 60; do
  u="https://videos.pexels.com/video-files/$id/$id-${r}_${f}fps.mp4"
  c=$(curl -sS -o /dev/null -I -w "%{http_code}" "$u")
  if [ "$c" = 200 ]; then curl -sS -o broll/raw_$seg.mp4 "$u" && echo "$seg $id $u"; exit 0; fi
done; done
u=$(curl -sS -o /dev/null -w "%{redirect_url}" https://www.pexels.com/download/video/$id); curl -sS -o broll/raw_$seg.mp4 "$u"; echo "$seg $id $u"
