# GitHub Pages 发布清单

## 文件范围

把 `seemountain-static` 目录下的所有文件提交到 GitHub 仓库：

```text
.nojekyll
index.html
README.md
assets/
data/
docs/
src/
```

不要只上传 `index.html`，否则脚本、样式、图片和数据会丢失。

## 仓库设置

1. 进入仓库 `Settings -> Pages`。
2. Source 选择 `Deploy from a branch`。
3. Branch 选择 `main`。
4. Folder 选择 `/root`。
5. 等待 GitHub Pages 完成部署。

访问地址通常是：

```text
https://username.github.io/repo-name/
```

## 发布后测试

用手机浏览器打开 GitHub Pages 地址，依次测试：

- 首页能显示地图入口或本地雷达图。
- 点击“真实实验”会请求定位，并尝试获取附近 OSM 山峰数据。
- 点击“演示模式”会使用西湖预置数据进入扫描页。
- 允许相机权限后能看到实时画面。
- 点击“扫描”后能定帧并出现山峰标签。
- 点击标签能打开详情。
- 上传图片后能进入模拟识别。
- 开发者模式能显示位置、朝向、距离和可信度。

## 常见问题

- 相机打不开：确认访问地址是 HTTPS；GitHub Pages 默认是 HTTPS。
- 地图不显示：外部地图源加载失败时会降级为本地雷达图，不影响主流程。
- 山峰不准：当前数据是演示级近似，后续需要校准经纬度、海拔和观景点朝向。
- 指南针不准：手机方向传感器容易受环境干扰，使用手动校准滑杆兜底。
