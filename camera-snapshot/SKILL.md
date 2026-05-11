# Camera Snapshot 📸

**Version:** 1.0.0  
**Author:** 大闸蟹  
**Description:** MacBook 前置摄像头拍照技能，使用 imagesnap 拍摄照片

---

## 🎯 触发关键词

- "拍照" / "拍照片" / "照张相"
- "用摄像头拍" / "前置摄像头"
- "take photo" / "take picture" / "snapshot"
- "拍一张" / "来张靓照"
- "相机拍照" / "摄像头拍照"

---

## 💻 功能

| 功能 | 说明 |
|------|------|
| 前置摄像头拍照 | 使用 MacBook FaceTime 摄像头 |
| 自定义文件名 | 支持自定义输出文件名 |
| JPG 格式 | 高质量 JPEG 输出 |
| 自动发送 | 拍摄完成后自动发送到聊天 |
| 权限检测 | 自动检测摄像头权限 |
| imagesnap 安装 | 未安装时自动提示 |

---

## 📋 使用示例

```
帮我拍张照
用摄像头拍一张
来张靓照发给我
拍张照片，保存为 my_photo.jpg
```

---

## 🛠️ 依赖

- imagesnap (`brew install imagesnap`)
- 摄像头权限（系统设置 → 隐私与安全性 → 摄像头）

---

## 📁 文件结构

```
camera-snapshot/
├── SKILL.md           # Skill 定义
└── take_photo.sh      # 拍照脚本
```

---

## ⚠️ 注意事项

1. 首次使用需要授权摄像头权限
2. 确保光线充足，拍照效果更好
3. 拍照时请看向摄像头
