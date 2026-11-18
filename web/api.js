async function requestImages(prompt, references, signal, settings) {
  if (isNanoBananaModel(settings.imageModel)) {
    return requestNanoBananaImages(prompt, references, signal, settings);
  }

  const base = normalizeBase(settings.apiBase);
  const headers = { Authorization: `Bearer ${settings.apiKey}` };
  const n = clamp(parseInt(settings.imageCount, 10) || 1, 1, 4);
  const quality = settings.imageQuality;
  const size = settings.imageSize;
  const imageFieldName = getOpenAIImageFieldName(base);

  if (references.length) {
    const form = new FormData();
    form.append("model", settings.imageModel || "gpt-image-2");
    form.append("prompt", prompt);
    form.append("n", String(n));
    if (size !== "auto") form.append("size", size);
    if (quality !== "auto") form.append("quality", quality);
    references.slice(0, 16).forEach((file) => {
      form.append(imageFieldName, file, file.name);
    });
    const response = await fetch(`${base}/images/edits`, {
      method: "POST",
      headers,
      body: form,
      signal,
    });
    return parseImageResponse(response);
  }

  headers["Content-Type"] = "application/json";
  const body = {
    model: settings.imageModel || "gpt-image-2",
    prompt,
    n,
  };
  if (size !== "auto") body.size = size;
  if (quality !== "auto") body.quality = quality;
  const response = await fetch(`${base}/images/generations`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal,
  });
  return parseImageResponse(response);
}

function isNanoBananaModel(model) {
  const value = (model || "").trim().toLowerCase();
  return (
    value === "nano-banana" ||
    value === "gemini-2.5-flash-image" ||
    value === "gemini-2.5-flash-image-preview" ||
    value === "gemini-3.1-flash-image-preview" ||
    value === "gemini-3-pro-image-preview"
  );
}

function normalizeNanoBananaModel(model) {
  return (model || "").trim().toLowerCase() === "nano-banana"
    ? "gemini-2.5-flash-image"
    : (model || "gemini-2.5-flash-image").trim();
}

async function requestNanoBananaImages(prompt, references, signal, settings) {
  const base = normalizeGeminiBase(settings.apiBase);
  const model = normalizeNanoBananaModel(settings.imageModel);
  const n = clamp(parseInt(settings.imageCount, 10) || 1, 1, 4);
  const parts = [{ text: prompt }];

  for (const [index, file] of references.slice(0, 16).entries()) {
    parts.push({
      text:
        settings.referenceLabels?.[index] ||
        `上传图 ${index + 1}「${file.name}」`,
    });
    parts.push({
      inlineData: {
        mimeType: file.type || "image/png",
        data: await fileToBase64(file),
      },
    });
  }

  const response = await fetch(
    `${base}/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": settings.apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          candidateCount: n,
        },
      }),
      signal,
    },
  );
  return parseGeminiImageResponse(response);
}

async function parseGeminiImageResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      payload.error?.message || `${response.status} ${response.statusText}`,
    );
  }
  const images = (payload.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.inlineData || part.inline_data)
    .filter((data) => data?.data)
    .map(
      (data) =>
        `data:${data.mimeType || data.mime_type || "image/png"};base64,${data.data}`,
    );
  if (!images.length) {
    throw new Error("The Gemini response did not include images.");
  }
  return images;
}

async function parseImageResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      payload.error?.message || `${response.status} ${response.statusText}`,
    );
  }
  const data = payload.data || [];
  const images = data
    .map((item) =>
      item.b64_json ? `data:image/png;base64,${item.b64_json}` : item.url,
    )
    .filter(Boolean);
  if (!images.length) {
    throw new Error("The API response did not include images.");
  }
  return images;
}

function normalizeBase(base) {
  const clean = (base || "https://api.openai.com/v1").trim();
  return clean.replace(/\/+$/, "");
}

function getOpenAIImageFieldName(base) {
  try {
    const host = new URL(base).hostname.toLowerCase();
    return host === "api.openai.com" ? "image[]" : "image";
  } catch {
    return "image";
  }
}

function normalizeGeminiBase(base) {
  const clean = (
    base || "https://generativelanguage.googleapis.com/v1beta"
  ).trim();
  if (clean.includes("api.openai.com")) {
    return "https://generativelanguage.googleapis.com/v1beta";
  }
  return clean.replace(/\/+$/, "");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

async function dataUrlToFile(dataUrl, name) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], name, { type: blob.type || "image/png" });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      resolve(String(reader.result).split(",")[1] || "");
    });
    reader.addEventListener("error", () =>
      reject(reader.error || new Error("Failed to read image file.")),
    );
    reader.readAsDataURL(file);
  });
}
