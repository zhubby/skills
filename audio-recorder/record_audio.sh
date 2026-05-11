#!/bin/bash
# 🦀 陛下御用录音脚本 - ffmpeg 版
# 用法：./record_audio.sh [录制时长 (秒)] [输出文件名]

set -e

# 默认参数
DURATION=${1:-30}
OUTPUT=${2:-boss_audio_$(date +%Y%m%d_%H%M%S).mp3}
WORKSPACE="/Users/zhubby/.klaw/workspace"

echo "🦀 陛下，录音已启动！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎤 录制时长：${DURATION} 秒"
echo "💾 输出文件：${WORKSPACE}/${OUTPUT}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查 ffmpeg 是否安装
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg 未安装，正在安装..."
    brew install ffmpeg
fi

# 列出音频设备
echo ""
echo "🔍 检测音频设备..."
ffmpeg -f avfoundation -list_devices true -i "" 2>&1 | grep -i audio || true

echo ""
echo "🎬 开始录制... 请说话～"
echo "⏱️  剩余时间：${DURATION} 秒"
echo ""

# 录制音频（:1 表示默认麦克风）
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
echo "✅ 陛下，录音完成！"
echo "📁 文件位置：${WORKSPACE}/${OUTPUT}"
echo "📊 文件大小：$(ls -lh "${WORKSPACE}/${OUTPUT}" | awk '{print $5}')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
