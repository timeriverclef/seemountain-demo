const DATA_URL = "./data/peaks.json";
const FALLBACK_IMAGE = "./assets/west-lake-hills-demo.png";
const FOV_DEGREES = 70;
const CENTER_PRIORITY_DEGREES = 8;
const SETTINGS_KEY = "seemountain-settings-v1";
const PEAK_CACHE_KEY = "seemountain-peak-cache-v1";
const PEAK_CACHE_TTL = 24 * 60 * 60 * 1000;
const DEFAULT_SETTINGS = {
  searchRadiusKm: 10,
  maxLabels: 5,
  mapSource: "auto",
  developerMode: false
};
const MAP_SOURCES = {
  liberty: {
    label: "OpenFreeMap Liberty",
    style: "https://tiles.openfreemap.org/styles/liberty"
  },
  positron: {
    label: "OpenFreeMap Positron",
    style: "https://tiles.openfreemap.org/styles/positron"
  },
  osmRaster: {
    label: "OpenStreetMap Raster",
    style: {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "OpenStreetMap"
        }
      },
      layers: [{ id: "osm", type: "raster", source: "osm" }]
    }
  }
};
const AUTO_MAP_SOURCE_ORDER = ["liberty", "positron", "osmRaster", "local"];
const COMPASS_POINTS = [
  { label: "子", angle: 0 },
  { label: "癸", angle: 15 },
  { label: "丑", angle: 30 },
  { label: "艮", angle: 45 },
  { label: "寅", angle: 60 },
  { label: "甲", angle: 75 },
  { label: "卯", angle: 90 },
  { label: "乙", angle: 105 },
  { label: "辰", angle: 120 },
  { label: "巽", angle: 135 },
  { label: "巳", angle: 150 },
  { label: "丙", angle: 165 },
  { label: "午", angle: 180 },
  { label: "丁", angle: 195 },
  { label: "未", angle: 210 },
  { label: "坤", angle: 225 },
  { label: "申", angle: 240 },
  { label: "庚", angle: 255 },
  { label: "酉", angle: 270 },
  { label: "辛", angle: 285 },
  { label: "戌", angle: 300 },
  { label: "乾", angle: 315 },
  { label: "亥", angle: 330 },
  { label: "壬", angle: 345 }
];

const els = {
  shell: document.querySelector(".phone-shell"),
  homeScreen: document.querySelector("#homeScreen"),
  scannerScreen: document.querySelector("#scannerScreen"),
  map: document.querySelector("#map"),
  mapFallback: document.querySelector("#mapFallback"),
  mapFallbackDots: document.querySelector("#mapFallbackDots"),
  routeTitle: document.querySelector("#routeTitle"),
  routeDescription: document.querySelector("#routeDescription"),
  peakCount: document.querySelector("#peakCount"),
  homeHeading: document.querySelector("#homeHeading"),
  dataSourceText: document.querySelector("#dataSourceText"),
  homeLocateBtn: document.querySelector("#homeLocateBtn"),
  startScanBtn: document.querySelector("#startScanBtn"),
  homeUploadBtn: document.querySelector("#homeUploadBtn"),
  homeSettingsBtn: document.querySelector("#homeSettingsBtn"),
  camera: document.querySelector("#camera"),
  fallback: document.querySelector("#fallbackScene"),
  frozen: document.querySelector("#frozenFrame"),
  labelLayer: document.querySelector("#labelLayer"),
  radarDots: document.querySelector("#radarDots"),
  radarHeading: document.querySelector(".radar-heading"),
  miniRadarBtn: document.querySelector("#miniRadarBtn"),
  backHomeBtn: document.querySelector("#backHomeBtn"),
  scannerSettingsBtn: document.querySelector("#scannerSettingsBtn"),
  modePill: document.querySelector("#modePill"),
  scannerViewpoint: document.querySelector("#scannerViewpoint"),
  locationText: document.querySelector("#locationText"),
  headingText: document.querySelector("#headingText"),
  sensorPill: document.querySelector("#sensorPill"),
  headingRange: document.querySelector("#headingRange"),
  cameraBtn: document.querySelector("#cameraBtn"),
  scanBtn: document.querySelector("#scanBtn"),
  uploadBtn: document.querySelector("#uploadBtn"),
  locateBtn: document.querySelector("#locateBtn"),
  uploadInput: document.querySelector("#uploadInput"),
  devPanel: document.querySelector("#devPanel"),
  devReadout: document.querySelector("#devReadout"),
  closeDevBtn: document.querySelector("#closeDevBtn"),
  settingsDialog: document.querySelector("#settingsDialog"),
  closeSettingsBtn: document.querySelector("#closeSettingsBtn"),
  mapSourceSelect: document.querySelector("#mapSourceSelect"),
  developerModeToggle: document.querySelector("#developerModeToggle"),
  applySettingsBtn: document.querySelector("#applySettingsBtn"),
  settingsDemoBtn: document.querySelector("#settingsDemoBtn"),
  clearCacheBtn: document.querySelector("#clearCacheBtn"),
  locationDialog: document.querySelector("#locationDialog"),
  retryLocationBtn: document.querySelector("#retryLocationBtn"),
  dismissLocationBtn: document.querySelector("#dismissLocationBtn"),
  detailDialog: document.querySelector("#detailDialog"),
  closeDetail: document.querySelector("#closeDetail"),
  detailMeta: document.querySelector("#detailMeta"),
  detailTitle: document.querySelector("#detailTitle"),
  detailElevation: document.querySelector("#detailElevation"),
  detailDistance: document.querySelector("#detailDistance"),
  detailBearing: document.querySelector("#detailBearing"),
  detailIntro: document.querySelector("#detailIntro"),
  detailRoute: document.querySelector("#detailRoute"),
  compassDialog: document.querySelector("#compassDialog"),
  closeCompassBtn: document.querySelector("#closeCompassBtn"),
  compassMap: document.querySelector("#compassMap"),
  compassDistanceRings: document.querySelector("#compassDistanceRings"),
  compassViewCone: document.querySelector("#compassViewCone"),
  compassHeadingLine: document.querySelector("#compassHeadingLine"),
  compassDial: document.querySelector("#compassDial"),
  compassDots: document.querySelector("#compassDots"),
  compassPopup: document.querySelector("#compassPopup"),
  compassBearingText: document.querySelector("#compassBearingText"),
  compassSourceText: document.querySelector("#compassSourceText"),
  compassModeText: document.querySelector("#compassModeText"),
  compassRadiusText: document.querySelector("#compassRadiusText"),
  toggleCompassOverlayBtn: document.querySelector("#toggleCompassOverlayBtn")
};

const state = {
  peaks: [],
  demoPeaks: [],
  viewpoints: [],
  activeViewpointIndex: 0,
  location: null,
  demoActive: false,
  locationRetryAction: null,
  heading: 247,
  dataSource: "待获取",
  screen: "home",
  cameraStream: null,
  cameraMode: "demo",
  frozen: false,
  hasScanResults: false,
  arLive: false,
  contourModel: null,
  uploadedUrl: null,
  uploadContext: "scanner",
  lastTargets: [],
  orientationListening: false,
  map: null,
  mapMarkers: [],
  mapSourceIndex: 0,
  hiddenTargetCount: 0,
  compassStyle: "standard",
  compassOverlay: true,
  compassMap: null,
  compassMapReady: false,
  compassMapSourceIndex: 0,
  compassMarkers: [],
  compassPopupTarget: null,
  headingFrame: null,
  compassCenter: null,
  homeBusy: false,
  settings: { ...DEFAULT_SETTINGS },
  pendingSettings: null
};

init();

async function init() {
  loadSettings();
  await loadData();
  bindEvents();
  buildCompassDial();
  renderSettings();
  els.devPanel.classList.toggle("active", state.settings.developerMode);
  renderHome();
  renderMapFallback();
  renderTargets();
  renderDevPanel();
  setupMapWhenReady();
  applyInitialRoute();
}

async function loadData() {
  const response = await fetch(DATA_URL);
  const data = await response.json();
  state.demoPeaks = data.peaks;
  state.peaks = [];
  state.viewpoints = data.meta.viewpoints?.length
    ? data.meta.viewpoints
    : [{ ...data.meta.demoLocation, id: "demo", name: data.meta.demoLocation.label, area: "西湖" }];
  setActiveViewpoint(0, { useDemoLocation: false });
  state.location = null;
  state.dataSource = "待获取";
  els.peakCount.textContent = "0";
}

