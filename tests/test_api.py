from pathlib import Path

from fastapi.testclient import TestClient

from balaka.main import create_app
from balaka.schemas import (
    AudioResult,
    CloneRequest,
    DesignAttributeMeta,
    DesignRequest,
    GenerationDefaults,
    NumericRange,
    TTSMetaResponse,
)


class FakeSpeechService:
    def __init__(self) -> None:
        self.clone_payload: CloneRequest | None = None
        self.clone_audio_path: Path | None = None
        self.design_payload: DesignRequest | None = None

    def get_metadata(self) -> TTSMetaResponse:
        return TTSMetaResponse(
            languages=["Auto", "English", "Ukrainian"],
            numeric_ranges={
                "num_steps": NumericRange(min=4, max=64, step=1),
                "guidance_scale": NumericRange(min=0.0, max=4.0, step=0.1),
                "speed": NumericRange(min=0.5, max=1.5, step=0.05),
            },
            defaults=GenerationDefaults(
                language="Auto",
                num_steps=32,
                guidance_scale=2.0,
                denoise=True,
                speed=1.0,
                duration=None,
                preprocess_prompt=True,
                postprocess_output=True,
            ),
            design_attributes=[
                DesignAttributeMeta(key="gender", label="Gender", options=["Auto", "Male / 男"]),
            ],
        )

    def synthesize_design(self, payload: DesignRequest) -> AudioResult:
        self.design_payload = payload
        return AudioResult(
            audio_bytes=b"RIFF-design",
            media_type="audio/wav",
            filename="design.wav",
            status="Done.",
        )

    def synthesize_clone(self, payload: CloneRequest, reference_audio_path: Path) -> AudioResult:
        self.clone_payload = payload
        self.clone_audio_path = reference_audio_path
        return AudioResult(
            audio_bytes=b"RIFF-clone",
            media_type="audio/wav",
            filename="clone.wav",
            status="Done.",
        )


def make_client() -> tuple[TestClient, FakeSpeechService]:
    service = FakeSpeechService()
    app = create_app(tts_service=service)
    return TestClient(app), service


def test_healthcheck() -> None:
    client, _ = make_client()

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_metadata_endpoint() -> None:
    client, _ = make_client()

    response = client.get("/api/v1/tts/meta")

    assert response.status_code == 200
    payload = response.json()
    assert payload["languages"] == ["Auto", "English", "Ukrainian"]


def test_frontend_defaults_to_english_ui() -> None:
    client, _ = make_client()

    response = client.get("/tts/")

    assert response.status_code == 200
    html = response.text
    assert '<html lang="en">' in html
    assert "Voice clone" in html
    assert "Generate speech" in html
    assert 'data-locale="en"' in html
    assert 'data-locale="uk"' in html


def test_design_endpoint_returns_audio() -> None:
    client, service = make_client()

    response = client.post(
        "/api/v1/tts/design",
        data={
            "text": "Hello world",
            "language": "English",
            "duration": "3",
            "speed": "1.0",
            "num_steps": "32",
            "guidance_scale": "2.0",
            "denoise": "true",
            "preprocess_prompt": "true",
            "postprocess_output": "true",
            "gender": "Auto",
            "age": "Auto",
            "pitch": "Auto",
            "style": "Auto",
            "accent": "Auto",
            "dialect": "Auto",
        },
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("audio/wav")
    assert response.content == b"RIFF-design"
    assert service.design_payload is not None
    assert service.design_payload.text == "Hello world"


def test_clone_endpoint_accepts_reference_audio() -> None:
    client, service = make_client()

    response = client.post(
        "/api/v1/tts/clone",
        data={
            "text": "Hello world",
            "reference_text": "Hello world",
            "language": "English",
            "duration": "3",
            "speed": "1.0",
            "num_steps": "32",
            "guidance_scale": "2.0",
            "denoise": "true",
            "preprocess_prompt": "true",
            "postprocess_output": "true",
        },
        files={"reference_audio": ("voice.wav", b"audio-bytes", "audio/wav")},
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("audio/wav")
    assert response.content == b"RIFF-clone"
    assert service.clone_payload is not None
    assert service.clone_audio_path is not None
