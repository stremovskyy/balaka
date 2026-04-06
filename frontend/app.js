const API_BASE = "/api/v1/tts";
const DEFAULT_UI_LOCALE = "en";
const DEFAULT_TTS_LANGUAGE = "Ukrainian";
const LOCALE_STORAGE_KEY = "balaka.ui.locale";
const SUPPORTED_LOCALES = ["en", "uk"];
const DESIGN_FIELDS = ["gender", "age", "pitch", "style", "accent", "dialect"];
const DEFAULT_DESIGN_VALUES = {
  gender: "female",
  age: "young adult",
  pitch: "moderate pitch",
  style: "Auto",
  accent: "Auto",
  dialect: "Auto",
};

const UI_COPY = {
  en: {
    pageTitle: "Balaka TTS",
    hero: {
      eyebrow: "Balaka",
      title: "Balaka.",
    },
    locale: {
      label: "Interface language",
    },
    modes: {
      label: "TTS mode",
      design: "TTS",
      clone: "Voice clone",
    },
    composer: {
      text: {
        label: "Text to synthesize",
        placeholder: "Enter text in Ukrainian or another language for synthesis...",
      },
      clone: {
        heading: "Voice cloning",
        description: "Upload a clean reference recording and its transcript.",
        audioLabel: "Reference audio file",
        textLabel: "Reference transcript",
        placeholder: "Paste the text spoken in the uploaded audio...",
      },
      advanced: {
        summary: "Voice and generation settings",
        description:
          "By default, Balaka uses a Ukrainian female voice with recommended model parameters. Open this section only if you need to change voice or synthesis quality manually.",
        languageLabel: "Language",
        durationLabel: "Duration, sec. (optional)",
        durationPlaceholder: "Auto",
        speedLabel: "Speed",
      },
      voice: {
        heading: "Voice design",
        description: "Fine-tune the voice for standard TTS.",
      },
      quality: {
        heading: "Generation quality",
        description: "Leave these values unchanged unless you are testing the model manually.",
        stepsLabel: "Generation steps",
        guidanceLabel: "Guidance scale",
        denoiseLabel: "Denoise audio",
        preprocessLabel: "Preprocess prompt",
        postprocessLabel: "Postprocess audio",
      },
      submit: "Generate speech",
    },
    status: {
      ready: "Ready to synthesize.",
      generating: "Generating audio...",
      metadataError: "Unable to load TTS settings.",
      unexpected: "Unexpected error.",
      audioError: "Unable to generate audio.",
      done: "Done.",
    },
    api: {
      loading: "Loading configuration...",
      unavailable: "Configuration unavailable.",
      ready: ({ count }) => `Local backend ready. ${count} ${count === 1 ? "language" : "languages"} available.`,
    },
    result: {
      heading: "Result",
      description: "Playback and download link will appear here.",
      empty: "No audio generated yet.",
      download: "Download audio",
    },
    attributes: {
      gender: "Gender",
      age: "Age",
      pitch: "Pitch",
      style: "Style",
      accent: "Accent",
      dialect: "Dialect",
    },
    values: {
      auto: "Auto",
      english: "English",
      ukrainian: "Ukrainian",
      french: "French",
      german: "German",
      spanish: "Spanish",
      italian: "Italian",
      portuguese: "Portuguese",
      polish: "Polish",
      dutch: "Dutch",
      czech: "Czech",
      romanian: "Romanian",
      turkish: "Turkish",
      arabic: "Arabic",
      hindi: "Hindi",
      chinese: "Chinese",
      cantonese: "Cantonese",
      japanese: "Japanese",
      korean: "Korean",
      male: "Male",
      "male / 男": "Male",
      female: "Female",
      child: "Child",
      teenager: "Teenager",
      "young adult": "Young adult",
      "middle-aged": "Middle-aged",
      elderly: "Elderly",
      "very low pitch": "Very low",
      "low pitch": "Low",
      "moderate pitch": "Moderate",
      "high pitch": "High",
      "very high pitch": "Very high",
      whisper: "Whisper",
      "american accent": "American",
      "australian accent": "Australian",
      "british accent": "British",
      "canadian accent": "Canadian",
      "chinese accent": "Chinese",
      "indian accent": "Indian",
      "japanese accent": "Japanese",
      "korean accent": "Korean",
      "portuguese accent": "Portuguese",
      "russian accent": "Russian",
      "河南话": "Henan dialect",
      "陕西话": "Shaanxi dialect",
      "四川话": "Sichuan dialect",
      "贵州话": "Guizhou dialect",
      "云南话": "Yunnan dialect",
      "桂林话": "Guilin dialect",
      "济南话": "Jinan dialect",
      "石家庄话": "Shijiazhuang dialect",
      "甘肃话": "Gansu dialect",
      "宁夏话": "Ningxia dialect",
      "青岛话": "Qingdao dialect",
      "东北话": "Northeastern dialect",
    },
  },
  uk: {
    pageTitle: "Balaka TTS",
    hero: {
      eyebrow: "Balaka",
      title: "Balaka.",
    },
    locale: {
      label: "Мова інтерфейсу",
    },
    modes: {
      label: "Режим TTS",
      design: "TTS",
      clone: "Клонування голосу",
    },
    composer: {
      text: {
        label: "Текст для озвучення",
        placeholder: "Введіть текст українською або іншою мовою для синтезу...",
      },
      clone: {
        heading: "Клонування голосу",
        description: "Завантажте чистий референсний запис і його розшифровку.",
        audioLabel: "Референсний аудіофайл",
        textLabel: "Текст референсу",
        placeholder: "Вставте текст, який звучить у завантаженому аудіо...",
      },
      advanced: {
        summary: "Налаштування голосу та генерації",
        description:
          "За замовчуванням використовується український жіночий голос з рекомендованими параметрами моделі. Відкривайте цей блок лише якщо треба вручну змінити голос або якість синтезу.",
        languageLabel: "Мова",
        durationLabel: "Тривалість, сек. (необов'язково)",
        durationPlaceholder: "Авто",
        speedLabel: "Швидкість",
      },
      voice: {
        heading: "Параметри голосу",
        description: "Тонке налаштування голосу для стандартного TTS.",
      },
      quality: {
        heading: "Якість генерації",
        description: "Залишайте ці значення без змін, якщо не тестуєте модель вручну.",
        stepsLabel: "Кроки генерації",
        guidanceLabel: "Сила підказки",
        denoiseLabel: "Шумозаглушення",
        preprocessLabel: "Попередня обробка промпту",
        postprocessLabel: "Постобробка аудіо",
      },
      submit: "Озвучити текст",
    },
    status: {
      ready: "Готово до синтезу.",
      generating: "Генерую аудіо...",
      metadataError: "Не вдалося завантажити параметри TTS.",
      unexpected: "Непередбачена помилка.",
      audioError: "Не вдалося згенерувати аудіо.",
      done: "Готово.",
    },
    api: {
      loading: "Завантаження параметрів...",
      unavailable: "Конфігурація недоступна.",
      ready: ({ count }) => `Локальний бекенд готовий. Доступно мов: ${count}.`,
    },
    result: {
      heading: "Результат",
      description: "Тут з'явиться прослуховування і посилання на завантаження аудіо.",
      empty: "Аудіо ще не згенеровано.",
      download: "Завантажити аудіо",
    },
    attributes: {
      gender: "Стать",
      age: "Вік",
      pitch: "Висота голосу",
      style: "Стиль",
      accent: "Акцент",
      dialect: "Діалект",
    },
    values: {
      auto: "Авто",
      english: "Англійська",
      ukrainian: "Українська",
      french: "Французька",
      german: "Німецька",
      spanish: "Іспанська",
      italian: "Італійська",
      portuguese: "Португальська",
      polish: "Польська",
      dutch: "Нідерландська",
      czech: "Чеська",
      romanian: "Румунська",
      turkish: "Турецька",
      arabic: "Арабська",
      hindi: "Гінді",
      chinese: "Китайська",
      cantonese: "Кантонська",
      japanese: "Японська",
      korean: "Корейська",
      male: "Чоловічий",
      "male / 男": "Чоловічий",
      female: "Жіночий",
      child: "Дитина",
      teenager: "Підліток",
      "young adult": "Молода доросла",
      "middle-aged": "Середній вік",
      elderly: "Літня",
      "very low pitch": "Дуже низький",
      "low pitch": "Низький",
      "moderate pitch": "Середній",
      "high pitch": "Високий",
      "very high pitch": "Дуже високий",
      whisper: "Шепіт",
      "american accent": "Американський",
      "australian accent": "Австралійський",
      "british accent": "Британський",
      "canadian accent": "Канадський",
      "chinese accent": "Китайський",
      "indian accent": "Індійський",
      "japanese accent": "Японський",
      "korean accent": "Корейський",
      "portuguese accent": "Португальський",
      "russian accent": "Російський",
      "河南话": "Хенаньський діалект",
      "陕西话": "Шеньсійський діалект",
      "四川话": "Сичуаньський діалект",
      "贵州话": "Гуйчжоуський діалект",
      "云南话": "Юньнаньський діалект",
      "桂林话": "Гуйлінський діалект",
      "济南话": "Цзінаньський діалект",
      "石家庄话": "Шицзячжуанський діалект",
      "甘肃话": "Ґаньсуський діалект",
      "宁夏话": "Нінсяський діалект",
      "青岛话": "Ціндаоський діалект",
      "东北话": "Північно-східний діалект",
    },
  },
};

