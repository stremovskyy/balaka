from dataclasses import dataclass

from pydantic import BaseModel, ConfigDict, Field, field_validator


class GenerationBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    text: str = Field(min_length=1, max_length=4000)
    language: str = Field(default="Auto")
    num_steps: int = Field(default=32, ge=4, le=64)
    guidance_scale: float = Field(default=2.0, ge=0.0, le=4.0)
    denoise: bool = True
    speed: float = Field(default=1.0, ge=0.5, le=1.5)
    duration: float | None = Field(default=None, gt=0.0, le=120.0)
    preprocess_prompt: bool = True
    postprocess_output: bool = True
    pad_duration: float = Field(default=0.1, ge=0.0, le=1.0)
    fade_duration: float = Field(default=0.1, ge=0.0, le=1.0)

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Text must not be empty.")
        return value


class DesignRequest(GenerationBase):
    gender: str = "Auto"
    age: str = "Auto"
    pitch: str = "Auto"
    style: str = "Auto"
    accent: str = "Auto"
    dialect: str = "Auto"


class CloneRequest(GenerationBase):
    reference_text: str = Field(min_length=1, max_length=4000)

    @field_validator("reference_text")
    @classmethod
    def validate_reference_text(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Reference text must not be empty.")
        return value


class NumericRange(BaseModel):
    min: float
    max: float
    step: float


class GenerationDefaults(BaseModel):
    language: str
    num_steps: int
    guidance_scale: float
    denoise: bool
    speed: float
    duration: float | None
    preprocess_prompt: bool
    postprocess_output: bool
    pad_duration: float
    fade_duration: float


class DesignAttributeMeta(BaseModel):
    key: str
    label: str
    options: list[str]


class TTSMetaResponse(BaseModel):
    languages: list[str]
    numeric_ranges: dict[str, NumericRange]
    defaults: GenerationDefaults
    design_attributes: list[DesignAttributeMeta]


@dataclass(slots=True)
class AudioResult:
    audio_bytes: bytes
    media_type: str
    filename: str
    status: str