function bindEvents() {
  els.homeLocateBtn.addEventListener("click", locateFromHome);
  els.startScanBtn.addEventListener("click", () => {
    startRealExperiment();
  });
  els.homeUploadBtn.addEventListener("click", () => {
    state.uploadContext = "home";
    els.uploadInput.click();
  });
  els.homeSettingsBtn.addEventListener("click", openSettings);
  els.scannerSettingsBtn.addEventListener("click", openSettings);
  els.closeDevBtn.addEventListener("click", closeDevPanel);
  els.closeSettingsBtn.addEventListener("click", () => els.settingsDialog.close());
  els.mapSourceSelect.addEventListener("change", () => updatePendingSetting("mapSource", els.mapSourceSelect.value));
  els.developerModeToggle.addEventListener("change", () => updatePendingSetting("developerMode", els.developerModeToggle.checked));
  els.applySettingsBtn.addEventListener("click", applyPendingSettings);
  els.settingsDemoBtn.addEventListener("click", enterDemoFromSettings);
  els.clearCacheBtn.addEventListener("click", clearPeakCache);
  els.retryLocationBtn.addEventListener("click", retryLocationRequest);
  els.dismissLocationBtn.addEventListener("click", () => els.locationDialog.close());
  document.querySelectorAll("[data-setting]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = Number(button.dataset.value);
      updatePendingSetting(button.dataset.setting, value);
    });
  });
  els.backHomeBtn.addEventListener("click", enterHome);
  els.cameraBtn.addEventListener("click", startCamera);
  els.scanBtn.addEventListener("click", scan);
  els.uploadBtn.addEventListener("click", () => {
    state.uploadContext = "scanner";
    els.uploadInput.click();
  });
  els.locateBtn.addEventListener("click", requestSensors);
  els.miniRadarBtn.addEventListener("click", openCompassMap);
  els.closeCompassBtn.addEventListener("click", () => els.compassDialog.close());
  els.compassDialog.addEventListener("close", hideCompassPopup);
  els.toggleCompassOverlayBtn.addEventListener("click", toggleCompassOverlay);
  document.querySelectorAll("[data-compass-style]").forEach((button) => {
    button.addEventListener("click", () => setCompassStyle(button.dataset.compassStyle));
  });
  els.uploadInput.addEventListener("change", loadUploadedFrame);
  els.headingRange.addEventListener("input", (event) => {
    state.heading = Number(event.target.value);
    updateHeadingUI();
    renderHome();
    renderTargets();
    renderDevPanel();
    updateCompassHeadingOverlay();
  });
  els.closeDetail.addEventListener("click", () => els.detailDialog.close());
  els.labelLayer.addEventListener("click", (event) => {
    const button = event.target.closest("[data-peak-id]");
    if (!button) return;
    const target = state.lastTargets.find((item) => item.peak.id === button.dataset.peakId);
    if (target) showDetail(target);
  });
}

function applyInitialRoute() {
  const params = new URLSearchParams(location.search);
  if (params.get("screen") === "scanner") {
    enterScanner("experiment");
  }
  if (params.get("scan") === "1") {
    window.setTimeout(scan, 450);
  }
  if (params.get("dev") === "1") {
    els.devPanel.classList.add("active");
    renderDevPanel();
  }
  if (params.get("compass") === "1") {
    if (params.get("compassStyle") === "fengshui") {
      state.compassStyle = "fengshui";
      state.compassOverlay = true;
    }
    window.setTimeout(openCompassMap, 500);
  }
  if (params.get("settings") === "1") {
    window.setTimeout(openSettings, 350);
  }
}

function setActiveViewpoint(index, options = { useDemoLocation: true }) {
  state.activeViewpointIndex = index;
  const viewpoint = getActiveViewpoint();
  if (options.useDemoLocation) {
    state.location = {
      label: `西湖 · ${viewpoint.name}`,
      lat: viewpoint.lat,
      lon: viewpoint.lon
    };
  }
  state.heading = viewpoint.heading;
  els.headingRange.value = String(Math.round(state.heading));
  updateHeadingUI();
}

function getActiveViewpoint() {
  return state.viewpoints[state.activeViewpointIndex];
}

function cycleViewpoint() {
  setActiveViewpoint((state.activeViewpointIndex + 1) % state.viewpoints.length);
  state.peaks = [...state.demoPeaks];
  state.dataSource = "西湖演示";
  state.hasScanResults = false;
  clearFrozenFrame();
  renderHome();
  renderMapFallback();
  renderTargets();
  updateMapFocus();
  renderDevPanel();
}

function renderHome() {
  const mapLocation = getMapLocation();
  const locationLabel = state.demoActive
    ? `西湖 · ${getActiveViewpoint().name}`
    : state.location?.label ?? "等待定位";
  const displayDataSource = state.demoActive ? "西湖演示" : state.dataSource;
  els.routeTitle.textContent = state.demoActive ? "演示模式" : state.location ? "当前位置" : "AR 模式";
  els.routeDescription.textContent = state.demoActive
    ? "当前使用西湖预置数据。真实识别请返回首页后点击 AR 模式重新定位。"
    : state.location
      ? `当前使用真实位置和 ${state.dataSource} 数据。点击 AR 模式可重新定位和刷新附近山峰。`
      : "点击 AR 模式或定位按钮后获取真实位置和附近山峰。";
  els.peakCount.textContent = String(getDisplayPeaks().length);
  els.homeHeading.textContent = String(Math.round(state.heading)).padStart(3, "0");
  els.dataSourceText.textContent = displayDataSource;
  els.scannerViewpoint.textContent = mapLocation ? locationLabel.replace("西湖 · ", "") : "等待定位";
  els.locationText.textContent = locationLabel;
}

function enterScanner(mode) {
  state.screen = "scanner";
  els.homeScreen.classList.remove("active");
  els.scannerScreen.classList.add("active");
  closeDevPanel();

  if (mode === "demo") {
    stopCamera();
    clearFrozenFrame();
    setActiveViewpoint(state.activeViewpointIndex);
    state.demoActive = true;
    state.location = null;
    state.peaks = [...state.demoPeaks];
    state.dataSource = "西湖演示";
    state.cameraMode = "demo";
    showCameraLayer("fallback");
    els.fallback.src = FALLBACK_IMAGE;
    setModePill("演示模式");
    setSensorPill("使用预置视角", "ready");
    renderHome();
  } else if (mode === "upload") {
    stopCamera();
    clearFrozenFrame();
    state.demoActive = false;
    state.cameraMode = "upload";
    showCameraLayer("fallback");
    setModePill("上传画面");
    setSensorPill("模拟识别", "ready");
  } else if (mode === "experiment") {
    stopCamera();
    clearFrozenFrame();
    state.demoActive = false;
    state.cameraMode = "demo";
    showCameraLayer("fallback");
    setModePill("AR 模式");
  setSensorPill(state.peaks.length ? "使用当前位置" : state.dataSource, state.peaks.length ? "ready" : "warn");
  }

  renderTargets();
  renderDevPanel();
}

function enterHome() {
  state.screen = "home";
  els.scannerScreen.classList.remove("active");
  els.homeScreen.classList.add("active");
  closeDevPanel();
  renderHome();
}

async function startRealExperiment() {
  if (state.homeBusy) return;
  setHomeBusy(true);
  state.demoActive = false;
  state.dataSource = "定位中";
  state.peaks = [];
  state.location = null;
  state.hasScanResults = false;
  renderHome();
  renderMapFallback();
  updateMapFocus();

  const [locationResult] = await Promise.allSettled([requestLocation(), requestOrientation()]);
  const gotLocation = locationResult.status === "fulfilled" && locationResult.value;
  if (!gotLocation) {
    state.dataSource = "定位失败";
    setHomeBusy(false);
    renderHome();
    renderMapFallback();
    renderDevPanel();
    showLocationError("start");
    return;
  }

  state.dataSource = "查询 OSM";
  setHomeBusy(true, "query");
  renderHome();

  await updateNearbyPeaks();
  renderHome();
  renderMapFallback();
  updateMapFocus();

  setHomeBusy(false);
  enterScanner("experiment");
  startCamera();
}

async function locateFromHome() {
  if (state.homeBusy) return;
  setHomeBusy(true);
  state.demoActive = false;
  state.dataSource = "定位中";
  renderHome();

  const gotLocation = await requestLocation();
  if (!gotLocation) {
    state.dataSource = "定位失败";
    setHomeBusy(false);
    renderHome();
    renderMapFallback();
    renderDevPanel();
    showLocationError("home");
    return;
  }

  state.dataSource = "查询 OSM";
  setHomeBusy(true, "query");
  renderHome();
  await updateNearbyPeaks();
  state.hasScanResults = false;
  setHomeBusy(false);
  renderHome();
  renderMapFallback();
  updateMapFocus();
  renderTargets();
  renderDevPanel();
}

