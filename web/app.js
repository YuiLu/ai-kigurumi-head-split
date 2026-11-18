/* Pipeline orchestration. Original stage 1–3 presets live in prompts.js. */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const definitions = [
  {
    title: "角色参考",
    subtitle: "CHARACTER",
    empty: "添加角色参考图",
    roles: ["结构参考", "表情参考", "角色配色"],
  },
  {
    title: "头壳设计",
    subtitle: "SHELL DESIGN",
    empty: "等待角色参考",
    roles: ["头部主参考", "表情参考", "头壳风格"],
  },
  {
    title: "商品成图",
    subtitle: "PRODUCT",
    empty: "等待头壳设计",
    roles: ["头壳主参考", "商品摄影风格", "表情参考"],
  },
  {
    title: "部件拆分",
    subtitle: "COMPONENTS",
    empty: "等待商品成图",
    roles: ["成品主参考", "部件细节"],
  },
];
const splitPrompts = {
  face: "请根据上传的 kigurumi 成品照或商品多视图，提取同一头壳的独立前脸面壳。\n\n只输出一张正面单件商品照，背景为干净的浅灰色，完整轮廓居中，视角平正。保留成品的脸型、眼睛、固定表情、肤色、妆面、弱化的鼻子和简洁的嘴巴。对被假发遮住的面壳区域进行合理补全，呈现连续光滑的硬质面壳。\n\n画面只保留前脸部件。移除假发、发丝、刘海、头饰、后壳、脖子、支架与人体。避免真人皮肤纹理。不要添加标签、文字、拼图或多个视角。这张图将作为单个前脸模板的 3D 编辑参考。",
  ornament:
    "请根据上传的 kigurumi 成品照或商品多视图，提取用户指定的一个独立头饰。未指定时，选择画面中最显著的头饰。\n\n只输出一张该头饰的正面单件商品照，背景为干净的浅灰色，完整轮廓居中，保留它在原图中的材质、颜色、纹样、层叠和装配关系。被头发遮挡的部分适度补全，使它成为独立可辨认的部件。\n\n画面只保留这个头饰。移除头壳、面部、头发、假发、其他饰品、脖子和支架。不要把头发塑形成饰品。不要输出一组不同头饰、多个角度、标签或文字。这张图将作为单个头饰模板的 3D 编辑参考。",
};
const defaultSettings = {
  apiBase: "https://api.openai.com/v1",
  apiKey: "",
  imageModel: "gpt-image-2",
};
const state = {
  active: 1,
  part: "face",
  tab: "references",
  settings: { ...defaultSettings },
  entries: {},
  runs: new Map(),
};
let database;
let toastTimer;
let persistChain = Promise.resolve();
let autosaveTimer;
let itemIdCounter = 0;

function createItemId() {
  if (typeof globalThis.crypto?.randomUUID === "function")
    return globalThis.crypto.randomUUID();
  // These IDs identify local records. HTTP and older webviews may omit randomUUID.
  return `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}-${itemIdCounter++}`;
}

const entryKey = (step = state.active, part = state.part) =>
  step === 4 ? `4-${part}` : String(step);
const current = () => state.entries[entryKey()];
const selected = (step) =>
  state.entries[entryKey(step)]?.results.find(
    (item) => item.id === state.entries[entryKey(step)].selected,
  );
const defaultPrompt = (step, part = state.part) =>
  step === 4 ? splitPrompts[part] : stages[step - 1].presets[0].zh;
const emptyEntry = (step, part) => ({
  prompt: defaultPrompt(step, part),
  preset: "general",
  notes: "",
  files: [],
  results: [],
  selected: null,
  expression: {
    viewerLeftEye: "reference",
    viewerRightEye: "reference",
    details: "",
  },
  carry: step > 1,
  size: "1024x1024",
  quality: "high",
  count: 1,
  error: "",
  lastUpstream: null,
});

