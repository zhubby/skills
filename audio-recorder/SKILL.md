---
name: audio-recorder
description: Record audio from the system microphone using ffmpeg. Supports custom duration, filename, and automatic dependency management.
---

# Audio Recorder

Record audio from the system microphone and save as high-quality MP3.

## Trigger

Use when the user asks to record audio, capture voice, or start microphone recording.

## Capabilities

| Feature | Description |
|---------|-------------|
| Microphone recording | Uses system default microphone via avfoundation |
| Custom duration | Default 30 seconds, configurable |
| Custom filename | Supports custom output filename |
| MP3 output | 192kbps high-quality MP3 |
| Auto-send | Sends recording to chat after completion |
| Permission check | Detects microphone permission automatically |
| Dependency check | Installs ffmpeg if missing |

## Usage

```
Record audio for 10 seconds
Record a 60-second clip, save as meeting_notes.mp3
```

## Dependencies

- ffmpeg (`brew install ffmpeg`)
- Microphone permission (System Settings → Privacy & Security → Microphone)

## File Structure

```
audio-recorder/
├── SKILL.md           # Skill definition
└── record_audio.sh    # Recording script
```

## Notes

1. First use requires granting microphone permission
2. Keep environment quiet for best quality
3. Recommended max duration: 5 minutes (file size grows quickly)