async function startCamera() {
  clearFrozenFrame();

  if (!navigator.mediaDevices?.getUserMedia) {
    state.cameraMode = "demo";
    showCameraLayer("fallback");
    setModePill("相机不可用");
    setSensorPill("浏览器不支持相机", "warn");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    stopCamera();
    state.cameraStream = stream;
    state.cameraMode = "live";
    els.camera.srcObject = stream;
    await els.camera.play();
    showCameraLayer("camera");
    setModePill("实时相机");
    setSensorPill("相机已连接", "ready");
  } catch (error) {
    state.cameraMode = "demo";
    showCameraLayer("fallback");
    setModePill("相机未授权");
    setSensorPill(cameraErrorMessage(error), "warn");
  }

  renderDevPanel();
}

function stopCamera() {
  if (!state.cameraStream) return;
  state.cameraStream.getTracks().forEach((track) => track.stop());
  state.cameraStream = null;
  els.camera.srcObject = null;
}

async function requestSensors() {
  const [locationResult] = await Promise.allSettled([requestLocation(), requestOrientation()]);
  if (locationResult.status === "fulfilled" && locationResult.value) {
    state.demoActive = false;
    state.dataSource = "查询 OSM";
    renderHome();
    await updateNearbyPeaks();
    state.hasScanResults = false;
  } else {
    state.dataSource = "定位失败";
    renderHome();
    showLocationError("scanner");
  }
  renderHome();
  renderMapFallback();
  renderTargets();
  renderDevPanel();
  renderCompassMap();
}

function requestLocation() {
  if (!navigator.geolocation) {
    setSensorPill("定位不可用", "warn");
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        state.location = {
          label: "当前位置",
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        els.locationText.textContent = "当前位置";
        setSensorPill("定位已启用", "ready");
        resolve(true);
      },
      () => {
        setSensorPill("定位未授权", "warn");
        resolve(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 8000
      }
    );
  });
}

async function requestOrientation() {
  if (!("DeviceOrientationEvent" in window)) {
    setSensorPill("方向传感器不可用", "warn");
    return;
  }

  try {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== "granted") {
        setSensorPill("方向未授权", "warn");
        return;
      }
    }

    if (!state.orientationListening) {
      window.addEventListener("deviceorientationabsolute", handleOrientation, true);
      window.addEventListener("deviceorientation", handleOrientation, true);
      state.orientationListening = true;
    }
    setSensorPill("方向已启用", "ready");
  } catch {
    setSensorPill("方向未授权", "warn");
  }
}

async function updateNearbyPeaks() {
  if (!state.location) return;

  const radius = state.settings.searchRadiusKm * 1000;
  const result = await fetchNearbyPeaks(state.location.lat, state.location.lon, radius);

  if (result.peaks.length) {
    state.peaks = result.peaks;
    state.dataSource = result.fromCache ? "开放数据暂不可用" : "OSM/Overpass";
    if (!result.fromCache) {
      writePeakCache(state.location, radius, result.peaks);
    }
    return;
  }

  if (state.peaks.length) {
    state.dataSource = "开放数据暂不可用";
    return;
  }

  state.peaks = [];
  state.dataSource = "附近暂无开放山峰数据";
}

async function fetchNearbyPeaks(lat, lon, radius = state.settings.searchRadiusKm * 1000) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const peaks = await fetchNearbyPeaksOnce(lat, lon, radius);
    if (peaks.length) return { peaks, fromCache: false };
    if (attempt < 2) await delay(650 + attempt * 700);
  }

  const cached = readPeakCache(lat, lon, radius);
  if (cached.length) return { peaks: cached, fromCache: true };
  return { peaks: [], fromCache: false };
}