const state = {
  mode: "design",
  locale: getStoredLocale(),
  metadata: null,
  objectUrl: null,
  apiStatusKey: "api.loading",
  apiStatusParams: {},
  statusKey: "status.ready",
  statusParams: {},
};

const dom = {
  form: document.getElementById("tts-form"),
  apiStatus: document.getElementById("api-status"),
  statusText: document.getElementById("status-text"),
  modeButtons: document.querySelectorAll(".mode-button"),
  modePanels: document.querySelectorAll(".mode-panel"),
  localeButtons: document.querySelectorAll(".locale-button"),
  resultEmpty: document.getElementById("result-empty"),
  resultContent: document.getElementById("result-content"),
  resultPlayer: document.getElementById("result-player"),
  resultDownload: document.getElementById("result-download"),
  designAttributes: document.getElementById("design-attributes"),
  language: document.getElementById("language"),
  text: document.getElementById("text"),
  duration: document.getElementById("duration"),
  speed: document.getElementById("speed"),
  speedValue: document.getElementById("speed-value"),
  numSteps: document.getElementById("num-steps"),
  numStepsValue: document.getElementById("num-steps-value"),
  guidanceScale: document.getElementById("guidance-scale"),
  guidanceScaleValue: document.getElementById("guidance-scale-value"),
  denoise: document.getElementById("denoise"),
  preprocessPrompt: document.getElementById("preprocess-prompt"),
  postprocessOutput: document.getElementById("postprocess-output"),
  referenceAudio: document.getElementById("reference-audio"),
  referenceText: document.getElementById("reference-text"),
  submitButton: document.getElementById("submit-button"),
  designFields: {},
};

