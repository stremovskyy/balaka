import io
import wave
from concurrent.futures import ThreadPoolExecutor
from threading import Event

import numpy as np
import pytest

from balaka.core import Settings
from balaka.schemas import DesignRequest
from balaka.services import SpeechService, TTSRuntimeError


def make_service() -> SpeechService:
    return SpeechService(Settings(_env_file=None, tts_preload_runtime=False))


def test_numpy_audio_is_encoded_as_wav() -> None:
    service = make_service()
    audio = np.array([-1.0, 0.0, 1.0], dtype=np.float32)

    result = service._build_audio_result([audio], 24000, np, "design")

    with wave.open(io.BytesIO(result.audio_bytes), "rb") as wav_file:
        assert wav_file.getnchannels() == 1
        assert wav_file.getsampwidth() == 2
        assert wav_file.getframerate() == 24000
        assert wav_file.getnframes() == 3
        assert np.frombuffer(wav_file.readframes(3), dtype=np.int16).tolist() == [-32767, 0, 32767]


@pytest.mark.parametrize(
    "audio",
    [
        np.array([], dtype=np.float32),
        np.zeros((2, 3), dtype=np.float32),
        np.array([np.nan], dtype=np.float32),
        np.array([np.inf], dtype=np.float32),
        np.array([1], dtype=np.int16),
    ],
)
def test_invalid_audio_is_rejected(audio: np.ndarray) -> None:
    with pytest.raises(TTSRuntimeError) as error:
        make_service()._audio_to_wav_bytes(audio, 24000, np)

    assert error.value.status_code == 502


def test_second_generation_gets_busy_response() -> None:
    entered = Event()
    release = Event()

    class BlockingModel:
        def generate(self, **kwargs):
            entered.set()
            assert release.wait(5)
            return [np.zeros(3, dtype=np.float32)]

    service = make_service()
    service._runtime = {"model": BlockingModel(), "sampling_rate": 24000, "np": np}
    payload = DesignRequest(text="Hello")

    with ThreadPoolExecutor(max_workers=2) as executor:
        first = executor.submit(service.synthesize_design, payload)
        try:
            assert entered.wait(2)
            with pytest.raises(TTSRuntimeError) as error:
                service.synthesize_design(payload)
            assert error.value.status_code == 503
        finally:
            release.set()
        assert first.result().audio_bytes.startswith(b"RIFF")


def test_edge_duration_settings_reach_model() -> None:
    calls = []

    class RecordingModel:
        def generate(self, **kwargs):
            calls.append(kwargs)
            return [np.zeros(3, dtype=np.float32)]

    service = make_service()
    service._runtime = {"model": RecordingModel(), "sampling_rate": 24000, "np": np}

    service.synthesize_design(DesignRequest(text="Hello", pad_duration=0.25, fade_duration=0))

    assert calls[0]["pad_duration"] == 0.25
    assert calls[0]["fade_duration"] == 0