async function fetchNearbyPeaksOnce(lat, lon, radius) {
  const query = `
    [out:json][timeout:12];
    node(around:${radius},${lat},${lon})["natural"="peak"]["name"];
    out body 80;
  `;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 14000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Overpass ${response.status}`);
    const data = await response.json();

    return (data.elements ?? [])
      .filter((item) => item.lat && item.lon && item.tags?.name)
      .map((item) => {
        const name = item.tags["name:zh"] || item.tags.name || item.tags["name:en"] || "未命名山峰";
        const elevation = parseElevation(item.tags.ele);
        return {
          id: `osm-${item.id}`,
          name,
          enName: item.tags["name:en"] || "",
          lat: item.lat,
          lon: item.lon,
          elevation,
          screenY: hasPeakElevation({ elevation }) && elevation > 300 ? 38 : 48,
          tags: ["OSM", "当前位置"],
          intro: `${name} 来自 OpenStreetMap/Overpass 开放数据。当前原型根据当前位置、朝向和山峰坐标推断它是否位于视野内。`,
          route: "开放数据通常不包含完整登山路线；后续可为重点区域补充人工校准的路线和介绍。"
        };
      })
      .sort((a, b) => distanceMeters({ lat, lon }, a) - distanceMeters({ lat, lon }, b));
  } catch {
    return [];
  } finally {
    window.clearTimeout(timeout);
  }
}

function readPeakCache(lat, lon, radius) {
  try {
    const cache = JSON.parse(localStorage.getItem(PEAK_CACHE_KEY) || "null");
    if (!cache || !Array.isArray(cache.peaks)) return [];
    if (Date.now() - cache.savedAt > PEAK_CACHE_TTL) return [];
    if (Math.abs(cache.radius - radius) > 1) return [];
    const distance = distanceMeters({ lat, lon }, cache.location);
    return distance <= Math.max(3000, radius * 0.15) ? cache.peaks : [];
  } catch {
    return [];
  }
}

function writePeakCache(locationPoint, radius, peaks) {
  try {
    localStorage.setItem(
      PEAK_CACHE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        location: { lat: locationPoint.lat, lon: locationPoint.lon },
        radius,
        peaks
      })
    );
  } catch {
    // Cache is optional; keep the live result even if storage is unavailable.
  }
}

function clearPeakCache() {
  localStorage.removeItem(PEAK_CACHE_KEY);
  setSensorPill("山峰缓存已清除", "ready");
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function parseElevation(value) {
  if (!value) return null;
  const match = String(value).match(/-?\d+(\.\d+)?/);
  return match ? Math.round(Number(match[0])) : null;
}

function handleOrientation(event) {
  const rawHeading =
    typeof event.webkitCompassHeading === "number"
      ? event.webkitCompassHeading
      : typeof event.alpha === "number"
        ? 360 - event.alpha
        : null;

  if (rawHeading === null) return;

  state.heading = smoothHeading(state.heading, normalizeDegrees(rawHeading), 0.18);
  scheduleHeadingRender();
}

function scheduleHeadingRender() {
  if (state.headingFrame) return;
  state.headingFrame = window.requestAnimationFrame(() => {
    state.headingFrame = null;
    els.headingRange.value = String(Math.round(state.heading));
    updateHeadingUI();
    if (els.compassDialog.open) {
      updateCompassHeadingOverlay();
      return;
    }
    if (state.arLive || state.hasScanResults) {
      renderTargets();
    } else {
      renderRadar(computeTargets().slice(0, getMaxLabels()));
    }
    renderDevPanel();
    updateCompassHeadingOverlay();
  });
}

function scan() {
  els.scannerScreen.classList.add("scanning");
  state.hasScanResults = false;
  state.arLive = false;
  state.contourModel = null;
  renderTargets();

  window.setTimeout(() => {
    if (state.cameraMode === "upload") {
      freezeCurrentFrame();
    } else {
      state.frozen = false;
      els.frozen.removeAttribute("src");
      els.frozen.classList.remove("active");
      showCameraLayer(state.cameraMode === "live" ? "camera" : "fallback");
      setModePill(state.cameraMode === "live" ? "实时识别" : "实时叠加");
    }
    state.contourModel = captureContourModel();
    state.hasScanResults = true;
    state.arLive = true;
    state.lastTargets = computeTargets().slice(0, getMaxLabels());
    renderTargets();
    renderDevPanel();
    els.scannerScreen.classList.remove("scanning");
  }, 780);
}

function freezeCurrentFrame() {
  const canvas = document.createElement("canvas");
  const width = 1280;
  const height = 720;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (state.cameraMode === "live" && els.camera.videoWidth > 0) {
    drawVideoCover(ctx, els.camera, width, height);
  } else {
    drawImageCover(ctx, els.fallback, width, height);
  }

  els.frozen.src = canvas.toDataURL("image/jpeg", 0.88);
  state.frozen = true;
  showCameraLayer("frozen");
  setModePill("定帧识别");
}

function captureContourModel() {
  const canvas = document.createElement("canvas");
  const width = 320;
  const height = 180;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  try {
    if (!drawCurrentFrameForAnalysis(ctx, width, height)) return null;
    const imageData = ctx.getImageData(0, 0, width, height);
    return createContourModelFromImageData(imageData);
  } catch {
    return null;
  }
}

function drawCurrentFrameForAnalysis(ctx, width, height) {
  if (state.cameraMode === "live" && els.camera.videoWidth > 0) {
    drawVideoCover(ctx, els.camera, width, height);
    return true;
  }
  if (els.frozen.classList.contains("active") && els.frozen.naturalWidth > 0) {
    drawImageCover(ctx, els.frozen, width, height);
    return true;
  }
  if (els.fallback.naturalWidth > 0) {
    drawImageCover(ctx, els.fallback, width, height);
    return true;
  }
  return false;
}

function clearFrozenFrame() {
  state.frozen = false;
  state.hasScanResults = false;
  state.arLive = false;
  state.lastTargets = [];
  state.contourModel = null;
  els.frozen.removeAttribute("src");
  els.frozen.classList.remove("active");
  renderTargets();
}

function loadUploadedFrame(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (state.uploadedUrl) URL.revokeObjectURL(state.uploadedUrl);
  state.uploadedUrl = URL.createObjectURL(file);
  els.fallback.src = state.uploadedUrl;
  stopCamera();

  if (!state.location || !state.peaks.length) {
    state.dataSource = "定位失败";
    renderHome();
    showLocationError("upload");
    event.target.value = "";
    return;
  }

  enterScanner("upload");
  showCameraLayer("fallback");
  event.target.value = "";
}

function showCameraLayer(name) {
  els.camera.classList.toggle("active", name === "camera");
  els.fallback.classList.toggle("active", name === "fallback");
  els.frozen.classList.toggle("active", name === "frozen");
}

function setModePill(text) {
  els.modePill.textContent = text;
}

function setSensorPill(text, tone) {
  els.sensorPill.textContent = text;
  els.sensorPill.className = `sensor-pill ${tone === "warn" ? "warn" : ""}`;
}

function setHomeBusy(active, stage = "locating") {
  state.homeBusy = active;
  els.homeScreen.classList.toggle("home-loading", active);
  els.homeScreen.classList.toggle("home-loading-query", active && stage === "query");
  els.homeScreen.setAttribute("aria-busy", active ? "true" : "false");
  els.startScanBtn.classList.toggle("loading", active);
  els.startScanBtn.disabled = active;
  els.homeLocateBtn.disabled = active;
}

function renderTargets() {
  const targets = computeTargets().slice(0, getMaxLabels());
  state.lastTargets = state.hasScanResults ? targets : [];
  els.labelLayer.innerHTML = "";

  if (state.hasScanResults) {
    targets.forEach((target, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `mountain-label ${index === 0 ? "primary" : ""}`;
      button.dataset.peakId = target.peak.id;
      button.dataset.anchorSource = target.anchorSource;
      button.style.left = `${target.x}%`;
      button.style.top = `${target.y}%`;
      button.innerHTML = `
        <strong>${target.peak.name}</strong>
        <span class="label-metrics">
          <b>↔ ${formatDistance(target.distance)}</b>
          <b>▲ ${formatElevation(target.peak.elevation)}</b>
          <b>◉ ${Math.round(target.confidence * 100)}%</b>
        </span>
        <i class="label-stem" style="${makeStemStyle(target)}" aria-hidden="true"></i>
      `;
      els.labelLayer.appendChild(button);
    });

    if (!targets.length) {
      const empty = document.createElement("div");
      empty.className = "label-empty";
      empty.textContent = state.peaks.length ? "当前朝向暂无山峰目标" : "附近暂无开放山峰数据";
      els.labelLayer.appendChild(empty);
    } else if (state.hiddenTargetCount > 0 && shouldShowOverflowNotice(targets)) {
      const overflow = document.createElement("div");
      overflow.className = "label-overflow";
      overflow.textContent = `还有 ${state.hiddenTargetCount} 个附近目标`;
      els.labelLayer.appendChild(overflow);
    }
  }

  renderRadar(targets);
}

function computeTargets() {
  const locationPoint = getMapLocation();
  if (!locationPoint) {
    state.hiddenTargetCount = 0;
    return [];
  }

  const measured = getDisplayPeaks().map((peak) => {
    const distance = distanceMeters(locationPoint, peak);
    const bearing = bearingDegrees(locationPoint, peak);
    const relative = normalizeRelativeAngle(bearing - state.heading);
    const visible = Math.abs(relative) <= FOV_DEGREES / 2;
    const confidence = clamp(1 - Math.abs(relative) / (FOV_DEGREES * 0.78), 0.38, 0.96);
    const x = clamp(50 + (relative / (FOV_DEGREES / 2)) * 36, 24, 76);
    const distanceLift = clamp((2400 - distance) / 2400, -0.4, 0.8) * 6;
    const y = clamp((peak.screenY ?? 48) - distanceLift, 25, 67);

    const target = {
      peak,
      distance,
      bearing,
      relative,
      visible,
      confidence,
      x,
      y,
      score: targetPriority({ peak, distance, relative })
    };
    return applyContourAnchor(target, state.contourModel);
  });

  const visible = measured.filter((item) => item.visible);
  const selected = selectTargets(visible, getMaxLabels());
  state.hiddenTargetCount = Math.max(0, visible.length - selected.length);
  return placeLabels(selected);
}

function placeLabels(targets) {
  const offsets = [0, -12, 12, -24, 24, -34, 34];
  const placed = [];
  const sorted = [...targets].sort((a, b) => {
    return displayRank(a) - displayRank(b);
  });

  sorted.forEach((target) => {
    if (placed.length >= getMaxLabels()) return;
    for (const offset of offsets) {
      const candidate = { ...target, y: clamp(target.y + offset, 25, 68) };
      const collides = placed.some((item) => labelsCollide(item, candidate));
      if (!collides) {
        placed.push(candidate);
        return;
      }
    }
    placed.push({ ...target, y: clamp(target.y, 25, 68) });
  });

  return placed;
}

function selectTargets(targets, maxLabels) {
  const selected = [];
  if (!maxLabels || maxLabels <= 0) return selected;

  const centerTarget = targets
    .filter((target) => Math.abs(target.relative) <= CENTER_PRIORITY_DEGREES)
    .sort((a, b) => Math.abs(a.relative) - Math.abs(b.relative) || a.distance - b.distance)[0];

  if (centerTarget) {
    selected.push(markSelectedTarget(centerTarget, 0, true, "center"));
  }

  targets
    .filter((target) => !centerTarget || target.peak.id !== centerTarget.peak.id)
    .sort((a, b) => a.distance - b.distance || Math.abs(a.relative) - Math.abs(b.relative))
    .some((target) => {
      if (selected.length >= maxLabels) return true;
      selected.push(markSelectedTarget(target, selected.length, false, "nearest"));
      return false;
    });

  return selected;
}

function markSelectedTarget(target, displayRankValue, primary, selectionReason) {
  return {
    ...target,
    displayRank: displayRankValue,
    primary,
    selectionReason
  };
}

function labelsCollide(a, b) {
  return Math.abs(a.x - b.x) < 22 && Math.abs(a.y - b.y) < 14;
}

function shouldShowOverflowNotice(targets) {
  const noticePosition = { x: 25, y: 18 };
  return !targets.some((target) => labelsCollide(target, noticePosition));
}

function targetPriority(target) {
  const centerPenalty = Math.abs(target.relative) * 0.35;
  const distancePenalty = target.distance / 180;
  const elevationPenalty = hasPeakElevation(target.peak) ? 0 : 2;
  const sourcePenalty = target.peak.tags?.includes("OSM") ? 0 : 1;
  return centerPenalty + distancePenalty + elevationPenalty + sourcePenalty;
}

function displayRank(target) {
  return Number.isFinite(target.displayRank) ? target.displayRank : targetPriority(target);
}

function applyContourAnchor(target, contourModel) {
  const fallbackY = getFallbackAnchorY(target);
  const anchorX = clamp(Number(target.x), 18, 82);
  const contourY = sampleContourY(contourModel, anchorX);
  if (contourY === null) {
    return {
      ...target,
      anchorX,
      anchorY: fallbackY,
      anchorSource: "data"
    };
  }

  const blended = Math.abs(contourY - fallbackY) <= 18
    ? contourY
    : fallbackY * 0.45 + contourY * 0.55;
  return {
    ...target,
    anchorX,
    anchorY: clamp(blended, 22, 74),
    anchorSource: "contour"
  };
}

function getFallbackAnchorY(target) {
  const peakY = Number(target.peak?.screenY);
  if (Number.isFinite(peakY)) return clamp(peakY, 22, 74);
  return clamp(Number(target.y) || 48, 22, 74);
}

function sampleContourY(model, xPercent) {
  if (!model?.yByX?.length) return null;
  const index = Math.round(clamp(xPercent, 0, 100) / 100 * (model.sampleWidth - 1));
  const values = [];
  for (let offset = -3; offset <= 3; offset += 1) {
    const value = model.yByX[index + offset];
    if (Number.isFinite(value)) values.push(value);
  }
  if (!values.length) return null;
  values.sort((a, b) => a - b);
  return (values[Math.floor(values.length / 2)] / model.sampleHeight) * 100;
}

function createContourModelFromImageData(imageData) {
  if (!imageData?.data?.length) return null;
  const sampleWidth = 160;
  const sampleHeight = 96;
  const startY = Math.floor(sampleHeight * 0.18);
  const endY = Math.floor(sampleHeight * 0.78);
  const yByX = [];
  let hits = 0;
  let scoreTotal = 0;

  for (let sx = 0; sx < sampleWidth; sx += 1) {
    const sourceX = Math.floor(((sx + 0.5) / sampleWidth) * imageData.width);
    let bestY = null;
    let bestScore = 0;

    for (let sy = startY; sy <= endY; sy += 1) {
      const top = samplePixel(imageData, sourceX, Math.floor(((sy - 2) / sampleHeight) * imageData.height));
      const bottom = samplePixel(imageData, sourceX, Math.floor(((sy + 3) / sampleHeight) * imageData.height));
      const brightToDark = top.luma - bottom.luma;
      const contrast = Math.abs(brightToDark);
      const mountainColorBias = Math.max(0, bottom.g - bottom.b) * 0.12;
      const score = brightToDark * 1.15 + contrast * 0.32 + mountainColorBias;

      if (score > bestScore) {
        bestScore = score;
        bestY = sy;
      }
    }

    if (bestY !== null && bestScore >= 18) {
      yByX[sx] = bestY;
      hits += 1;
      scoreTotal += bestScore;
    } else {
      yByX[sx] = null;
    }
  }

  if (hits < sampleWidth * 0.22) return null;

  return {
    confidence: clamp((hits / sampleWidth) * 0.72 + (scoreTotal / hits / 80) * 0.28, 0, 1),
    sampleHeight,
    sampleWidth,
    yByX: smoothContour(yByX)
  };
}

function samplePixel(imageData, x, y) {
  const safeX = Math.round(clamp(x, 0, imageData.width - 1));
  const safeY = Math.round(clamp(y, 0, imageData.height - 1));
  const index = (safeY * imageData.width + safeX) * 4;
  const data = imageData.data;
  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];
  return {
    b,
    g,
    luma: r * 0.299 + g * 0.587 + b * 0.114,
    r
  };
}

function smoothContour(values) {
  return values.map((value, index) => {
    if (!Number.isFinite(value)) return null;
    const windowValues = [];
    for (let offset = -2; offset <= 2; offset += 1) {
      const next = values[index + offset];
      if (Number.isFinite(next)) windowValues.push(next);
    }
    windowValues.sort((a, b) => a - b);
    return windowValues[Math.floor(windowValues.length / 2)];
  });
}

function makeStemStyle(target) {
  const startX = Number(target.x) || 50;
  const startY = (Number(target.y) || 48) + 5.4;
  const anchorX = Number(target.anchorX) || startX;
  const anchorY = Number(target.anchorY) || getFallbackAnchorY(target);
  const dxPx = ((anchorX - startX) / 100) * window.innerWidth;
  const dyPx = ((anchorY - startY) / 100) * window.innerHeight;
  const length = clamp(Math.sqrt(dxPx * dxPx + dyPx * dyPx), 22, 190);
  const angle = Math.atan2(dyPx, dxPx) * (180 / Math.PI) - 90;
  return `height:${length.toFixed(1)}px;transform:rotate(${angle.toFixed(1)}deg);`;
}

function computeTargetForPeak(peak) {
  const locationPoint = getMapLocation();
  if (!locationPoint) return null;
  const distance = distanceMeters(locationPoint, peak);
  const bearing = bearingDegrees(locationPoint, peak);
  const relative = normalizeRelativeAngle(bearing - state.heading);
  const confidence = clamp(1 - Math.abs(relative) / (FOV_DEGREES * 0.78), 0.38, 0.96);
  return {
    peak,
    distance,
    bearing,
    relative,
    visible: Math.abs(relative) <= FOV_DEGREES / 2,
    confidence,
    x: 50,
    y: peak.screenY ?? 48
  };
}

function getDisplayPeaks() {
  const locationPoint = getMapLocation();
  const rangeMeters = getViewRangeMeters();
  const peaks = state.demoActive ? state.demoPeaks : state.peaks;
  if (!locationPoint) return [];
  return peaks.filter((peak) => distanceMeters(locationPoint, peak) <= rangeMeters);
}

function getViewRangeMeters() {
  return state.settings.searchRadiusKm * 1000;
}

function getMapLocation() {
  return state.location ?? (state.demoActive ? getActiveViewpoint() : null);
}

function renderRadar(targets) {
  els.radarDots.innerHTML = "";
  els.radarHeading.style.transform = `translateX(-50%) rotate(${state.heading}deg)`;
  const visibleIds = new Set(targets.map((item) => item.peak.id));

  const locationPoint = getMapLocation();
  if (!locationPoint) return;

  getDisplayPeaks().forEach((peak) => {
    const bearing = bearingDegrees(locationPoint, peak);
    const distance = distanceMeters(locationPoint, peak);
    const radius = clamp(distance / 9500, 0.18, 0.46) * 92;
    const angle = ((bearing - 90) * Math.PI) / 180;
    const x = 46 + Math.cos(angle) * radius;
    const y = 46 + Math.sin(angle) * radius;
    const dot = document.createElement("span");
    dot.className = `radar-dot ${visibleIds.has(peak.id) ? "visible" : ""}`;
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    els.radarDots.appendChild(dot);
  });
}

function renderMapFallback() {
  els.mapFallbackDots.innerHTML = "";
  const peakPoints = getDisplayPeaks();
  const mapLocation = getMapLocation();
  if (!mapLocation) return;
  const locationPoints = [mapLocation];
  const points = [...peakPoints, ...locationPoints];
  const bounds = getBounds(points);

  peakPoints.forEach((peak) => {
    const dot = document.createElement("span");
    dot.className = "map-dot peak";
    const position = projectToMapFallback(peak, bounds);
    dot.style.left = `${position.x}%`;
    dot.style.top = `${position.y}%`;
    dot.title = peak.name;
    els.mapFallbackDots.appendChild(dot);
  });

  const viewpointDot = document.createElement("span");
  viewpointDot.className = "map-dot";
  const position = projectToMapFallback(mapLocation, bounds);
  viewpointDot.style.left = `${position.x}%`;
  viewpointDot.style.top = `${position.y}%`;
  viewpointDot.title = state.location?.label ?? getActiveViewpoint().name;
  els.mapFallbackDots.appendChild(viewpointDot);
}

function setupMapWhenReady() {
  const trySetup = () => {
    if (!window.maplibregl || state.map) return;
    setupMap();
  };

  trySetup();
  window.setTimeout(trySetup, 800);
  window.setTimeout(trySetup, 2200);
}

function setupMap() {
  const source = getMapSource(state.mapSourceIndex);
  if (!source) {
    els.mapFallback.classList.add("active");
    return;
  }

  try {
    const center = getMapLocation() ?? getActiveViewpoint();
    state.map = new window.maplibregl.Map({
      container: els.map,
      style: source.style,
      center: [center.lon, center.lat],
      zoom: 12.2,
      attributionControl: false,
      interactive: false
    });

    state.map.once("load", () => {
      els.mapFallback.classList.remove("active");
      addMapMarkers();
    });

    state.map.on("error", () => {
      switchMapSource("home");
    });
  } catch {
    switchMapSource("home");
  }
}

function getMapSource(index = 0) {
  const queue = getMapSourceQueue();
  const key = queue[index];
  if (!key || key === "local") return null;
  return MAP_SOURCES[key] ?? null;
}

function getMapSourceQueue() {
  return state.settings.mapSource === "auto"
    ? AUTO_MAP_SOURCE_ORDER
    : [state.settings.mapSource, "local"];
}

function switchMapSource(target) {
  const indexKey = target === "compass" ? "compassMapSourceIndex" : "mapSourceIndex";
  state[indexKey] += 1;
  const next = getMapSource(state[indexKey]);
  if (!next) {
    if (target === "compass") {
      state.compassMapReady = false;
      els.compassDialog.classList.remove("map-ready");
      renderCompassMap();
    } else {
      els.mapFallback.classList.add("active");
    }
    return;
  }

  if (target === "compass") {
    destroyCompassMap();
    setupCompassMap();
  } else {
    destroyHomeMap();
    setupMap();
  }
}

function reloadMaps() {
  state.mapSourceIndex = 0;
  state.compassMapSourceIndex = 0;
  destroyHomeMap();
  destroyCompassMap();
  els.mapFallback.classList.add("active");
  setupMapWhenReady();
  if (els.compassDialog.open) {
    setupCompassMapWhenReady();
    renderCompassMap();
  }
}

function destroyHomeMap() {
  clearMapMarkers();
  if (state.map) {
    state.map.remove();
    state.map = null;
  }
}

function addMapMarkers() {
  clearMapMarkers();
  if (!state.map) return;

  getDisplayPeaks().forEach((peak) => {
    const el = document.createElement("span");
    el.className = "maplibre-marker peak-marker";
    const marker = new window.maplibregl.Marker({ element: el })
      .setLngLat([peak.lon, peak.lat])
      .addTo(state.map);
    state.mapMarkers.push(marker);
  });

  const el = document.createElement("span");
  el.className = "maplibre-marker viewpoint-marker";
  const markerLocation = getMapLocation();
  if (!markerLocation) return;
  const marker = new window.maplibregl.Marker({ element: el })
    .setLngLat([markerLocation.lon, markerLocation.lat])
    .addTo(state.map);
  state.mapMarkers.push(marker);
}

function clearMapMarkers() {
  state.mapMarkers.forEach((marker) => marker.remove());
  state.mapMarkers = [];
}

function updateMapFocus() {
  if (!state.map) return;
  const center = getMapLocation();
  if (!center) return;
  state.map.jumpTo({
    center: [center.lon, center.lat],
    zoom: 12.2
  });
  addMapMarkers();
}

function buildCompassDial() {
  const cardinal = [
    { label: "N", angle: 0, stem: "0°" },
    { label: "E", angle: 90, stem: "90°" },
    { label: "S", angle: 180, stem: "180°" },
    { label: "W", angle: 270, stem: "270°" }
  ];
  const secondary = [
    { label: "NE", angle: 45, stem: "45°" },
    { label: "SE", angle: 135, stem: "135°" },
    { label: "SW", angle: 225, stem: "225°" },
    { label: "NW", angle: 315, stem: "315°" }
  ];
  const ticks = Array.from({ length: 72 }, (_, index) => {
    const angle = index * 5;
    const className = angle % 45 === 0 ? "dial-tick big" : angle % 15 === 0 ? "dial-tick medium" : "dial-tick";
    return `<i class="${className}" style="--angle:${angle}deg"></i>`;
  });
  const labels = [
    ...cardinal.map((item) => ({ ...item, className: "dial-label major", radius: 34 })),
    ...secondary.map((item) => ({ ...item, className: "dial-label minor", radius: 34 })),
    ...COMPASS_POINTS.map((item) => ({ ...item, className: "dial-label mountain", radius: 43 }))
  ];
  const labelMarkup = labels
    .map((item) => {
      const point = polarPercent(item.angle, item.radius);
      const text = item.stem ? `${item.label}<small>${item.stem}</small>` : item.label;
      return `<span class="${item.className}" style="left:${point.x}%;top:${point.y}%">${text}</span>`;
    })
    .join("");

  els.compassDial.innerHTML = `
    <div class="dial-cross" aria-hidden="true"></div>
    <div class="dial-ring ring-outer" aria-hidden="true"></div>
    <div class="dial-ring ring-nav-mid" aria-hidden="true"></div>
    <div class="dial-ring ring-nav-inner" aria-hidden="true"></div>
    <div class="dial-ring ring-mountain" aria-hidden="true"></div>
    <div class="dial-ring ring-bagua" aria-hidden="true"></div>
    <div class="dial-ring ring-center" aria-hidden="true"></div>
    ${ticks.join("")}
    ${labelMarkup}
    <span class="dial-center"><b>${FOV_DEGREES}°</b><small>FOV</small></span>
  `;
}

function openCompassMap() {
  if (!els.compassDialog.open) {
    els.compassDialog.showModal();
  }
  setupCompassMapWhenReady();
  renderCompassMap();
}

function toggleCompassOverlay() {
  state.compassOverlay = !state.compassOverlay;
  renderCompassMap();
}

function setCompassStyle(style) {
  state.compassStyle = style === "fengshui" ? "fengshui" : "standard";
  updateCompassStyleButtons();
  renderCompassMap();
}

function updateCompassStyleButtons() {
  document.querySelectorAll("[data-compass-style]").forEach((button) => {
    button.classList.toggle("active", button.dataset.compassStyle === state.compassStyle);
  });
}

function setupCompassMapWhenReady() {
  setupCompassMap();
  window.setTimeout(setupCompassMap, 700);
  window.setTimeout(setupCompassMap, 1800);
  window.setTimeout(setupCompassMap, 3200);
}

function renderCompassMap() {
  if (!els.compassDialog.open) return;

  const locationPoint = getMapLocation();
  if (!locationPoint) {
    els.compassBearingText.textContent = `${Math.round(normalizeDegrees(state.heading))}°`;
    els.compassSourceText.textContent = "未定位";
    els.compassModeText.textContent = "等待定位";
    els.compassRadiusText.textContent = `${state.settings.searchRadiusKm}km · ${FOV_DEGREES}°`;
    els.compassDots.innerHTML = "";
    els.compassDistanceRings.innerHTML = "";
    clearCompassMarkers();
    hideCompassPopup();
    updateCompassStyleButtons();
    els.compassDial.className = `compass-dial ${state.compassStyle} ${state.compassOverlay ? "active" : ""}`;
    return;
  }
  const peaks = getDisplayPeaks();
  const heading = normalizeDegrees(state.heading);

  els.compassBearingText.textContent = `${Math.round(heading)}°`;
  els.compassSourceText.textContent = state.demoActive ? "西湖演示" : state.location ? state.dataSource : "未定位";
  els.compassModeText.textContent = getCompassModeText();
  els.compassRadiusText.textContent = `${state.settings.searchRadiusKm}km · ${FOV_DEGREES}°`;
  els.toggleCompassOverlayBtn.classList.toggle("active", state.compassOverlay);
  els.toggleCompassOverlayBtn.textContent = state.compassOverlay ? "隐藏叠层" : "罗盘叠层";
  updateCompassStyleButtons();
  els.compassDial.className = `compass-dial ${state.compassStyle} ${state.compassOverlay ? "active" : ""}`;

  if (state.compassMapReady) {
    renderCompassMapMarkers(peaks);
    focusCompassMap(locationPoint);
  } else {
    renderCompassFallback(peaks, locationPoint);
  }

  updateCompassHeadingOverlay();
}

function setupCompassMap() {
  if (state.compassMap || !window.maplibregl) return;
  const source = getMapSource(state.compassMapSourceIndex);
  if (!source) {
    state.compassMapReady = false;
    els.compassDialog.classList.remove("map-ready");
    renderCompassMap();
    return;
  }

  const center = getMapLocation();
  if (!center) return;
  try {
    state.compassMap = new window.maplibregl.Map({
      container: els.compassMap,
      style: source.style,
      center: [center.lon, center.lat],
      zoom: 12.8,
      attributionControl: false,
      interactive: true
    });

    state.compassMap.addControl(new window.maplibregl.NavigationControl({ showCompass: false }), "top-right");
    state.compassMap.on("load", () => {
      state.compassMapReady = true;
      els.compassDialog.classList.add("map-ready");
      renderCompassMap();
    });
    state.compassMap.on("move", () => {
      hideCompassPopup();
      updateCompassHeadingOverlay();
    });
    state.compassMap.on("click", hideCompassPopup);
    state.compassMap.on("error", () => {
      switchMapSource("compass");
    });
  } catch {
    state.compassMap = null;
    state.compassMapReady = false;
    els.compassDialog.classList.remove("map-ready");
  }
}

function focusCompassMap(locationPoint) {
  if (!state.compassMapReady) return;
  state.compassMap.resize();
  state.compassMap.easeTo({
    center: [locationPoint.lon, locationPoint.lat],
    zoom: Math.max(state.compassMap.getZoom(), 12.2),
    bearing: 0,
    pitch: 0,
    duration: 0
  });
}

function renderCompassMapMarkers(peaks) {
  if (!state.compassMapReady) return;
  clearCompassMarkers();

  peaks.forEach((peak) => {
    const target = computeTargetForPeak(peak);
    const markerEl = document.createElement("button");
    markerEl.type = "button";
    markerEl.className = `compass-map-marker peak ${target?.visible ? "visible" : ""}`;
    markerEl.title = peak.name;
    markerEl.addEventListener("click", (event) => {
      event.stopPropagation();
      if (target) showCompassPopup(target);
    });
    const marker = new window.maplibregl.Marker({ element: markerEl })
      .setLngLat([peak.lon, peak.lat])
      .addTo(state.compassMap);
    state.compassMarkers.push(marker);
  });

  const locationPoint = getMapLocation();
  const hereEl = document.createElement("span");
  hereEl.className = "compass-map-marker here";
  const hereMarker = new window.maplibregl.Marker({ element: hereEl })
    .setLngLat([locationPoint.lon, locationPoint.lat])
    .addTo(state.compassMap);
  state.compassMarkers.push(hereMarker);
}

function clearCompassMarkers() {
  state.compassMarkers.forEach((marker) => marker.remove());
  state.compassMarkers = [];
}

function destroyCompassMap() {
  clearCompassMarkers();
  state.compassMapReady = false;
  if (state.compassMap) {
    state.compassMap.remove();
    state.compassMap = null;
  }
  els.compassDialog.classList.remove("map-ready");
}

function renderCompassFallback(peaks, locationPoint) {
  const bounds = getBounds([...peaks, locationPoint]);
  const center = projectToMapFallback(locationPoint, bounds);

  els.compassDots.innerHTML = "";
  peaks.forEach((peak) => {
    const position = projectToMapFallback(peak, bounds);
    const target = computeTargetForPeak(peak);
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = `compass-dot peak ${target?.visible ? "visible" : ""}`;
    dot.style.left = `${position.x}%`;
    dot.style.top = `${position.y}%`;
    dot.title = peak.name;
    dot.addEventListener("click", (event) => {
      event.stopPropagation();
      if (target) showCompassPopup(target, position, "%");
    });
    els.compassDots.appendChild(dot);
  });

  const here = document.createElement("span");
  here.className = "compass-dot here";
  here.style.left = `${center.x}%`;
  here.style.top = `${center.y}%`;
  here.title = locationPoint.label ?? "当前位置";
  els.compassDots.appendChild(here);
}

function updateCompassHeadingOverlay() {
  if (!els.compassDialog.open) return;

  const locationPoint = getMapLocation();
  if (!locationPoint) return;
  const heading = normalizeDegrees(state.heading);
  const center = getCompassScreenCenter(locationPoint);
  state.compassCenter = center;

  els.compassBearingText.textContent = `${Math.round(heading)}°`;
  els.compassDial.style.left = center.left;
  els.compassDial.style.top = center.top;
  els.compassDial.style.transform = "translate(-50%, -50%)";

  els.compassViewCone.style.left = center.left;
  els.compassViewCone.style.top = center.top;
  els.compassViewCone.style.transform = `translate(-50%, -50%) rotate(${heading}deg)`;
  els.compassHeadingLine.style.left = center.left;
  els.compassHeadingLine.style.top = center.top;
  els.compassHeadingLine.style.transform = `translate(-50%, -100%) rotate(${heading}deg)`;
  renderCompassDistanceRings(locationPoint, center);
}

function renderCompassDistanceRings(locationPoint, center) {
  if (!els.compassDistanceRings) return;

  const ringDistances = getCompassRingDistances();
  const maxDistance = ringDistances[ringDistances.length - 1] * 1000;
  const maxRadius = getCompassMaxRingRadius(locationPoint, maxDistance);

  els.compassDistanceRings.innerHTML = ringDistances
    .map((distanceKm, index) => {
      const ratio = Math.sqrt(distanceKm / ringDistances[ringDistances.length - 1]);
      const radius = Math.max(28, Math.round(maxRadius * ratio));
      const labelY = 38 + index * 12;
      return `
        <span class="distance-ring" style="left:${center.left};top:${center.top};width:${radius * 2}px;height:${radius * 2}px;--label-y:${labelY}%">
          <em>${distanceKm}km</em>
        </span>
      `;
    })
    .join("");
}

function getCompassRingDistances() {
  const radius = state.settings.searchRadiusKm;
  if (radius <= 3) return [1, 2, 3];
  if (radius <= 5) return [1, 3, 5];
  if (radius <= 10) return [3, 5, 10];
  return [5, 10, 30];
}

function getCompassMaxRingRadius(locationPoint, maxDistance) {
  const mapRect = els.compassMap.getBoundingClientRect();
  const maxAllowedRadius = Math.min(mapRect.width, mapRect.height) * 0.42;

  if (state.compassMapReady) {
    const centerPoint = state.compassMap.project([locationPoint.lon, locationPoint.lat]);
    const eastPoint = destinationPoint(locationPoint, 90, maxDistance);
    const projectedEast = state.compassMap.project([eastPoint.lon, eastPoint.lat]);
    const projectedRadius = Math.abs(projectedEast.x - centerPoint.x);
    return clamp(projectedRadius, 72, maxAllowedRadius);
  }

  return clamp(window.innerWidth * 0.35, 92, maxAllowedRadius);
}

function getCompassModeText() {
  if (state.demoActive) return "演示朝向";
  if (!state.location) return "等待定位";
  if (state.orientationListening) return "设备罗盘";
  return "手动校准";
}

function getCompassScreenCenter(locationPoint) {
  if (state.compassMapReady) {
    const point = state.compassMap.project([locationPoint.lon, locationPoint.lat]);
    return { left: `${point.x}px`, top: `${point.y}px` };
  }

  const peaks = getDisplayPeaks();
  const bounds = getBounds([...peaks, locationPoint]);
  const point = projectToMapFallback(locationPoint, bounds);
  return { left: `${point.x}%`, top: `${point.y}%` };
}

function showCompassPopup(target, fallbackPosition = null, fallbackUnit = "px") {
  state.compassPopupTarget = target;
  const point = state.compassMapReady
    ? state.compassMap.project([target.peak.lon, target.peak.lat])
    : fallbackPosition;

  if (!point) return;

  els.compassPopup.hidden = false;
  els.compassPopup.style.left = fallbackUnit === "%" ? `${point.x}%` : `${point.x}px`;
  els.compassPopup.style.top = fallbackUnit === "%" ? `${point.y}%` : `${point.y}px`;
  els.compassPopup.innerHTML = "";

  const title = document.createElement("strong");
  title.textContent = target.peak.name;
  const meta = document.createElement("span");
  meta.textContent = `${formatDistance(target.distance)} · ${Math.round(target.bearing)}° · ${formatElevation(target.peak.elevation)}`;
  const action = document.createElement("button");
  action.type = "button";
  action.textContent = "详情";
  action.addEventListener("click", (event) => {
    event.stopPropagation();
    showDetail(target);
  });

  els.compassPopup.append(title, meta, action);
}

function hideCompassPopup() {
  state.compassPopupTarget = null;
  els.compassPopup.hidden = true;
}

function showDetail(target) {
  const { peak } = target;
  els.detailMeta.textContent = peak.tags.join(" · ");
  els.detailTitle.textContent = peak.name;
  els.detailElevation.textContent = formatElevation(peak.elevation);
  els.detailDistance.textContent = formatDistance(target.distance);
  els.detailBearing.textContent = `${Math.round(target.bearing)}°`;
  els.detailIntro.textContent = peak.intro;
  els.detailRoute.textContent = peak.route;

  if (!els.detailDialog.open) {
    els.detailDialog.showModal();
  }
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    state.settings = {
      ...DEFAULT_SETTINGS,
      ...saved,
      searchRadiusKm: [3, 5, 10, 30].includes(Number(saved.searchRadiusKm)) ? Number(saved.searchRadiusKm) : 10,
      maxLabels: [3, 5, 8].includes(Number(saved.maxLabels)) ? Number(saved.maxLabels) : 5,
      mapSource: ["auto", "liberty", "positron", "osmRaster", "local"].includes(saved.mapSource) ? saved.mapSource : "auto",
      developerMode: Boolean(saved.developerMode)
    };
  } catch {
    state.settings = { ...DEFAULT_SETTINGS };
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
}

function openSettings() {
  state.pendingSettings = { ...state.settings };
  renderSettings();
  if (!els.settingsDialog.open) {
    els.settingsDialog.showModal();
  }
}

function renderSettings() {
  const settings = state.pendingSettings ?? state.settings;
  document.querySelectorAll("[data-setting]").forEach((button) => {
    const current = settings[button.dataset.setting];
    button.classList.toggle("active", String(current) === button.dataset.value);
  });
  els.mapSourceSelect.value = settings.mapSource;
  els.developerModeToggle.checked = settings.developerMode;
}

function updatePendingSetting(key, value) {
  if (!state.pendingSettings) {
    state.pendingSettings = { ...state.settings };
  }
  state.pendingSettings[key] = value;
  renderSettings();
}

async function applyPendingSettings() {
  if (!state.pendingSettings) return;

  const previous = { ...state.settings };
  const next = { ...state.pendingSettings };
  const radiusChanged = previous.searchRadiusKm !== next.searchRadiusKm;
  const maxLabelsChanged = previous.maxLabels !== next.maxLabels;
  const mapSourceChanged = previous.mapSource !== next.mapSource;
  const developerModeChanged = previous.developerMode !== next.developerMode;

  state.settings = next;
  saveSettings();
  state.pendingSettings = { ...state.settings };
  renderSettings();

  if (developerModeChanged) {
    els.devPanel.classList.toggle("active", Boolean(state.settings.developerMode));
    renderDevPanel();
  }

  if (radiusChanged) {
    setSensorPill(`视野范围 ${state.settings.searchRadiusKm}km`, "ready");
    if (state.location) {
      state.dataSource = "查询 OSM";
      renderHome();
      await updateNearbyPeaks();
    }
  }

  if (mapSourceChanged) {
    reloadMaps();
  }

  if (radiusChanged || maxLabelsChanged) {
    renderTargets();
    renderDevPanel();
  }

  if (radiusChanged || mapSourceChanged || maxLabelsChanged) {
    renderHome();
    renderMapFallback();
    addMapMarkers();
    renderCompassMap();
  }

  els.settingsDialog.close();
}

function enterDemoFromSettings() {
  if (els.settingsDialog.open) {
    els.settingsDialog.close();
  }
  enterScanner("demo");
}

function showLocationError(retryAction = "home") {
  state.locationRetryAction = retryAction;
  if (!els.locationDialog.open) {
    els.locationDialog.showModal();
  }
}

async function retryLocationRequest() {
  if (els.locationDialog.open) {
    els.locationDialog.close();
  }
  const retryAction = state.locationRetryAction;
  state.locationRetryAction = null;
  if (retryAction === "start" || retryAction === "upload") {
    await startRealExperiment();
    return;
  }
  if (retryAction === "scanner") {
    await requestSensors();
    return;
  }
  await locateFromHome();
}

function getMaxLabels() {
  return state.settings.maxLabels;
}

function toggleDevPanel() {
  els.devPanel.classList.toggle("active");
  state.settings.developerMode = els.devPanel.classList.contains("active");
  saveSettings();
  renderSettings();
  renderDevPanel();
}

function closeDevPanel() {
  els.devPanel.classList.remove("active");
  if (state.settings.developerMode) {
    state.settings.developerMode = false;
    saveSettings();
    renderSettings();
  }
}

function renderDevPanel() {
  const targets = computeTargets().slice(0, getMaxLabels());
  const locationPoint = getMapLocation();
  const rows = [
    ["页面", state.screen === "home" ? "地图入口" : "扫描页"],
    ["位置来源", state.demoActive ? "演示模式" : state.location ? "真实定位" : "未定位"],
    ["画面来源", cameraModeLabel()],
    ["AR 状态", state.arLive ? "实时叠加中" : "等待扫描"],
    ["位置", locationPoint ? `${locationPoint.lat.toFixed(5)}, ${locationPoint.lon.toFixed(5)}` : "-"],
    ["数据源", state.dataSource],
    ["朝向", `${Math.round(state.heading)}°`],
    ["FOV", `${FOV_DEGREES}°`],
    ["可信度公式", `clamp(1 - |方位偏差| / (${FOV_DEGREES} × 0.78), 0.38, 0.96)`],
    ["结果状态", state.hasScanResults ? `实时显示 ${state.lastTargets.length} 个目标` : "等待扫描"]
  ];

  targets.forEach((target, index) => {
    rows.push([
      `目标 ${index + 1}`,
      `${target.peak.name} · ${target.selectionReason === "center" ? "中心主目标" : "最近优先"} · 方位 ${Math.round(target.bearing)}° · 偏差 ${Math.round(target.relative)}° · ${formatDistance(target.distance)} · 锚点 ${target.anchorSource || "data"} · 可信度 ${Math.round(target.confidence * 100)}%`
    ]);
  });

  els.devReadout.innerHTML = rows
    .map(([label, value]) => `<div class="dev-row"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
}

