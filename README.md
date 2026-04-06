# Balaka

Local-only TTS application with a FastAPI backend and a separate static frontend.

Balaka runs the speech model on your machine. There is no remote inference fallback, no Hugging Face Space dependency at request time, and no hidden service layer behind the API. The current default model is `k2-fsa/OmniVoice`.

## What you get

- Local FastAPI API for speech synthesis
- Separate build-free frontend in `frontend/`
- Two working modes:
  - TTS with voice design
  - Voice cloning from a reference recording
- Runtime metadata endpoint for languages and voice attributes
- Single-venv setup based on Python `3.13`
- Tests for the public API surface

## Stack

- Python `3.13`
- FastAPI
- PyTorch `2.8`
- `omnivoice==0.1.2`
- Plain HTML, CSS, and JavaScript

## Requirements

- macOS, Linux, or Windows with Python `3.13`
- One project virtualenv named `.venv`
- Enough RAM or VRAM for the selected TTS model

`torch 2.8` is not available for Python `3.14`, so this project intentionally targets Python `3.13`.

## Quick start

Create a clean environment:

```bash
rm -rf .venv
python3.13 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

Install runtime dependencies.

Apple Silicon:

```bash
pip install torch==2.8.0 torchaudio==2.8.0
pip install omnivoice==0.1.2
pip install -e ".[dev]"
```

NVIDIA CUDA example:

```bash
pip install torch==2.8.0+cu128 torchaudio==2.8.0+cu128 --extra-index-url https://download.pytorch.org/whl/cu128
pip install omnivoice==0.1.2
pip install -e ".[dev]"
```

Create local configuration:

```bash
cp .env.example .env
```

Run the app:

```bash
source .venv/bin/activate
balaka
```

Open [http://127.0.0.1:8000/tts/](http://127.0.0.1:8000/tts/).

Alternative:

```bash
python main.py
```

## Default user flow

1. Open `/tts/`
2. Leave advanced settings collapsed
3. Enter text
4. Click `Озвучити текст`
5. Listen in the built-in player or download the generated WAV

The default frontend setup is tuned for a convenient out-of-the-box result:

- Language: `Ukrainian`
- Voice: `female`, `young adult`, `moderate pitch`
- Steps: `32`
- Guidance scale: `2.0`
- Speed: `1.0`
- Denoise: enabled
- Prompt preprocessing: enabled
- Output postprocessing: enabled

## Run from PyCharm

- Set the project interpreter to `.venv/bin/python`
- If `.venv` was previously created with Python `3.14`, delete it and recreate it with Python `3.13`
- Run `main.py` or the `balaka` console command

## Configuration

Recommended `.env` values:

```env
BALAKA_DEBUG=false
BALAKA_TTS_MODEL=k2-fsa/OmniVoice
BALAKA_TTS_DEVICE=auto
BALAKA_TTS_DTYPE=auto
BALAKA_TTS_PRELOAD_RUNTIME=true
BALAKA_TTS_LOAD_ASR=false
```

What each variable does:

| Variable | Default | Meaning |
| --- | --- | --- |
| `BALAKA_DEBUG` | `false` | Runs the app without autoreload. This avoids reloading the large model on every source change. |
| `BALAKA_TTS_MODEL` | `k2-fsa/OmniVoice` | Hugging Face model ID or a local path to a compatible model directory. |
| `BALAKA_TTS_DEVICE` | `auto` | Picks `cuda`, then `mps`, then `cpu`, unless you force a specific device. |
| `BALAKA_TTS_DTYPE` | `auto` | Uses `float16` on GPU or MPS and `float32` on CPU. |
| `BALAKA_TTS_PRELOAD_RUNTIME` | `true` | Loads the model during startup so the first synthesis request is not delayed by model initialization. |
| `BALAKA_TTS_LOAD_ASR` | `false` | Keeps ASR disabled. Voice cloning in this project already requires explicit `reference_text`. |

Optional:

- `HF_TOKEN` is not required for normal local use after the model is cached
- `HF_TOKEN` can still help on the first model download by raising Hugging Face rate limits

## First startup behavior

The first startup downloads the configured model into the local Hugging Face cache if it is not already present.

After that:

- repeated app starts reuse the local cache
- the backend should not fetch model files again unless the cache is missing
- model weights are still loaded into RAM or VRAM on every new process start, which is expected

## API

Available endpoints:

- `GET /health`
- `GET /api/v1/tts/meta`
- `POST /api/v1/tts/design`
- `POST /api/v1/tts/clone`

Both synthesis endpoints return raw WAV bytes in the response body.

### Example: voice design

```bash
curl -X POST http://127.0.0.1:8000/api/v1/tts/design \
  -F 'text=Привіт. Це локальна перевірка синтезу.' \
  -F 'language=Ukrainian' \
  -F 'gender=female' \
  -F 'age=young adult' \
  -F 'pitch=moderate pitch' \
  -F 'style=Auto' \
  -F 'accent=Auto' \
  -F 'dialect=Auto' \
  -F 'speed=1.0' \
  -F 'num_steps=32' \
  -F 'guidance_scale=2.0' \
  -F 'denoise=true' \
  -F 'preprocess_prompt=true' \
  -F 'postprocess_output=true' \
  --output design.wav
```

### Example: voice clone

```bash
curl -X POST http://127.0.0.1:8000/api/v1/tts/clone \
  -F 'reference_audio=@voice.wav' \
  -F 'reference_text=Hello, this is the source voice.' \
  -F 'text=Привіт. Це клонований голос.' \
  -F 'language=Ukrainian' \
  -F 'speed=1.0' \
  -F 'num_steps=32' \
  -F 'guidance_scale=2.0' \
  -F 'denoise=true' \
  -F 'preprocess_prompt=true' \
  -F 'postprocess_output=true' \
  --output clone.wav
```

## Project layout

```text
.
├── frontend/              # Static UI mounted by FastAPI
├── src/balaka/api/        # HTTP routes
├── src/balaka/core/       # Settings and voice metadata helpers
├── src/balaka/schemas/    # Pydantic request and response models
├── src/balaka/services/   # Local TTS runtime integration
├── tests/                 # API tests
├── main.py                # Local entrypoint
└── pyproject.toml
```

## Development

Run tests:

```bash
pytest
```

The frontend is intentionally build-free. Static files are served directly by FastAPI from `frontend/`.

## Troubleshooting

### App fails on Python 3.14

This is expected. Recreate `.venv` with Python `3.13`.

### Startup mentions Hugging Face

This is normal on the first run when the model is not cached yet.

### Startup is slow

This is expected when `BALAKA_TTS_PRELOAD_RUNTIME=true`, because the app loads the model before serving requests.

### Voice cloning does not start

Make sure both of these are provided:

- `reference_audio`
- `reference_text`

## Notes

- This project is local-only by design
- There is no remote Space fallback
- The backend keeps model-specific logic inside the runtime service instead of leaking it into the API layer
