#!/bin/bash
# Camera recording script using ffmpeg
# Usage: ./record_camera.sh [duration_seconds] [output_filename]

set -e

# Default parameters
DURATION=${1:-30}
OUTPUT=${2:-video_$(date +%Y%m%d_%H%M%S).mp4}
WORKSPACE="${KLAW_WORKSPACE:-/Users/zhubby/.klaw/workspace}"

echo "📹 Camera recording started"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Duration: ${DURATION} seconds"
echo "Output: ${WORKSPACE}/${OUTPUT}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg not found, installing..."
    brew install ffmpeg
fi

# List available camera devices
echo ""
echo "🔍 Detecting camera devices..."
ffmpeg -f avfoundation -list_devices true -i "" 2>&1 | grep -E "video|camera" || true

echo ""
echo "🎬 Recording... Press Ctrl+C to stop early."
echo ""

# Record video
# 0:none = camera only, no audio
ffmpeg -t "$DURATION" \
  -f avfoundation \
  -i "0:none" \
  -c:v libx264 \
  -preset ultrafast \
  -crf 23 \
  -pix_fmt yuv420p \
  -r 30 \
  "${WORKSPACE}/${OUTPUT}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Recording complete!"
echo "📁 File: ${WORKSPACE}/${OUTPUT}"
echo "📊 Size: $(ls -lh "${WORKSPACE}/${OUTPUT}" | awk '{print $5}')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Output file path for caller
echo "FILE_PATH:${WORKSPACE}/${OUTPUT}"
