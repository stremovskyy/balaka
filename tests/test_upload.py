from io import BytesIO
from pathlib import Path
from tempfile import NamedTemporaryFile

import pytest
from fastapi import UploadFile

from balaka.api.routes import tts
from balaka.services import TTSRuntimeError


def test_upload_limit_without_reported_size_cleans_temp_file(monkeypatch, tmp_path: Path) -> None:
    created_paths: list[Path] = []

    def create_temp_file(**kwargs):
        temp_file = NamedTemporaryFile(dir=tmp_path, **kwargs)
        created_paths.append(Path(temp_file.name))
        return temp_file

    monkeypatch.setattr(tts, "MAX_REFERENCE_AUDIO_BYTES", 3)
    monkeypatch.setattr(tts, "NamedTemporaryFile", create_temp_file)
    upload = UploadFile(file=BytesIO(b"four"), filename="voice.wav")

    with pytest.raises(TTSRuntimeError) as error:
        tts.persist_upload(upload)

    assert error.value.status_code == 413
    assert len(created_paths) == 1
    assert not created_paths[0].exists()