const RANGE_FIELDS = [
  { input: dom.speed, output: dom.speedValue, format: (value) => `${Number(value).toFixed(2)}x` },
  { input: dom.numSteps, output: dom.numStepsValue, format: (value) => value },
  { input: dom.guidanceScale, output: dom.guidanceScaleValue, format: (value) => Number(value).toFixed(1) },
];

function getStoredLocale() {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return SUPPORTED_LOCALES.includes(stored) ? stored : DEFAULT_UI_LOCALE;
  } catch {
    return DEFAULT_UI_LOCALE;
  }
}

function persistLocale(locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore storage failures and keep working with the in-memory locale.
  }
}

function normalizeKey(value) {
  return String(value).trim().toLowerCase();
}

function resolveCopy(key) {
  return key.split(".").reduce((branch, part) => branch?.[part], UI_COPY[state.locale]);
}

function translate(key, params = {}) {
  const value = resolveCopy(key);
  if (typeof value === "function") {
    return value(params);
  }
  return value ?? key;
}

function setApiStatus(text, kind) {
  state.apiStatusKey = null;
  state.apiStatusParams = {};
  dom.apiStatus.textContent = text;
  dom.apiStatus.className = `status-pill status-pill-${kind}`;
}

function setApiStatusFromKey(key, kind, params = {}) {
  state.apiStatusKey = key;
  state.apiStatusParams = params;
  dom.apiStatus.textContent = translate(key, params);
  dom.apiStatus.className = `status-pill status-pill-${kind}`;
}

function setStatus(text) {
  state.statusKey = null;
  state.statusParams = {};
  dom.statusText.textContent = text;
}

function setStatusFromKey(key, params = {}) {
  state.statusKey = key;
  state.statusParams = params;
  dom.statusText.textContent = translate(key, params);
}

function refreshDynamicCopy() {
  if (state.apiStatusKey) {
    dom.apiStatus.textContent = translate(state.apiStatusKey, state.apiStatusParams);
  }
  if (state.statusKey) {
    dom.statusText.textContent = translate(state.statusKey, state.statusParams);
  }
}

function applyStaticTranslations() {
  document.documentElement.lang = state.locale;
  document.title = translate("pageTitle");

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = translate(node.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", translate(node.dataset.i18nPlaceholder));
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", translate(node.dataset.i18nAriaLabel));
  });
}