function cameraModeLabel() {
  if (state.cameraMode === "live") return "实时摄像头";
  if (state.cameraMode === "upload") return "上传画面";
  if (state.cameraMode === "demo") return state.demoActive ? "演示图" : "相机兜底图";
  return state.cameraMode;
}

function updateHeadingUI() {
  els.headingText.textContent = String(Math.round(normalizeDegrees(state.heading))).padStart(3, "0");
}

function cameraErrorMessage(error) {
  if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
    return "需要 HTTPS";
  }
  if (error?.name === "NotAllowedError") return "相机权限被拒绝";
  if (error?.name === "NotFoundError") return "未找到摄像头";
  return "相机启动失败";
}

function getBounds(points) {
  return points.reduce(
    (bounds, point) => ({
      minLat: Math.min(bounds.minLat, point.lat),
      maxLat: Math.max(bounds.maxLat, point.lat),
      minLon: Math.min(bounds.minLon, point.lon),
      maxLon: Math.max(bounds.maxLon, point.lon)
    }),
    { minLat: 90, maxLat: -90, minLon: 180, maxLon: -180 }
  );
}

function projectToMapFallback(point, bounds) {
  const x = ((point.lon - bounds.minLon) / (bounds.maxLon - bounds.minLon || 1)) * 76 + 12;
  const y = (1 - (point.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat || 1)) * 66 + 14;
  return { x: clamp(x, 8, 92), y: clamp(y, 10, 88) };
}