function notify(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 4500);
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("easykig-head-split", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("workspace");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function storage(operation, value) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      "workspace",
      operation === "get" ? "readonly" : "readwrite",
    );
    const store = transaction.objectStore("workspace");
    const request =
      operation === "get" ? store.get("project") : store.put(value, "project");
    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function persist() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    if (!database) return;
    const snapshot = structuredClone({
      active: state.active,
      part: state.part,
      entries: state.entries,
      settings: state.settings,
    });
    $("#saveState").textContent = "保存中";
    persistChain = persistChain
      .catch(() => {})
      .then(() => storage("put", snapshot))
      .then(() => {
        $("#saveState").textContent = "已保存到此浏览器";
      })
      .catch(() => {
        $("#saveState").textContent = "本地存储已满";
        notify("本地保存失败，请下载需要保留的图片。");
      });
  }, 250);
}

function image(src, alt = "") {
  const node = document.createElement("img");
  node.src = src;
  node.alt = alt;
  node.loading = "lazy";
  node.referrerPolicy = "no-referrer";
  return node;
}

function hasUpstreamChanged(step, entry) {
  return (
    step > 1 &&
    entry.lastUpstream &&
    selected(step - 1)?.id !== entry.lastUpstream
  );
}

function statusText(step, entry) {
  if (state.runs.has(entryKey(step))) return "生成中";
  if (entry.error) return "需要重试";
  if (hasUpstreamChanged(step, entry)) return "上游结果已更新";
  return entry.results.length ? "已生成" : "待生成";
}

