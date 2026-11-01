# sheet.sh out.png id...  - har bir kadrdan vertikal (markaz) kesilgan 6 ta lavha
out=$1; shift; rows=""
for id in "$@"; do f=broll/px_$id.mp4; d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $f)
 ffmpeg -v error -y -i $f -vf "fps=6/$d,scale=150:267:force_original_aspect_ratio=increase,crop=150:267,drawtext=text='$id':fontsize=14:fontcolor=yellow:box=1:boxcolor=black,tile=6x1" -frames:v 1 broll/s_$id.png; rows="$rows -i broll/s_$id.png"; done
n=$#; ffmpeg -v error -y $rows -filter_complex vstack=$n $out
