# EasyKig Studio · 头壳与部件参考

从角色参考到独立部件的四步图像工作区。

1. 角色头部参考
2. Kigurumi 头壳设计
3. 商品风格成图
4. 从商品图提取独立前脸或头饰

## 前端

打开 `web/index.html`，或运行本地静态服务器。

```bash
python -m http.server 8080 --directory web
```

在连接设置中填写图像 API 地址、Key 和模型。兼容 OpenAI Images API，并保留 Gemini 原生图像接口适配。

桌面上点击横向流程卡片展开当前步骤的工作区。移动端使用紧凑步骤导航、大图预览，以及参考图、提示词与设置、结果三个独立标签。各步骤可以上传补充参考、修改提示词和输出设置，也可选择上一步结果作为输入。

生成时显示 overlay 动画和已用时，进度条表示不确定等待状态。取消会中止本地请求，供应商可能继续处理并计费。生成结果和工作区通过 IndexedDB 保存到当前浏览器，存储失败会给出提示，重要图片请下载。

部件拆分可分别生成前脸与头饰。通过修改要求指定某个头饰，各自保留结果和提示词。下载单部件图后，在 [EasyKig Blender 插件](https://github.com/YuiLu/EasyKig) 中配合预设网格交给 ShapeUp 编辑。

## 开发

- `web/prompts.js` 保留原仓库前三步的提示词预设。
- `web/api.js` 负责 OpenAI/Gemini 图像 API 适配。
- `web/app.js` 负责四步状态、参考输入、拆件与本地保存。
- `web/styles.css` 分别提供桌面流程和移动端工作区布局。

推送 main 后由现有 GitHub Pages 工作流发布 `web/`，首次使用需在仓库 Settings → Pages 选择 GitHub Actions，并启用该 fork 的 Actions。

## 许可与来源

本项目 fork 自 [zhiyuan338/ai-kigurumi-head-reference](https://github.com/zhiyuan338/ai-kigurumi-head-reference)，保留其提示词与图像接口适配。原内容沿用 CC BY-NC 4.0 与仓库 [附加条款](ADDITIONAL_TERMS.md)，参见 [LICENSE](LICENSE)。原三阶段提示词文档继续保存在 `prompts/`。
