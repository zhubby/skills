---
name: camera-snapshot
description: Take a photo using the system camera with imagesnap. Supports custom filename and automatic dependency management.
---

# Camera Snapshot

Take a photo using the system camera and save as JPEG.

## Trigger

Use when the user asks to take a photo, capture a picture, or take a snapshot.

## Capabilities

| Feature | Description |
|---------|-------------|
| Camera snapshot | Uses system FaceTime HD Camera |
| Custom filename | Supports custom output filename |
| JPG output | High-quality JPEG |
| Auto-send | Sends photo to chat after capture |
| Permission check | Detects camera permission automatically |
| Dependency check | Installs imagesnap if missing |

## Usage

```
Take a photo
Take a picture, save as selfie.jpg
```

## Dependencies

- imagesnap (`brew install imagesnap`)
- Camera permission (System Settings → Privacy & Security → Camera)

## File Structure

```
camera-snapshot/
├── SKILL.md           # Skill definition
└── take_photo.sh      # Photo capture script
```

## Notes

1. First use requires granting camera permission
2. Ensure good lighting for best results
3. Look at the camera when taking the photo
4. Default save path: workspace directory
