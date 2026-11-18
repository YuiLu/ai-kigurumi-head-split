const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");
const context = vm.createContext({});
vm.runInContext(
  fs.readFileSync(path.join(__dirname, "../web/generation.js"), "utf8"),
  context,
);
const sources = [
  { name: "front.png", role: "结构参考" },
  { name: "back.png", role: "结构参考" },
  { name: "wink.png", role: "表情参考" },
];

test("reference manifest matches upload order and gives expression priority over neutral structure images", () => {
  const prompt = context.buildGenerationPrompt(
    { prompt: "保留角色原本表情", notes: "" },
    1,
    sources,
  );
  assert(prompt.includes("上传图 1「front.png」【结构参考】"));
  assert(prompt.includes("上传图 2「back.png」【结构参考】"));
  assert(prompt.includes("上传图 3「wink.png」【表情参考】"));
  assert(prompt.includes("目标表情只从 上传图 3 读取"));
  assert(prompt.includes("不是结构图的默认表情"));
  assert(prompt.includes("远侧眼睛应自然不可见"));
});

test("manual expression requests use notes and stale removed controls do not affect generation", () => {
  const prompt = context.buildGenerationPrompt(
    {
      prompt: "四视图",
      notes: "画面左眼睁开、右眼闭合，轻微噘嘴，保持发饰",
      expression: {
        viewerLeftEye: "open",
        viewerRightEye: "closed",
        details: "旧的隐藏要求不应再发送",
      },
    },
    1,
    sources,
  );
  assert(prompt.includes("画面左眼睁开、右眼闭合"));
  assert(!prompt.includes("【用户表情锁定"));
  assert(!prompt.includes("旧的隐藏要求不应再发送"));
  assert(prompt.includes("轻微噘嘴"));
  assert(prompt.includes("角色自身左侧 90°"));
  assert(prompt.includes("保持发饰"));
});

test("default expression follows the reference without inventing a wink or changing other stages", () => {
  const entry = {
    prompt: "原步骤要求",
    notes: "",
    expression: {
      viewerLeftEye: "reference",
      viewerRightEye: "reference",
      details: "",
    },
  };
  const prompt = context.buildGenerationPrompt(entry, 1, sources.slice(0, 2));
  assert(!prompt.includes("【用户表情锁定"));
  assert(!prompt.includes("【表情来源与冲突优先级"));
  const stage2 = context.buildGenerationPrompt(entry, 2, sources);
  assert(!stage2.includes("【四视图中的同一固定表情】"));
  assert(stage2.includes("原步骤要求"));
});
