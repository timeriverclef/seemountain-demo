# 见山 SeeMountain

见山是一个面向户外场景的山峰识别 Web 原型。当前版本用于演示和技术验证：用户打开网页后，可以通过定位获取附近山峰数据，进入扫描页后用相机画面、手机朝向和山峰坐标计算标签位置。

> 当前版本不是图像识别，也不是真 ARCore/ARKit。它是纯静态 Web Demo，适合部署到 GitHub Pages 做演示和早期验证。

## 功能

- 真实实验：请求浏览器定位，并尝试从 OSM/Overpass 获取附近山峰。
- 摄像头扫描：调用手机后置摄像头作为实时取景画面。
- 定帧识别：点击“扫描”后冻结画面，再显示山峰标签。
- 上传兜底：上传图片后进入模拟识别流程。
- 演示模式：使用西湖周边预置数据，在无定位或无开放数据时仍可演示。
- 小地图/雷达：优先加载 MapLibre / OpenFreeMap；失败时使用本地雷达图。
- 开发者模式：显示位置、朝向、距离、方位角、可信度和数据来源。

## 技术边界

真实实验的识别依据是：

```text
浏览器定位 + 手机朝向 + OSM/Overpass 山峰数据 + 方位角/距离计算
```

限制：

- OSM/Overpass 附近没有山峰数据时，会显示 `OSM 无结果`。
- 手机指南针容易受环境干扰，需要保留手动校准。
- GitHub Pages 是纯静态托管，不能安全存放高德、AI 或商业地图 API key。
- 公开 Overpass 服务适合原型验证，不适合高频商用请求。

## 本地运行

不要直接双击 `index.html` 测试相机。摄像头和定位 API 需要安全上下文。

```powershell
cd E:\见山\seemountain-static
python -m http.server 4173
```

访问：

```text
http://localhost:4173/
```

`localhost` 可以调用浏览器摄像头。GitHub Pages 默认使用 HTTPS，也满足相机和定位 API 的安全上下文要求。

## GitHub Pages 自动发布

本项目已经包含 GitHub Actions 工作流：

```text
.github/workflows/pages.yml
```

推送到 GitHub 仓库的 `main` 分支后，工作流会自动部署当前目录为 GitHub Pages。

首次使用时需要在 GitHub 仓库设置中确认：

1. 打开仓库 `Settings -> Pages`。
2. `Build and deployment` 选择 `GitHub Actions`。
3. 保存后，推送 `main` 分支或手动运行 `Deploy GitHub Pages` 工作流。

发布后地址通常是：

```text
https://你的用户名.github.io/仓库名/
```

## 推送到你的 GitHub 仓库

你不需要把 GitHub 密码、token 发到聊天里。

如果你已经创建好 GitHub 仓库，只需要提供仓库 URL，例如：

```text
https://github.com/your-name/seemountain-demo.git
```

然后在本目录运行：

```powershell
.\publish.ps1 -RemoteUrl "https://github.com/your-name/seemountain-demo.git"
```

如果你本机已经配置过 GitHub 登录，脚本会自动提交并推送。否则 Git 会提示你登录或授权。

如果你还没有仓库，可以先在 GitHub 网页上创建一个空仓库，再使用上面的命令推送。

## 发布前检查

发布后建议用手机浏览器测试：

- 首页显示真实实验入口。
- 点击真实实验后请求定位。
- 允许定位后尝试获取附近山峰。
- 进入扫描页后允许相机。
- 点击扫描后出现山峰标签。
- 点击标签能打开详情。
- 上传图片可以进入兜底流程。
- 演示模式可以使用西湖预置数据。
- 开发者模式能显示识别依据。

## 目录结构

```text
.
├── .github/workflows/pages.yml
├── assets/
│   └── west-lake-hills-demo.png
├── data/
│   └── peaks.json
├── docs/
│   ├── github-pages-checklist.md
│   └── implementation-notes.md
├── src/
│   ├── app.js
│   └── styles.css
├── .gitignore
├── .nojekyll
├── index.html
├── publish.ps1
└── README.md
```

## 后续路线

建议按工作区根目录的 `见山阶段任务看板.md` 推进：

1. 发布 Web Demo 到 GitHub Pages。
2. 校准西湖和其他景区的山峰数据。
3. 做 Unity Android APK，作为软著和最终软件主线。
4. 准备操作说明书、截图和演示视频。
