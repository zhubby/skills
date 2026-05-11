#!/bin/bash
# 🦀 陛下御用拍照脚本 - imagesnap 版
# 用法：./take_photo.sh [输出文件名]

set -e

# 默认参数
OUTPUT=${1:-boss_photo_$(date +%Y%m%d_%H%M%S).jpg}
WORKSPACE="/Users/zhubby/.klaw/workspace"

echo "🦀 陛下，拍照已启动！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📸 输出文件：${WORKSPACE}/${OUTPUT}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查 imagesnap 是否安装
if ! command -v imagesnap &> /dev/null; then
    echo "❌ imagesnap 未安装，正在安装..."
    brew install imagesnap
fi

# 列出摄像头设备
echo ""
echo "🔍 检测摄像头设备..."
imagesnap -l 2>/dev/null || true

echo ""
echo "📸 准备拍照... 请看向摄像头！"
echo "⏱️  3 秒后拍摄..."
sleep 1
echo "⏱️  2 秒后拍摄..."
sleep 1
echo "⏱️  1 秒后拍摄..."
sleep 1
echo "📸 咔嚓！"

# 拍照
imagesnap -w 1 "${WORKSPACE}/${OUTPUT}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 陛下，拍照完成！"
echo "📁 文件位置：${WORKSPACE}/${OUTPUT}"
echo "📊 文件大小：$(ls -lh "${WORKSPACE}/${OUTPUT}" | awk '{print $5}')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