function updateLocaleButtons() {
  dom.localeButtons.forEach((button) => {
    const active = button.dataset.locale === state.locale;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function localizeValue(value) {
  if (typeof value !== "string") {
    return value;
  }

  return UI_COPY[state.locale].values[normalizeKey(value)] || value;
}

function localizeAttribute(attributeKey, fallbackLabel) {
  return UI_COPY[state.locale].attributes[attributeKey] || fallbackLabel || attributeKey;
}

function setLocale(locale, { persist = true } = {}) {
  if (!SUPPORTED_LOCALES.includes(locale) || locale === state.locale && persist === false && state.metadata == null) {
    applyStaticTranslations();
    updateLocaleButtons();
    refreshDynamicCopy();
    return;
  }

  state.locale = locale;
  if (persist) {
    persistLocale(locale);
  }

  applyStaticTranslations();
  updateLocaleButtons();
  refreshDynamicCopy();

  if (state.metadata) {
    renderMetadata(state.metadata, { preserveSelections: true });
  }
}

function setFieldValue(field, value) {
  if (!field || value == null) {
    return false;
  }

  if (field instanceof HTMLSelectElement) {
    const selected = Array.from(field.options).find(
      (option) => normalizeKey(option.value) === normalizeKey(value),
    );
    if (!selected) {
      return false;
    }

    field.value = selected.value;
    return true;
  }

  field.value = value;
  return true;
}

function snapshotFormState() {
  const designFields = {};
  DESIGN_FIELDS.forEach((fieldName) => {
    designFields[fieldName] = dom.designFields[fieldName]?.value || DEFAULT_DESIGN_VALUES[fieldName];
  });

  return {
    language: dom.language.value,
    duration: dom.duration.value,
    speed: dom.speed.value,
    numSteps: dom.numSteps.value,
    guidanceScale: dom.guidanceScale.value,
    denoise: dom.denoise.checked,
    preprocessPrompt: dom.preprocessPrompt.checked,
    postprocessOutput: dom.postprocessOutput.checked,
    designFields,
  };
}

function updateRangeLabels() {
  RANGE_FIELDS.forEach(({ input, output, format }) => {
    output.textContent = format(input.value);
  });
}

function createOption(value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = localizeValue(value);
  return option;
}

function createVoiceField(attribute) {
  const wrapper = document.createElement("label");
  wrapper.className = "field";

  const title = document.createElement("span");
  title.textContent = localizeAttribute(attribute.key, attribute.label);

  const select = document.createElement("select");
  select.id = attribute.key;
  select.name = attribute.key;
  attribute.options.forEach((value) => select.appendChild(createOption(value)));

  wrapper.append(title, select);
  return { wrapper, select };
}

function renderMetadata(metadata, { preserveSelections = false } = {}) {
  const preserved = preserveSelections ? snapshotFormState() : null;
  state.metadata = metadata;

  dom.language.innerHTML = "";
  metadata.languages.forEach((language) => dom.language.appendChild(createOption(language)));

  dom.designAttributes.innerHTML = "";
  dom.designFields = {};
  metadata.design_attributes.forEach((attribute) => {
    const { wrapper, select } = createVoiceField(attribute);
    dom.designFields[attribute.key] = select;
    dom.designAttributes.appendChild(wrapper);
  });

  setFieldValue(dom.language, preserved?.language) ||
    setFieldValue(dom.language, DEFAULT_TTS_LANGUAGE) ||
    setFieldValue(dom.language, metadata.defaults.language);

  setFieldValue(dom.duration, preserved?.duration ?? metadata.defaults.duration ?? "");

  DESIGN_FIELDS.forEach((fieldName) => {
    setFieldValue(dom.designFields[fieldName], preserved?.designFields[fieldName]) ||
      setFieldValue(dom.designFields[fieldName], DEFAULT_DESIGN_VALUES[fieldName]) ||
      setFieldValue(dom.designFields[fieldName], "Auto");
  });

  setFieldValue(dom.speed, preserved?.speed ?? metadata.defaults.speed ?? 1.0);
  setFieldValue(dom.numSteps, preserved?.numSteps ?? metadata.defaults.num_steps ?? 32);
  setFieldValue(dom.guidanceScale, preserved?.guidanceScale ?? metadata.defaults.guidance_scale ?? 2.0);
  dom.denoise.checked = preserved?.denoise ?? metadata.defaults.denoise;
  dom.preprocessPrompt.checked = preserved?.preprocessPrompt ?? metadata.defaults.preprocess_prompt;
  dom.postprocessOutput.checked = preserved?.postprocessOutput ?? metadata.defaults.postprocess_output;
  updateRangeLabels();
}

function setMode(mode) {
  state.mode = mode;

  dom.modeButtons.forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });

  dom.modePanels.forEach((panel) => {
    panel.classList.toggle("is-hidden", panel.dataset.panel !== mode);
  });

  const cloneMode = mode === "clone";
  dom.referenceAudio.required = cloneMode;
  dom.referenceText.required = cloneMode;
}

function resetAudioResult() {
  if (state.objectUrl) {
    URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = null;
  }

  dom.resultPlayer.removeAttribute("src");
  dom.resultDownload.removeAttribute("href");
  dom.resultDownload.download = "balaka-output.wav";
  dom.resultContent.classList.add("is-hidden");
  dom.resultEmpty.classList.remove("is-hidden");
}

function showAudioResult(blob, filename) {
  resetAudioResult();
  state.objectUrl = URL.createObjectURL(blob);
  dom.resultPlayer.src = state.objectUrl;
  dom.resultPlayer.load();
  dom.resultDownload.href = state.objectUrl;
  dom.resultDownload.download = filename || "balaka-output.wav";
  dom.resultContent.classList.remove("is-hidden");
  dom.resultEmpty.classList.add("is-hidden");
}

function getFilename(headerValue) {
  const match = headerValue?.match(/filename="([^"]+)"/i);
  return match ? decodeURIComponent(match[1]) : null;
}