function elapsed(start) {
  const seconds = Math.floor((Date.now() - start) / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function loadingNode(run) {
  const overlay = document.createElement("div");
  overlay.className = "loading-layer";
  overlay.innerHTML =
    '<span class="loading-ring" aria-hidden="true"></span><span>正在生成图像</span><div class="loading-bar" role="progressbar" aria-label="等待图像服务返回" aria-valuetext="生成中"></div><span class="elapsed"></span>';
  $(".elapsed", overlay).textContent = `已用时 ${elapsed(run.start)}`;
  return overlay;
}

function cancelNode(run) {
  const button = document.createElement("button");
  button.className = "cancel";
  button.textContent = run.canceling ? "正在取消…" : "取消等待";
  button.disabled = run.canceling;
  button.onclick = () => {
    run.canceling = true;
    run.controller.abort();
    renderPipeline();
    renderMobilePreview();
  };
  return button;
}

function renderPipeline() {
  $("#pipeline").replaceChildren();
  definitions.forEach((definition, index) => {
    const step = index + 1;
    const entry = state.entries[entryKey(step)];
    const result = selected(step);
    const run = state.runs.get(entryKey(step));
    const article = document.createElement("article");
    article.className = [
      "stage",
      state.active === step ? "active" : "",
      result ? "has-result" : "",
      run ? "busy" : "",
      entry.error ? "failed" : "",
    ].join(" ");
    article.dataset.runKey = entryKey(step);
    article.setAttribute("aria-busy", String(Boolean(run)));
    const button = document.createElement("button");
    button.className = "stage-open";
    button.type = "button";
    button.setAttribute("aria-label", `第 ${step} 步 ${definition.title}`);
    button.setAttribute(
      "aria-current",
      state.active === step ? "step" : "false",
    );
    button.innerHTML = `<div class="stage-label"><span class="stage-number">${String(step).padStart(2, "0")}</span><div><span class="stage-name">${definition.title}</span></div></div>`;
    const preview = document.createElement("button");
    preview.type = "button";
    preview.className = "stage-preview empty";
    const previewSource = result?.src || entry.files[0]?.src;
    preview.setAttribute(
      "aria-label",
      previewSource ? `放大预览第 ${step} 步图片` : `打开第 ${step} 步工作区`,
    );
    if (result || entry.files[0]) {
      preview.classList.remove("empty");
      preview.append(
        image(result?.src || entry.files[0].src, definition.title),
      );
    } else {
      preview.innerHTML = `<div class="empty-content"><span class="empty-icon">${step === 1 ? "+" : "◇"}</span>${definition.empty}</div>`;
    }
    if (run) preview.append(loadingNode(run));
    const status = document.createElement("button");
    status.type = "button";
    status.className = "stage-status";
    status.setAttribute("aria-label", `打开第 ${step} 步工作区`);
    status.innerHTML =
      '<span><i class="status-dot"></i><span class="status-text"></span></span><span class="result-total"></span>';
    $(".status-text", status).textContent = statusText(step, entry);
    $(".result-total", status).textContent = entry.results.length
      ? `${entry.results.length} 张`
      : "—";
    const openStep = () => {
      state.active = step;
      state.tab = "references";
      render();
      persist();
    };
    button.onclick = openStep;
    status.onclick = openStep;
    preview.onclick = () =>
      previewSource ? previewImage(previewSource) : openStep();
    article.append(button, preview, status);
    if (run) article.append(cancelNode(run));
    $("#pipeline").append(article);
  });
}

function renderMobilePreview() {
  const container = $("#mobilePreview");
  container.replaceChildren();
  const entry = current();
  const result = selected(state.active);
  if (result || entry.files[0]) {
    const img = image(result?.src || entry.files[0].src, "当前步骤参考图");
    img.onclick = () => previewImage(img.src);
    container.append(img);
  } else {
    container.innerHTML = `<div class="empty-content"><span class="empty-icon">◇</span>${definitions[state.active - 1].empty}</div>`;
  }
  const run = state.runs.get(entryKey());
  if (run) container.append(loadingNode(run), cancelNode(run));
}

function renderReferences() {
  const entry = current();
  $("#carryWrap").hidden = state.active === 1;
  $("#carry").checked = entry.carry;
  const upstream =
    state.active > 1 && entry.carry ? selected(state.active - 1) : null;
  const carried = $("#carried");
  carried.replaceChildren();
  if (upstream) {
    const img = image(upstream.src);
    img.onclick = () => previewImage(upstream.src);
    carried.append(
      img,
      document.createTextNode(`第 ${state.active - 1} 步 · 已选结果`),
    );
  }
  $("#inputCount").textContent =
    `${entry.files.length + Number(Boolean(upstream))} 张`;
  const container = $("#uploads");
  container.replaceChildren();
  entry.files.forEach((file, index) => {
    const item = document.createElement("div");
    item.className = "upload-item";
    const img = image(file.src);
    img.onclick = () => previewImage(file.src);
    const text = document.createElement("div");
    const name = document.createElement("small");
    name.textContent = `${index + 1 + Number(Boolean(upstream))} · ${file.name}`;
    name.title = file.name;
    const role = document.createElement("select");
    role.setAttribute("aria-label", `${file.name} 的参考用途`);
    definitions[state.active - 1].roles.forEach((value) =>
      role.add(new Option(value, value)),
    );
    role.value = file.role;
    role.disabled = state.runs.has(entryKey());
    role.onchange = () => {
      file.role = role.value;
      renderRequestPreview();
      persist();
    };
    const remove = document.createElement("button");
    remove.className = "remove-file";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `移除 ${file.name}`);
    remove.disabled = state.runs.has(entryKey());
    const target = entryKey();
    remove.onclick = () => {
      state.entries[target].files = state.entries[target].files.filter(
        (x) => x.id !== file.id,
      );
      renderReferences();
      renderPipeline();
      renderMobilePreview();
      renderRequestPreview();
      persist();
    };
    text.append(name, role);
    item.append(img, text, remove);
    container.append(item);
  });
}

function renderResults() {
  const entry = current();
  $("#resultCount").textContent = entry.results.length
    ? `${entry.results.length} 张`
    : "";
  const message = $("#stageMessage");
  message.textContent =
    entry.error ||
    (hasUpstreamChanged(state.active, entry)
      ? "上一步已选择新的结果。可重新生成此步，以保持流程一致。"
      : "");
  message.classList.toggle("error", Boolean(entry.error));
  const container = $("#results");
  container.replaceChildren();
  if (!entry.results.length) {
    const empty = document.createElement("p");
    empty.className = "empty-results";
    empty.textContent = "生成后在这里选择一张图，继续下一步。";
    container.append(empty);
  }
  entry.results.forEach((result, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `result-card ${entry.selected === result.id ? "selected" : ""}`;
    const img = image(result.src, "生成结果");
    const caption = document.createElement("span");
    caption.className = "result-caption";
    caption.textContent =
      entry.selected === result.id ? "✓ 已选中 · 用于下一步" : "点击图片选用";
    card.setAttribute("aria-pressed", String(entry.selected === result.id));
    card.setAttribute(
      "aria-label",
      `选用第 ${index + 1} 张结果`,
    );
    card.onclick = () => {
      entry.selected = result.id;
      render();
      persist();
    };
    card.append(img, caption);
    container.append(card);
  });
  $("#download").disabled = !selected(state.active);
}

function render() {
  const entry = current();
  const busy = state.runs.has(entryKey());
  renderPipeline();
  $("#workspaceTitle").textContent = definitions[state.active - 1].title;
  $("#stepLabel").textContent =
    `STEP ${String(state.active).padStart(2, "0")} / 04`;
  $("#splitControl").hidden = state.active !== 4;
  $("#presetWrap").hidden = state.active === 4;
  $("#expressionControl").hidden = state.active !== 1;
  $("#viewerLeftEye").value = entry.expression?.viewerLeftEye || "reference";
  $("#viewerRightEye").value = entry.expression?.viewerRightEye || "reference";
  $("#expressionDetails").value = entry.expression?.details || "";
  const presets = $("#preset");
  presets.replaceChildren();
  if (state.active < 4)
    stages[state.active - 1].presets.forEach((item) =>
      presets.add(new Option(item.label.zh, item.key)),
    );
  presets.value = entry.preset;
  $("#prompt").value = entry.prompt;
  $("#notes").value = entry.notes;
  $("#size").value = entry.size;
  $("#quality").value = entry.quality;
  $("#count").value = entry.count;
  $("#run").disabled = busy;
  $("#run").textContent = busy ? "正在生成…" : "生成当前步骤 →";
  $$(
    "#promptPane input, #promptPane textarea, #promptPane select, #resetPrompt, #upload, #carry",
  ).forEach((node) => {
    node.disabled = busy;
  });
  $$(".mobile-tabs button").forEach((node) =>
    node.classList.toggle("active", node.dataset.tab === state.tab),
  );
  $$(".segmented button").forEach((node) =>
    node.classList.toggle("active", node.dataset.part === state.part),
  );
  $(".workspace-body").dataset.view = state.tab;
  $("#connectionDot").classList.toggle("ready", Boolean(state.settings.apiKey));
  renderReferences();
  renderResults();
  renderMobilePreview();
  renderRequestPreview();
}

function referenceSources(entry = current(), step = state.active) {
  const upstream = step > 1 && entry.carry ? selected(step - 1) : null;
  return upstream
    ? [
        {
          ...upstream,
          name: `step-${step - 1}.png`,
          role: `第 ${step - 1} 步选中结果`,
        },
        ...entry.files,
      ]
    : [...entry.files];
}

function renderRequestPreview() {
  $("#requestPrompt").value = buildGenerationPrompt(
    current(),
    state.active,
    referenceSources(),
  );
}

async function addFiles(files) {
  const target = entryKey();
  const step = state.active;
  if (state.runs.has(target)) return;
  const entry = state.entries[target];
  const accepted = [...files];
  if (entry.files.length + accepted.length > 12)
    return notify("每步最多添加 12 张参考图。");
  if (
    accepted.some(
      (file) =>
        !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
        file.size > 20 * 1024 * 1024,
    )
  )
    return notify("请选择不超过 20 MB 的 PNG、JPEG 或 WebP 图片。");
  try {
    const items = await Promise.all(
      accepted.map(async (file) => {
        const src = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("图片读取失败"));
          reader.readAsDataURL(file);
        });
        return {
          id: createItemId(),
          name: file.name,
          src,
          role: definitions[step - 1].roles[0],
        };
      }),
    );
    if (state.runs.has(target) || entry.files.length + items.length > 12)
      return notify("生成已经开始或图片数量已满，请稍后添加。");
    entry.files.push(...items);
    render();
    persist();
  } catch (error) {
    notify(error.message);
  }
}

