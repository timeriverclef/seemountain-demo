# 静态 WebAR 实现方案

## 当前 MVP

目标：在 GitHub Pages 上用纯静态网站做“见山”山峰识别原型。

当前实现：

- 首页：真实实验入口 + 地图/雷达 + 演示模式入口
- 实时摄像头：`navigator.mediaDevices.getUserMedia()`
- 定位：`navigator.geolocation.getCurrentPosition()`
- 朝向：`DeviceOrientationEvent`
- 真实实验数据：浏览器定位 + Overpass 查询 OSM `natural=peak`
- 演示数据：本地 `data/peaks.json`
- 识别逻辑：当前位置 + 当前朝向 + 山峰坐标，计算距离、方位角和屏幕投影
- 定帧：点击“扫描”后把当前 video frame 绘制到 canvas，再显示 AR 标签
- 上传兜底：上传图片只替换取景画面，不做图像识别
- 开发者模式：默认隐藏，显示位置、朝向、距离、方位角和可信度
- 地图：优先尝试 MapLibre + OpenFreeMap；失败时降级为本地雷达图
- 部署：相对路径资源，兼容 `https://username.github.io/repo-name/`

## 为什么不把高德 key 放前端

GitHub Pages 是静态托管，任何放进 JS 的 key 都会暴露。高德、AI 识别、高程查询这类服务如果需要 key，应该走云函数或后端代理。

纯静态阶段的替代方案是：

- 预置核心景区数据。
- 用 JSON 管理山峰、观景点、简介、路线。
- 后续按城市/景区拆包，例如 `data/hangzhou-west-lake.json`。

## 开源/免费地图替代

可选方案：Leaflet + OpenStreetMap。

适合：

- 显示用户位置。
- 显示附近山峰点位。
- 做“我在哪里、朝哪个方向看”的辅助视图。

不建议第一版强依赖：

- 地图底图不是识别主流程。
- 公共 OSM 瓦片服务有使用策略限制，不适合高流量、批量下载或商业重度使用。
- GitHub Pages 上接外部瓦片没有 key 泄露问题，但有网络可用性和合规问题。

落地方式：

```text
静态识别主流程：本地 JSON + 摄像头 + GPS/朝向
可选地图视图：Leaflet + OSM 瓦片
正式产品：合规瓦片服务 / 自托管瓦片 / 云函数代理
```

## 小程序迁移评估

小程序更适合国内用户分发，权限体验通常比移动浏览器更可控，但它不是静态部署。

可复用：

- `data/peaks.json`
- 距离计算
- 方位角计算
- 视野筛选
- 标签投影思路
- 详情弹窗内容模型

需要替换：

- 摄像头：Web `getUserMedia()` -> 小程序 `camera` 组件 / camera context
- 定位：Web Geolocation -> `wx.getLocation`
- 朝向：Web DeviceOrientation -> 微信罗盘/设备方向 API
- 文件上传：Web file input -> `wx.chooseMedia` 或相册能力
- 部署：GitHub Pages -> 微信开发者工具、小程序后台、审核发布

小程序可能更方便的点：

- 用户在微信环境内打开，不需要解释浏览器兼容性。
- 相机、定位、罗盘能力统一在小程序 API 内处理。
- 国内分发、分享、入口更自然。

小程序仍然需要注意：

- 定位权限需要声明用途。
- 部分能力需要用户主动授权。
- 真机调试是必须项，开发者工具模拟不代表传感器真实表现。
- 如果后续接外部 API，需要配置合法域名。

## 后续数据校准

当前西湖山峰数据是原型级。要提高可信度，需要做三件事：

1. 用可靠来源校准山峰经纬度和海拔。
2. 增加观景点数据，例如断桥、苏堤、曲院风荷、雷峰塔、九溪入口。
3. 针对每个观景点配置推荐初始朝向和标签屏幕高度。

这比“单纯依赖手机指南针”更可靠，因为真实环境中磁场干扰会让标签漂移。
