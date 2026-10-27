# Balaka v0.3.0 — a safer, more useful local TTS studio

Balaka runs speech synthesis on your computer. This release updates the OmniVoice runtime, tightens local-server defaults, and makes the browser interface easier to use and explore.

## Highlights

- **OmniVoice 0.2.1:** Voice design and voice cloning now use the current runtime, with verified 24 kHz WAV output from both modes. The same `k2-fsa/OmniVoice` model is used, but the new inference implementation can change how a voice sounds compared with v0.2.0.
- **Local by default:** The server binds to `127.0.0.1:8000`. `BALAKA_HOST` and `BALAKA_PORT` allow an explicit override.
- **Safer requests:** Reference recordings are limited to 20 MiB (`413` when exceeded). One synthesis runs at a time per process; another request gets a retryable `503` response.
- **More control in the UI:** Advanced settings now expose silence padding and fade duration. A new **Text tips** dialog explains supported text controls and their limits, while **Show API request** displays the current form fields and a copyable cURL command.
- **Reproducible setup:** Web and runtime dependencies are pinned. CI uses current GitHub Actions versions and runs the API test suite on Python 3.13.

## Upgrade notes

Use Python 3.13 and recreate or update your virtual environment using the [setup instructions](https://github.com/stremovskyy/balaka#quick-start). The default model is unchanged. If a familiar voice sounds different, compare the same text, voice settings, and reference recording; voice-design output can vary between generations.

The server is accessible from this machine by default. To connect from another device, set `BALAKA_HOST` explicitly and account for your network's access controls.

## Verification

- `18` API and service tests passed locally.
- Python compilation, JavaScript syntax, dependency consistency, and diff checks passed.
- Real Ukrainian voice-design and voice-clone generation produced playable 24 kHz mono WAV files on Apple Silicon.

## Links

- [Source and setup](https://github.com/stremovskyy/balaka)
- [Changes since v0.2.0](https://github.com/stremovskyy/balaka/compare/v0.2.0...v0.3.0)