async function run() {
  const step = state.active;
  const target = entryKey();
  const entry = state.entries[target];
  if (state.runs.has(target)) return;
  if (!state.settings.apiKey) {
    openSettings();
    return;
  }
  if (!entry.prompt.trim()) return notify("请填写提示词。");
  const upstream = step > 1 && entry.carry ? selected(step - 1) : null;
  const sources = referenceSources(entry, step);
  if (!sources.length) return notify("请添加参考图，或先选择上一步的结果。");
  const settings = {
    ...state.settings,
    imageSize: entry.size,
    imageQuality: entry.quality,
    imageCount: entry.count,
    referenceLabels: sources.map(describeReference),
  };
  const prompt = buildGenerationPrompt(entry, step, sources);
  const job = {
    start: Date.now(),
    controller: new AbortController(),
    canceling: false,
  };
  state.runs.set(target, job);
  entry.error = "";
  render();
  try {
    const files = await Promise.all(
      sources.map((file) => dataUrlToFile(file.src, file.name)),
    );
    if (job.controller.signal.aborted)
      throw new DOMException("Aborted", "AbortError");
    const images = await requestImages(
      prompt,
      files,
      job.controller.signal,
      settings,
    );
    // A cancellation may race a provider response. The canceled request owns no results.
    if (job.controller.signal.aborted)
      throw new DOMException("Aborted", "AbortError");
    const results = images.map((src) => ({
      id: createItemId(),
      src,
      prompt,
    }));
    entry.results.unshift(...results);
    entry.selected = results[0].id;
    entry.lastUpstream = upstream?.id || null;
    if (entryKey() === target) state.tab = "results";
  } catch (error) {
    entry.error =
      error.name === "AbortError"
        ? "已取消本地等待。服务端可能仍在生成并计费。"
        : `生成失败，请检查连接后重试。${error.message}`;
  } finally {
    state.runs.delete(target);
    render();
    persist();
  }
}

