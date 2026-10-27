from __future__ import annotations

from balaka.schemas import DesignAttributeMeta, GenerationDefaults, NumericRange, TTSMetaResponse


COMMON_LANGUAGE_SUGGESTIONS = [
    "Auto",
    "English",
    "Ukrainian",
    "French",
    "German",
    "Spanish",
    "Italian",
    "Portuguese",
    "Polish",
    "Dutch",
    "Czech",
    "Romanian",
    "Turkish",
    "Arabic",
    "Hindi",
    "Chinese",
    "Cantonese",
    "Japanese",
    "Korean",
]

VOICE_ATTRIBUTE_OPTIONS = {
    "gender": ("Gender", ["Auto", "male", "female"]),
    "age": (
        "Age",
        ["Auto", "child", "teenager", "young adult", "middle-aged", "elderly"],
    ),
    "pitch": (
        "Pitch",
        [
            "Auto",
            "very low pitch",
            "low pitch",
            "moderate pitch",
            "high pitch",
            "very high pitch",
        ],
    ),
    "style": ("Style", ["Auto", "whisper"]),
    "accent": (
        "Accent",
        [
            "Auto",
            "american accent",
            "australian accent",
            "british accent",
            "canadian accent",
            "chinese accent",
            "indian accent",
            "japanese accent",
            "korean accent",
            "portuguese accent",
            "russian accent",
        ],
    ),
    "dialect": (
        "Dialect",
        [
            "Auto",
            "河南话",
            "陕西话",
            "四川话",
            "贵州话",
            "云南话",
            "桂林话",
            "济南话",
            "石家庄话",
            "甘肃话",
            "宁夏话",
            "青岛话",
            "东北话",
        ],
    ),
}

VOICE_VALUE_ALIASES = {
    "gender": {
        "male / 男": "male",
        "female / 女": "female",
    },
    "age": {
        "child / 儿童": "child",
        "teenager / 少年": "teenager",
        "young adult / 青年": "young adult",
        "middle-aged / 中年": "middle-aged",
        "elderly / 老年": "elderly",
    },
    "pitch": {
        "very low pitch / 极低音调": "very low pitch",
        "low pitch / 低音调": "low pitch",
        "moderate pitch / 中音调": "moderate pitch",
        "high pitch / 高音调": "high pitch",
        "very high pitch / 极高音调": "very high pitch",
    },
    "style": {
        "whisper / 耳语": "whisper",
    },
    "accent": {
        "american accent / 美式口音": "american accent",
        "australian accent / 澳大利亚口音": "australian accent",
        "british accent / 英国口音": "british accent",
        "chinese accent / 中国口音": "chinese accent",
        "canadian accent / 加拿大口音": "canadian accent",
        "indian accent / 印度口音": "indian accent",
        "korean accent / 韩国口音": "korean accent",
        "portuguese accent / 葡萄牙口音": "portuguese accent",
        "russian accent / 俄罗斯口音": "russian accent",
        "japanese accent / 日本口音": "japanese accent",
    },
    "dialect": {
        "henan dialect / 河南话": "河南话",
        "shaanxi dialect / 陕西话": "陕西话",
        "sichuan dialect / 四川话": "四川话",
        "guizhou dialect / 贵州话": "贵州话",
        "yunnan dialect / 云南话": "云南话",
        "guilin dialect / 桂林话": "桂林话",
        "jinan dialect / 济南话": "济南话",
        "shijiazhuang dialect / 石家庄话": "石家庄话",
        "gansu dialect / 甘肃话": "甘肃话",
        "ningxia dialect / 宁夏话": "宁夏话",
        "qingdao dialect / 青岛话": "青岛话",
        "northeast dialect / 东北话": "东北话",
    },
}


def get_supported_languages() -> list[str]:
    try:
        from omnivoice.utils.lang_map import LANG_NAMES

        names = sorted(set(LANG_NAMES))
        return ["Auto", *names]
    except Exception:
        return COMMON_LANGUAGE_SUGGESTIONS


def normalize_voice_value(key: str, value: str | None) -> str | None:
    if value is None:
        return None

    normalized = value.strip()
    if not normalized or normalized.lower() == "auto":
        return None

    alias_map = VOICE_VALUE_ALIASES.get(key, {})
    aliased = alias_map.get(normalized.lower(), alias_map.get(normalized, normalized))
    return aliased.strip() if aliased else None


def build_voice_prompt(values: dict[str, str | None]) -> str | None:
    parts: list[str] = []
    for key in VOICE_ATTRIBUTE_OPTIONS:
        normalized = normalize_voice_value(key, values.get(key))
        if normalized:
            parts.append(normalized)

    return ", ".join(parts) if parts else None


def build_runtime_metadata() -> TTSMetaResponse:
    return TTSMetaResponse(
        languages=get_supported_languages(),
        numeric_ranges={
            "num_steps": NumericRange(min=4, max=64, step=1),
            "guidance_scale": NumericRange(min=0.0, max=4.0, step=0.1),
            "speed": NumericRange(min=0.5, max=1.5, step=0.05),
            "pad_duration": NumericRange(min=0.0, max=1.0, step=0.05),
            "fade_duration": NumericRange(min=0.0, max=1.0, step=0.05),
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
            pad_duration=0.1,
            fade_duration=0.1,
        ),
        design_attributes=[
            DesignAttributeMeta(key=key, label=label, options=list(options))
            for key, (label, options) in VOICE_ATTRIBUTE_OPTIONS.items()
        ],
    )
