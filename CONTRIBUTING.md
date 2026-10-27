# Contributing

## Setup

Use one local virtualenv named `.venv` with Python `3.13`.

```bash
rm -rf .venv
python3.13 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -e ".[dev]"
```

If you want to run real local inference, install the matched `torch`/`torchaudio` pair for your platform as described in [README.md](README.md), then run `pip install -e ".[dev,runtime]"`. The runtime extra pins OmniVoice and the PyTorch pair.

## Development workflow

1. Create a branch from `main`
2. Keep changes small and focused
3. Run the checks before opening a pull request
4. Update `README.md` when behavior or setup changes

## Checks

```bash
make test
make smoke
```

## Scope

Good contributions:

- setup improvements
- TTS API improvements
- frontend UX improvements
- documentation fixes
- tests

Avoid unrelated refactors in the same change set.

## Pull requests

Please include:

- what changed
- why it changed
- how it was tested