function localizeKnownBackendStatus(status) {
  if (!status) {
    return null;
  }

  if (normalizeKey(status) === "done.") {
    return "status.done";
  }

  return null;
}

async function loadMetadata() {
  setApiStatusFromKey("api.loading", "loading");

  try {
    const response = await fetch(`${API_BASE}/meta`);
    if (!response.ok) {
      throw new Error(translate("status.metadataError"));
    }

    const metadata = await response.json();
    renderMetadata(metadata);
    setApiStatusFromKey("api.ready", "ready", { count: metadata.languages.length });
  } catch (error) {
    setApiStatusFromKey("api.unavailable", "error");
    setStatus(error.message || translate("status.metadataError"));
  }
}

function buildFormData() {
  const data = new FormData();
  data.set("text", dom.text.value.trim());
  data.set("language", dom.language.value || DEFAULT_TTS_LANGUAGE);
  data.set("speed", dom.speed.value);
  data.set("num_steps", dom.numSteps.value);
  data.set("guidance_scale", dom.guidanceScale.value);
  data.set("denoise", String(dom.denoise.checked));
  data.set("preprocess_prompt", String(dom.preprocessPrompt.checked));
  data.set("postprocess_output", String(dom.postprocessOutput.checked));

  if (dom.duration.value.trim()) {
    data.set("duration", dom.duration.value.trim());
  }

  if (state.mode === "design") {
    DESIGN_FIELDS.forEach((fieldName) => {
      if (dom.designFields[fieldName]) {
        data.set(fieldName, dom.designFields[fieldName].value);
      }
    });
    return data;
  }

  if (dom.referenceAudio.files[0]) {
    data.set("reference_audio", dom.referenceAudio.files[0]);
  }
  data.set("reference_text", dom.referenceText.value.trim());
  return data;
}

async function handleSubmit(event) {
  event.preventDefault();
  resetAudioResult();
  dom.submitButton.disabled = true;
  setStatusFromKey("status.generating");

  try {
    const endpoint = state.mode === "design" ? "design" : "clone";
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      body: buildFormData(),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ detail: translate("status.unexpected") }));
      throw new Error(payload.detail || translate("status.audioError"));
    }

    showAudioResult(await response.blob(), getFilename(response.headers.get("content-disposition")));
    const responseStatus = response.headers.get("x-tts-status");
    const knownStatusKey = localizeKnownBackendStatus(responseStatus);
    if (knownStatusKey) {
      setStatusFromKey(knownStatusKey);
    } else {
      setStatus(responseStatus || translate("status.done"));
    }
  } catch (error) {
    setStatus(error.message || translate("status.audioError"));
  } finally {
    dom.submitButton.disabled = false;
  }
}

dom.modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

dom.localeButtons.forEach((button) => {
  button.addEventListener("click", () => setLocale(button.dataset.locale));
});

RANGE_FIELDS.forEach(({ input }) => input.addEventListener("input", updateRangeLabels));
dom.form.addEventListener("submit", handleSubmit);

setLocale(state.locale, { persist: false });
setMode("design");
updateRangeLabels();
loadMetadata();