function previewImage(src) {
  $("#largeImage").src = src;
  $("#imageDialog").showModal();
}

async function download() {
  const result = selected(state.active);
  if (!result) return;
  try {
    const response = await fetch(result.src);
    if (!response.ok) throw new Error("下载失败");
    const blob = await response.blob();
    const suffix =
      blob.type === "image/jpeg"
        ? "jpg"
        : blob.type === "image/webp"
          ? "webp"
          : "png";
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `easykig-step${state.active}${state.active === 4 ? "-" + state.part : ""}-${result.id.slice(0, 8)}.${suffix}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  } catch {
    notify("无法直接下载，请在大图预览中保存原图。");
  }
}

function openSettings() {
  for (const key of Object.keys(defaultSettings))
    $("#" + key).value = state.settings[key];
  $("#settingsDialog").showModal();
}

function bind() {
  $("#run").onclick = run;
  $("#download").onclick = download;
  $("#settingsOpen").onclick = openSettings;
  $("#settingsClose").onclick = () => $("#settingsDialog").close();
  $("#imageClose").onclick = () => $("#imageDialog").close();
  $("#connectionForm").onsubmit = (event) => {
    event.preventDefault();
    try {
      const base = new URL($("#apiBase").value.trim());
      if (!["http:", "https:"].includes(base.protocol))
        throw new Error("请填写 HTTP 或 HTTPS API 地址。");
      if (
        base.protocol !== "https:" &&
        !["localhost", "127.0.0.1", "[::1]"].includes(base.hostname)
      )
        throw new Error("远端服务请填写 HTTPS 地址。");
      if (base.username || base.password || base.search || base.hash)
        throw new Error("服务地址请使用不含凭据和查询参数的 API 根路径。");
      state.settings = Object.fromEntries(
        Object.keys(defaultSettings).map((key) => [
          key,
          $("#" + key).value.trim(),
        ]),
      );
      $("#settingsDialog").close();
      render();
      persist();
    } catch (error) {
      notify(error.message);
    }
  };
  $("#upload").onchange = (event) => {
    addFiles(event.target.files);
    event.target.value = "";
  };
  const zone = $("#dropZone");
  zone.ondragover = (event) => {
    event.preventDefault();
    zone.classList.add("dragover");
  };
  zone.ondragleave = () => zone.classList.remove("dragover");
  zone.ondrop = (event) => {
    event.preventDefault();
    zone.classList.remove("dragover");
    addFiles(event.dataTransfer.files);
  };
  zone.onkeydown = (event) => {
    if (["Enter", " "].includes(event.key)) {
      event.preventDefault();
      $("#upload").click();
    }
  };
  $("#carry").onchange = (event) => {
    current().carry = event.target.checked;
    renderReferences();
    renderRequestPreview();
    persist();
  };
  $("#preset").onchange = (event) => {
    const entry = current();
    entry.preset = event.target.value;
    entry.prompt = stages[state.active - 1].presets.find(
      (item) => item.key === entry.preset,
    ).zh;
    $("#prompt").value = entry.prompt;
    renderRequestPreview();
    persist();
  };
  $("#resetPrompt").onclick = () => {
    if (!confirm("将当前提示词恢复为默认模板？")) return;
    current().prompt = defaultPrompt(state.active);
    current().preset = "general";
    render();
    persist();
  };
  for (const key of ["prompt", "notes", "size", "quality", "count"])
    $("#" + key).oninput = (event) => {
      current()[key] = event.target.value;
      renderRequestPreview();
      persist();
    };
  for (const [id, key] of [
    ["viewerLeftEye", "viewerLeftEye"],
    ["viewerRightEye", "viewerRightEye"],
    ["expressionDetails", "details"],
  ])
    $("#" + id).oninput = (event) => {
      current().expression ||= {
        viewerLeftEye: "reference",
        viewerRightEye: "reference",
        details: "",
      };
      current().expression[key] = event.target.value;
      renderRequestPreview();
      persist();
    };
  $$(".mobile-tabs button").forEach((button) => {
    button.onclick = () => {
      state.tab = button.dataset.tab;
      render();
    };
  });
  $$(".segmented button").forEach((button) => {
    button.onclick = () => {
      state.part = button.dataset.part;
      render();
      persist();
    };
  });
  setInterval(() => {
    if (!state.runs.size) return;
    $$(".stage .elapsed").forEach((node) => {
      const job = state.runs.get(node.closest(".stage").dataset.runKey);
      if (job) node.textContent = "已用时 " + elapsed(job.start);
    });
    const active = state.runs.get(entryKey());
    if (active && $("#mobilePreview .elapsed"))
      $("#mobilePreview .elapsed").textContent =
        "已用时 " + elapsed(active.start);
  }, 1000);
}

async function init() {
  for (let step = 1; step <= 3; step++)
    state.entries[String(step)] = emptyEntry(step);
  for (const part of ["face", "ornament"])
    state.entries[`4-${part}`] = emptyEntry(4, part);
  try {
    database = await openDatabase();
    const saved = await storage("get");
    if (saved) {
      if (saved.entries)
        for (const key of Object.keys(state.entries))
          if (saved.entries[key])
            Object.assign(state.entries[key], saved.entries[key]);
      Object.assign(state.settings, saved.settings);
      if ([1, 2, 3, 4].includes(saved.active)) state.active = saved.active;
      if (["face", "ornament"].includes(saved.part)) state.part = saved.part;
    } else {
      const legacy = JSON.parse(
        localStorage.getItem("kigurumi-head-studio-v1") || "{}",
      );
      for (const key of Object.keys(defaultSettings))
        if (legacy.settings?.[key]) state.settings[key] = legacy.settings[key];
    }
    $("#saveState").textContent = "本地工作区";
  } catch {
    $("#saveState").textContent = "此会话不会自动保存";
  }
  bind();
  render();
}
init();
