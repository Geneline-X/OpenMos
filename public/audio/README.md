# Audio Samples Directory

This directory contains audio samples for the MOS evaluation.

## Structure

Place audio files here organized by model type and language:

```plaintext
/public/audio/
├── luganda/
│   ├── orpheus/
│   │   ├── sample_001.wav
│   │   ├── sample_002.wav
│   │   └── ...
│   ├── nemo/
│   │   └── ...
│   └── ground_truth/
│       └── ...
└── krio/
    ├── orpheus/
    ├── nemo/
    └── ground_truth/
```

## File Requirements

- Format: WAV or MP3 (WAV preferred for quality)
- Sample Rate: 22050 Hz or 44100 Hz
- Duration: 3-30 seconds
- Max Size: 16MB per file

## Naming Convention

`{language}_{model}_{number}.{ext}`

Example: `lug_orpheus_001.wav`

## Production Note

In production, audio files are stored via UploadThing CDN and served from their URLs.
The database stores references to these files along with metadata.
