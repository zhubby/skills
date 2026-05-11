#!/bin/bash
# 🦀 陛下御用摄像头录制脚本
# 用法：./record_camera.sh [录制时长 (秒)] [输出文件名]

set -e

# 默认参数
DURATION=${1:-30}                    # 默认录制 30 秒
OUTPUT=${2:-boss_video_$(date +%Y%m%d_%H%M%S).mp4}
WORKSPACE="/Users/zhubby/.klaw/workspace"

echo "🦀 陛下，摄像头录制脚本已启动！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📹 录制时长：${DURATION} 秒"
echo "💾 输出文件：${WORKSPACE}/${OUTPUT}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查 ffmpeg 是否安装
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg 未安装，正在安装..."
    brew install ffmpeg
fi

# 列出可用的摄像头设备
echo ""
echo "🔍 检测摄像头设备..."
ffmpeg -f avfoundation -list_devices true -i "" 2>&1 | grep -E "video|camera" || true

echo ""
echo "🎬 开始录制... 按 Ctrl+C 可提前结束"
echo ""

# 录制视频
# 0:0 表示使用默认摄像头（FaceTime HD Camera）
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
echo "✅ 陛下，视频录制完成！"
echo "📁 文件位置：${WORKSPACE}/${OUTPUT}"
echo "📊 文件大小：$(ls -lh "${WORKSPACE}/${OUTPUT}" | awk '{print $5}')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 输出文件路径供调用方使用
echo "FILE_PATH:${WORKSPACE}/${OUTPUT}"
