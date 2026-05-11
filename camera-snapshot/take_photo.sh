#!/bin/bash
# Photo capture script using imagesnap
# Usage: ./take_photo.sh [output_filename]

set -e

# Default parameters
OUTPUT=${1:-photo_$(date +%Y%m%d_%H%M%S).jpg}
WORKSPACE="${KLAW_WORKSPACE:-/Users/zhubby/.klaw/workspace}"

echo "📸 Photo capture started"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Output: ${WORKSPACE}/${OUTPUT}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if imagesnap is installed
if ! command -v imagesnap &> /dev/null; then
    echo "❌ imagesnap not found, installing..."
    brew install imagesnap
fi

# List camera devices
echo ""
echo "🔍 Detecting camera devices..."
imagesnap -l 2>/dev/null || true

echo ""
echo "📸 Getting ready... Look at the camera!"
echo "⏱️  Capturing in 3 seconds..."
sleep 1
echo "⏱️  2 seconds..."
sleep 1
echo "⏱️  1 second..."
sleep 1
echo "📸 Snap!"

# Take photo
imagesnap -w 1 "${WORKSPACE}/${OUTPUT}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Photo captured!"
echo "📁 File: ${WORKSPACE}/${OUTPUT}"
echo "📊 Size: $(ls -lh "${WORKSPACE}/${OUTPUT}" | awk '{print $5}')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
