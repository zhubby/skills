---
name: camera-recorder
description: Record video from the system camera using ffmpeg. Supports custom duration, filename, and automatic dependency management.
---

# Camera Recorder

Record video from the system camera and save as MP4.

## Trigger

Use when the user asks to record video, capture footage, or start camera recording.

## Capabilities

| Feature | Description |
|---------|-------------|
| Camera recording | Uses system FaceTime HD Camera via avfoundation |
| Custom duration | Default 30 seconds, configurable |
| Custom filename | Supports custom output filename |
| MP4 output | 720p H.264, 30fps |
| Auto-send | Sends video to chat after completion |
| Permission check | Detects camera permission automatically |
| Dependency check | Installs ffmpeg if missing |

## Usage

```
Record a video for 10 seconds
Record 60 seconds, save as demo.mp4
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| duration | int | 30 | Recording duration in seconds |
| filename | string | auto-generated | Output filename |

## Output Specifications

| Spec | Value |
|------|-------|
| Resolution | 1280x720 (720p HD) |
| Frame rate | 30 fps |
| Codec | H.264 (libx264) |
| Format | MP4 |
| Pixel format | yuv420p |

## Dependencies

- ffmpeg (`brew install ffmpeg`)
- Camera permission (System Settings → Privacy & Security → Camera)

## File Structure

```
camera-recorder/
├── SKILL.md              # Skill definition
└── record_camera.sh      # Recording script
```

## Notes

1. First use requires granting camera permission
2. Close other apps using the camera (Zoom, FaceTime, etc.) before recording
3. Default save path: workspace directory
4. Filename format: `video_YYYYMMDD_HHMMSS.mp4`

## Error Handling

| Error | Resolution |
|-------|------------|
| ffmpeg not installed | Auto-installs via brew |
| Camera permission denied | Guide user to System Settings |
| Camera in use by another app | Ask user to close the other app |
| Recording failed | Return error message, suggest retry |