function polarPercent(angle, radius) {
  const radians = toRadians(angle - 90);
  return {
    x: 50 + Math.cos(radians) * radius,
    y: 50 + Math.sin(radians) * radius
  };
}

function distanceMeters(a, b) {
  const earthRadius = 6371000;
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLon = toRadians(b.lon - a.lon);
  const sinLat = Math.sin(deltaLat / 2);
  const sinLon = Math.sin(deltaLon / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return 2 * earthRadius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function bearingDegrees(a, b) {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const lonDelta = toRadians(b.lon - a.lon);
  const y = Math.sin(lonDelta) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lonDelta);
  return normalizeDegrees(toDegrees(Math.atan2(y, x)));
}

function destinationPoint(point, bearing, distance) {
  const earthRadius = 6371000;
  const angularDistance = distance / earthRadius;
  const bearingRad = toRadians(bearing);
  const lat1 = toRadians(point.lat);
  const lon1 = toRadians(point.lon);
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    lat: toDegrees(lat2),
    lon: ((toDegrees(lon2) + 540) % 360) - 180
  };
}

function smoothHeading(previous, next, weight) {
  const diff = normalizeRelativeAngle(next - previous);
  return normalizeDegrees(previous + diff * weight);
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function normalizeRelativeAngle(value) {
  return ((value + 540) % 360) - 180;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function toDegrees(value) {
  return (value * 180) / Math.PI;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatDistance(value) {
  if (value < 1000) return `${Math.round(value)}m`;
  return `${(value / 1000).toFixed(1)}km`;
}

function hasPeakElevation(peak) {
  const elevation = Number(peak?.elevation);
  return Number.isFinite(elevation) && elevation > 0;
}

function formatElevation(elevation) {
  const value = Number(elevation);
  return Number.isFinite(value) && value > 0 ? `${Math.round(value)}m` : "-";
}

function drawVideoCover(ctx, video, width, height) {
  const ratio = Math.max(width / video.videoWidth, height / video.videoHeight);
  const drawWidth = video.videoWidth * ratio;
  const drawHeight = video.videoHeight * ratio;
  ctx.drawImage(video, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

function drawImageCover(ctx, image, width, height) {
  const sourceWidth = image.naturalWidth || width;
  const sourceHeight = image.naturalHeight || height;
  const ratio = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * ratio;
  const drawHeight = sourceHeight * ratio;
  ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}
