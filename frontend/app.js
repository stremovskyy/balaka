const API_BASE = "/api/v1/tts";
const DEFAULT_LANGUAGE = "Ukrainian";
const DESIGN_FIELDS = ["gender", "age", "pitch", "style", "accent", "dialect"];
const DEFAULT_DESIGN_VALUES = {
  gender: "female",
  age: "young adult",
  pitch: "moderate pitch",
  style: "Auto",
  accent: "Auto",
  dialect: "Auto",
};
const ATTRIBUTE_LABELS = {
  gender: "Стать",
  age: "Вік",
  pitch: "Висота голосу",
  style: "Стиль",
  accent: "Акцент",
  dialect: "Діалект",
};
const VALUE_LABELS = {
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
};

const state = {
  mode: "design",
  objectUrl: null,
};

const dom = {
  form: document.getElementById("tts-form"),
  apiStatus: document.getElementById("api-status"),
  statusText: document.getElementById("status-text"),
  modeButtons: document.querySelectorAll(".mode-button"),
  modePanels: document.querySelectorAll(".mode-panel"),
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

function setApiStatus(text, kind) {
  dom.apiStatus.textContent = text;
  dom.apiStatus.className = `status-pill status-pill-${kind}`;
}

function setStatus(text) {
  dom.statusText.textContent = text;
}

function localizeValue(value) {
  if (typeof value !== "string") {
    return value;
  }

  return VALUE_LABELS[value.trim().toLowerCase()] || value;
}

function setFieldValue(field, value) {
  if (!field || value == null) {
    return false;
  }

  if (field instanceof HTMLSelectElement) {
    const selected = Array.from(field.options).find(
      (option) => option.value.trim().toLowerCase() === String(value).trim().toLowerCase(),
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
  title.textContent = ATTRIBUTE_LABELS[attribute.key] || attribute.label;

  const select = document.createElement("select");
  select.id = attribute.key;
  select.name = attribute.key;
  attribute.options.forEach((value) => select.appendChild(createOption(value)));

  wrapper.append(title, select);
  return { wrapper, select };
}

function renderMetadata(metadata) {
  dom.language.innerHTML = "";
  metadata.languages.forEach((language) => dom.language.appendChild(createOption(language)));

  dom.designAttributes.innerHTML = "";
  dom.designFields = {};
  metadata.design_attributes.forEach((attribute) => {
    const { wrapper, select } = createVoiceField(attribute);
    dom.designFields[attribute.key] = select;
    dom.designAttributes.appendChild(wrapper);
  });

  setFieldValue(dom.language, DEFAULT_LANGUAGE) || setFieldValue(dom.language, metadata.defaults.language);
  setFieldValue(dom.duration, metadata.defaults.duration ?? "");
  DESIGN_FIELDS.forEach((fieldName) => {
    setFieldValue(dom.designFields[fieldName], DEFAULT_DESIGN_VALUES[fieldName]);
  });

  setFieldValue(dom.speed, metadata.defaults.speed ?? 1.0);
  setFieldValue(dom.numSteps, metadata.defaults.num_steps ?? 32);
  setFieldValue(dom.guidanceScale, metadata.defaults.guidance_scale ?? 2.0);
  dom.denoise.checked = metadata.defaults.denoise;
  dom.preprocessPrompt.checked = metadata.defaults.preprocess_prompt;
  dom.postprocessOutput.checked = metadata.defaults.postprocess_output;
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

async function loadMetadata() {
  setApiStatus("Завантаження параметрів...", "loading");

  try {
    const response = await fetch(`${API_BASE}/meta`);
    if (!response.ok) {
      throw new Error("Не вдалося отримати конфігурацію TTS.");
    }

    const metadata = await response.json();
    renderMetadata(metadata);
    setApiStatus(`Локальний бекенд готовий. Доступно мов: ${metadata.languages.length}.`, "ready");
  } catch (error) {
    setApiStatus("Конфігурація недоступна.", "error");
    setStatus(error.message || "Не вдалося завантажити параметри.");
  }
}

function buildFormData() {
  const data = new FormData();
  data.set("text", dom.text.value.trim());
  data.set("language", dom.language.value || DEFAULT_LANGUAGE);
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
  setStatus("Генерую аудіо...");

  try {
    const endpoint = state.mode === "design" ? "design" : "clone";
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      body: buildFormData(),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ detail: "Непередбачена помилка." }));
      throw new Error(payload.detail || "Не вдалося згенерувати аудіо.");
    }

    showAudioResult(await response.blob(), getFilename(response.headers.get("content-disposition")));
    setStatus(response.headers.get("x-tts-status") || "Готово.");
  } catch (error) {
    setStatus(error.message || "Не вдалося згенерувати аудіо.");
  } finally {
    dom.submitButton.disabled = false;
  }
}

dom.modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

RANGE_FIELDS.forEach(({ input }) => input.addEventListener("input", updateRangeLabels));
dom.form.addEventListener("submit", handleSubmit);

setMode("design");
updateRangeLabels();
loadMetadata();
