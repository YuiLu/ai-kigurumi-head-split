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

本仓库独立开发，日常修改直接提交到本仓库的分支，再合入本仓库 `main`。不向原仓库提交 PR 或合并开发成果。保留的上游来源与许可见下文。

## ESA Pages 部署

目标地址为 `https://easykig.yuilu.space`，使用阿里云 ESA Pages。仓库根目录的 [esa.jsonc](esa.jsonc) 指定项目名 `easykig-studio` 和静态目录 `./web`，安装与构建步骤均跳过。GitHub Actions 只检查脚本语法与部署目录。

首次接入操作如下。

1. 在 [ESA 控制台](https://esa.console.aliyun.com/) 的「边缘计算和 AI → 函数和 Pages」创建项目，选择「导入 GitHub 仓库」。授权访问 `YuiLu/ai-kigurumi-head-split`。
2. 生产分支选择 `main`，根目录保留 `/`，安装命令与构建命令留空，静态资源目录填写 `./web`。项目配置由根目录 `esa.jsonc` 管理。函数入口留空，然后开始部署。
3. 部署完成后，在项目「域名」中绑定 `easykig.yuilu.space`。对应的 `yuilu.space` 站点需要已在 ESA 接入并处于可用状态。
4. 若站点通过 CNAME 接入，将 ESA 生成的 CNAME 值添加到现有 DNS 服务商，主机记录填写 `easykig`。若通过 NS 接入，由 ESA 添加记录。按控制台返回的实际值操作。
5. 在站点 SSL/TLS 中确认有效证书覆盖 `easykig.yuilu.space`，然后验证 HTTPS 首页、图片上传和图像 API 连接。

接入后，推送 `main` 会由 ESA 自动部署。平台的临时预览链接需要带短期 token，日常使用以上自定义域名。

这是浏览器直连图像 API 的静态前端。API Key 在网页的连接设置中填写并保存在本机浏览器，不需要放到 ESA 构建变量或 Git 仓库。API 服务需要允许来自 `https://easykig.yuilu.space` 的跨域请求。更换访问域名会使用独立的浏览器存储，旧地址下的图片与连接设置需要在原地址导出或重新配置。

官方文档可参考 [导入 GitHub 仓库](https://help.aliyun.com/zh/edge-security-acceleration/esa/user-guide/connect-pages-to-github)、[构建配置](https://help.aliyun.com/zh/edge-security-acceleration/esa/user-guide/build-pages) 和 [域名绑定](https://help.aliyun.com/zh/edge-security-acceleration/esa/user-guide/trigger/)。

## 许可与来源

本项目 fork 自 [zhiyuan338/ai-kigurumi-head-reference](https://github.com/zhiyuan338/ai-kigurumi-head-reference)，保留其提示词与图像接口适配。原内容沿用 CC BY-NC 4.0 与仓库 [附加条款](ADDITIONAL_TERMS.md)，参见 [LICENSE](LICENSE)。原三阶段提示词文档继续保存在 `prompts/`。
