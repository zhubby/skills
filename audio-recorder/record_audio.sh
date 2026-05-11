#!/bin/bash
# Audio recording script using ffmpeg
# Usage: ./record_audio.sh [duration_seconds] [output_filename]

set -e

# Default parameters
DURATION=${1:-30}
OUTPUT=${2:-audio_$(date +%Y%m%d_%H%M%S).mp3}
WORKSPACE="${KLAW_WORKSPACE:-/Users/zhubby/.klaw/workspace}"

echo "🎤 Audio recording started"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Duration: ${DURATION} seconds"
echo "Output: ${WORKSPACE}/${OUTPUT}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg not found, installing..."
    brew install ffmpeg
fi

# List audio devices
echo ""
echo "🔍 Detecting audio devices..."
ffmpeg -f avfoundation -list_devices true -i "" 2>&1 | grep -i audio || true

echo ""
echo "🎬 Recording... Please speak now."
echo "⏱️  Duration: ${DURATION} seconds"
echo ""

# Record audio (:1 = default microphone)
ffmpeg -t "$DURATION" \
  -f avfoundation \
  -i ":1" \
  -c:a libmp3lame \
  -b:a 192k \
  -ac 1 \
  -ar 44100 \
  -y \
  "${WORKSPACE}/${OUTPUT}" 2>/dev/null

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Recording complete!"
echo "📁 File: ${WORKSPACE}/${OUTPUT}"
echo "📊 Size: $(ls -lh "${WORKSPACE}/${OUTPUT}" | awk '{print $5}')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
