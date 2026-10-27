from __future__ import annotations

import io
import sys
import wave
from pathlib import Path
from threading import Lock
from typing import Any

from balaka.core import Settings
from balaka.core.voice_catalog import build_runtime_metadata, build_voice_prompt
from balaka.schemas import AudioResult, CloneRequest, DesignRequest, TTSMetaResponse


class TTSRuntimeError(Exception):
    def __init__(self, message: str, status_code: int = 502) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class SpeechService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._runtime: dict[str, Any] | None = None
        self._runtime_lock = Lock()
        self._generation_lock = Lock()

    def get_metadata(self) -> TTSMetaResponse:
        return build_runtime_metadata()

    def warmup(self) -> None:
        self._get_runtime()

    def synthesize_design(self, payload: DesignRequest) -> AudioResult:
        voice_prompt = build_voice_prompt(
            {
                "gender": payload.gender,
                "age": payload.age,
                "pitch": payload.pitch,
                "style": payload.style,
                "accent": payload.accent,
                "dialect": payload.dialect,
            }
        )

        return self._synthesize(payload, "design", instruct=voice_prompt)

    def synthesize_clone(self, payload: CloneRequest, reference_audio_path: Path) -> AudioResult:
        return self._synthesize(
            payload,
            "clone",
            ref_audio=str(reference_audio_path),
            ref_text=payload.reference_text,
        )

    def _synthesize(self, payload: DesignRequest | CloneRequest, prefix: str, **extra_args: Any) -> AudioResult:
        if not self._generation_lock.acquire(blocking=False):
            raise TTSRuntimeError("TTS engine is busy. Try again shortly.", status_code=503)
        try:
            runtime = self._get_runtime()
            model = runtime["model"]

            try:
                generated = model.generate(
                    text=payload.text,
                    language=self._normalize_language(payload.language),
                    duration=payload.duration,
                    speed=payload.speed,
                    num_step=payload.num_steps,
                    guidance_scale=payload.guidance_scale,
                    denoise=payload.denoise,
                    preprocess_prompt=payload.preprocess_prompt,
                    postprocess_output=payload.postprocess_output,
                    pad_duration=payload.pad_duration,
                    fade_duration=payload.fade_duration,
                    **extra_args,
                )
            except Exception as exc:
                raise TTSRuntimeError(f"Local TTS generation failed: {exc}") from exc

            return self._build_audio_result(
                generated,
                sampling_rate=runtime["sampling_rate"],
                np_module=runtime["np"],
                prefix=prefix,
            )
        finally:
            self._generation_lock.release()

    def _get_runtime(self) -> dict[str, Any]:
        with self._runtime_lock:
            if self._runtime is None:
                self._runtime = self._load_runtime()
            return self._runtime

    def _load_runtime(self) -> dict[str, Any]:
        if sys.version_info >= (3, 14):
            raise TTSRuntimeError(
                "Local TTS runtime requires Python 3.12 or 3.13. "
                "The pinned Torch 2.8 runtime is not available for Python 3.14.",
                status_code=500,
            )

        try:
            import numpy as np
            import torch
            from omnivoice import OmniVoice as RuntimeModel
        except ModuleNotFoundError as exc:
            raise TTSRuntimeError(
                "Local TTS dependencies are missing. Install the runtime dependencies "
                "in a Python 3.12/3.13 environment.",
                status_code=500,
            ) from exc

        device = self._resolve_device(torch)
        dtype = self._resolve_dtype(torch, device)
        model_source = self._resolve_model_source()

        load_kwargs: dict[str, Any] = {
            "device_map": device,
            "dtype": dtype,
            "load_asr": self.settings.tts_load_asr,
        }

        try:
            model = RuntimeModel.from_pretrained(model_source, **load_kwargs)
        except Exception as exc:
            raise TTSRuntimeError(f"Failed to load configured TTS model: {exc}", status_code=500) from exc

        return {
            "model": model,
            "np": np,
            "sampling_rate": int(model.sampling_rate or 24000),
            "device": device,
        }

    def _resolve_model_source(self) -> str:
        configured = Path(self.settings.tts_model).expanduser()
        if configured.exists():
            return str(configured.resolve())

        try:
            from huggingface_hub import snapshot_download
            from huggingface_hub.errors import LocalEntryNotFoundError
        except ModuleNotFoundError:
            return self.settings.tts_model

        try:
            return snapshot_download(self.settings.tts_model, local_files_only=True)
        except LocalEntryNotFoundError:
            return snapshot_download(self.settings.tts_model)

    def _resolve_device(self, torch_module: Any) -> str:
        configured = self.settings.tts_device.strip().lower()
        if configured and configured != "auto":
            return configured

        if torch_module.cuda.is_available():
            return "cuda"
        if torch_module.backends.mps.is_available():
            return "mps"
        return "cpu"

    def _resolve_dtype(self, torch_module: Any, device: str) -> Any:
        configured = self.settings.tts_dtype.strip().lower()
        if configured == "float32":
            return torch_module.float32
        if configured == "float16":
            return torch_module.float16
        return torch_module.float16 if device in {"cuda", "mps"} else torch_module.float32

    @staticmethod
    def _normalize_language(language: str | None) -> str | None:
        if language is None:
            return None

        normalized = language.strip()
        return None if not normalized or normalized.lower() == "auto" else normalized

    def _build_audio_result(
        self,
        generated_audio: list[Any],
        sampling_rate: int,
        np_module: Any,
        prefix: str,
    ) -> AudioResult:
        if not generated_audio:
            raise TTSRuntimeError("Configured TTS runtime did not return audio.", status_code=502)

        audio_bytes = self._audio_to_wav_bytes(generated_audio[0], sampling_rate, np_module)
        return AudioResult(
            audio_bytes=audio_bytes,
            media_type="audio/wav",
            filename=f"{prefix}-output.wav",
            status="Done.",
        )

    def _audio_to_wav_bytes(self, audio: Any, sampling_rate: int, np_module: Any) -> bytes:
        if hasattr(audio, "detach"):
            audio = audio.detach().cpu().numpy()
        waveform = np_module.asarray(audio)
        if waveform.ndim == 2 and waveform.shape[0] == 1:
            waveform = waveform[0]
        if waveform.ndim != 1:
            raise TTSRuntimeError("Generated audio has an unexpected shape.", status_code=502)
        if waveform.size == 0 or not np_module.issubdtype(waveform.dtype, np_module.floating):
            raise TTSRuntimeError("Generated audio is empty or invalid.", status_code=502)
        if not np_module.isfinite(waveform).all():
            raise TTSRuntimeError("Generated audio contains non-finite samples.", status_code=502)
        if sampling_rate <= 0:
            raise TTSRuntimeError("Generated audio has an invalid sampling rate.", status_code=502)

        pcm = (np_module.clip(waveform, -1.0, 1.0) * 32767.0).astype(np_module.int16)

        buffer = io.BytesIO()
        with wave.open(buffer, "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sampling_rate)
            wav_file.writeframes(pcm.tobytes())

        return buffer.getvalue()
