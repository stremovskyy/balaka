# Balaka v0.3.0 launch kit

Ready-to-use copy for sharing the current release. The repository's GitHub release is the source of truth; this copy is not posted automatically.

- Release: https://github.com/stremovskyy/balaka/releases/tag/v0.3.0
- Repository: https://github.com/stremovskyy/balaka

## One-line pitch

Balaka is a local text-to-speech studio for voice design and voice cloning, with a FastAPI API and a build-free English/Ukrainian interface.

## What changed

- OmniVoice 0.2.1 support and validated WAV output
- Loopback-only server default, configurable host and port
- 20 MiB reference-audio limit and clear response when the TTS engine is busy
- Text controls guide, API request preview, and edge-silence/fade settings
- Pinned dependencies, expanded tests, and refreshed CI

## Short post

Balaka v0.3.0 is out. It runs voice design and voice cloning locally with OmniVoice 0.2.1. This update adds safer local defaults, a 20 MiB reference-audio limit, clearer busy responses, text tips, and a copyable API request preview. The English/Ukrainian UI needs no frontend build step.

The model weights are unchanged, though the updated inference code can change how generated voices sound.

Try it: https://github.com/stremovskyy/balaka/releases/tag/v0.3.0

## Longer post

I released Balaka v0.3.0, a local text-to-speech app with a FastAPI backend and a simple browser interface.

The release updates OmniVoice to 0.2.1 and verifies real Ukrainian voice design and voice cloning as playable WAVs. The app now listens on your machine only by default, limits reference uploads to 20 MiB, and responds clearly if another synthesis is in progress. The UI adds a text-controls guide, copyable API request preview, and silence/fade controls.

Balaka remains one Python backend and one build-free frontend. The model weights did not change, but voices may sound different because the inference implementation changed.

Repository: https://github.com/stremovskyy/balaka
Release: https://github.com/stremovskyy/balaka/releases/tag/v0.3.0
