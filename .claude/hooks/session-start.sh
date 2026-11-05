#!/bin/bash
# Claude Code (web) sessiyasi boshlanganda video agent uchun kerakli dasturlarni o'rnatadi.
set -euo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "$CLAUDE_PROJECT_DIR"
pip install -q faster-whisper "opencv-python-headless<5" pillow numpy pytest pyflakes >/dev/null 2>&1 || true
# Shriftlar (libass/ffmpeg uchun)
mkdir -p ~/.fonts && cp -n remotion/public/fonts/*.ttf ~/.fonts/ 2>/dev/null && fc-cache -f >/dev/null 2>&1 || true
# Remotion (motion grafika)
[ -d remotion/node_modules/@remotion/renderer ] || (cd remotion && npm install --no-audit --no-fund >/dev/null 2>&1) || true
