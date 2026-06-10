const DATA_URL = "./data/peaks.json";
const FALLBACK_IMAGE = "./assets/west-lake-hills-demo.png";
const FOV_DEGREES = 82;
const MAX_LABELS = 5;
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
  activeViewpointName: document.querySelector("#activeViewpointName"),
  routeTitle: document.querySelector("#routeTitle"),
  routeDescription: document.querySelector("#routeDescription"),
  peakCount: document.querySelector("#peakCount"),
  homeHeading: document.querySelector("#homeHeading"),
  dataSourceText: document.querySelector("#dataSourceText"),
  cycleViewpointBtn: document.querySelector("#cycleViewpointBtn"),
  homeLocateBtn: document.querySelector("#homeLocateBtn"),
  startScanBtn: document.querySelector("#startScanBtn"),
  homeUploadBtn: document.querySelector("#homeUploadBtn"),
  homeDemoBtn: document.querySelector("#homeDemoBtn"),
  homeDevBtn: document.querySelector("#homeDevBtn"),
  camera: document.querySelector("#camera"),
  fallback: document.querySelector("#fallbackScene"),
  frozen: document.querySelector("#frozenFrame"),
  labelLayer: document.querySelector("#labelLayer"),
  radarDots: document.querySelector("#radarDots"),
  radarHeading: document.querySelector(".radar-heading"),
  miniRadarBtn: document.querySelector("#miniRadarBtn"),
  backHomeBtn: document.querySelector("#backHomeBtn"),
  scannerDevBtn: document.querySelector("#scannerDevBtn"),
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
  compassViewCone: document.querySelector("#compassViewCone"),
  compassHeadingLine: document.querySelector("#compassHeadingLine"),
  compassDial: document.querySelector("#compassDial"),
  compassDots: document.querySelector("#compassDots"),
  compassBearingText: document.querySelector("#compassBearingText"),
  compassSourceText: document.querySelector("#compassSourceText"),
  toggleCompassOverlayBtn: document.querySelector("#toggleCompassOverlayBtn")
};

const state = {
  peaks: [],
  demoPeaks: [],
  viewpoints: [],
  activeViewpointIndex: 0,
  location: null,
  heading: 247,
  dataSource: "待获取",
  screen: "home",
  cameraStream: null,
  cameraMode: "demo",
  frozen: false,
  hasScanResults: false,
  arLive: false,
  uploadedUrl: null,
  uploadContext: "scanner",
  lastTargets: [],
  orientationListening: false,
  map: null,
  mapMarkers: [],
  hiddenTargetCount: 0,
  compassStyle: "standard",
  compassOverlay: false
};

init();

async function init() {
  await loadData();
  bindEvents();
  buildCompassDial();
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
  els.cycleViewpointBtn.addEventListener("click", cycleViewpoint);
  els.homeLocateBtn.addEventListener("click", locateFromHome);
  els.startScanBtn.addEventListener("click", () => {
    startRealExperiment();
  });
  els.homeDemoBtn.addEventListener("click", () => enterScanner("demo"));
  els.homeUploadBtn.addEventListener("click", () => {
    state.uploadContext = "home";
    els.uploadInput.click();
  });
  els.homeDevBtn.addEventListener("click", toggleDevPanel);
  els.scannerDevBtn.addEventListener("click", toggleDevPanel);
  els.closeDevBtn.addEventListener("click", closeDevPanel);
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
    renderCompassMap();
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
    enterScanner("demo");
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
  const viewpoint = getActiveViewpoint();
  const locationLabel = state.location?.label ?? `西湖 · ${viewpoint.name}`;
  const displayDataSource = state.location ? state.dataSource : "西湖演示";
  els.activeViewpointName.textContent = locationLabel;
  els.routeTitle.textContent = state.location
    ? `${state.location.label}`
    : "AR 模式";
  els.routeDescription.textContent = state.location
    ? `当前使用 ${state.dataSource} 数据。点击 AR 模式可重新定位和刷新附近山峰。`
    : "默认显示西湖演示位置；点击 AR 模式或定位按钮后获取实际位置和附近山峰。";
  els.peakCount.textContent = String(getDisplayPeaks().length);
  els.homeHeading.textContent = String(Math.round(state.heading)).padStart(3, "0");
  els.dataSourceText.textContent = displayDataSource;
  els.scannerViewpoint.textContent = locationLabel.replace("西湖 · ", "");
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
    state.cameraMode = "upload";
    showCameraLayer("fallback");
    setModePill("上传画面");
    setSensorPill("模拟识别", "ready");
  } else if (mode === "experiment") {
    stopCamera();
    clearFrozenFrame();
    state.cameraMode = "demo";
    showCameraLayer("fallback");
    setModePill("AR 模式");
    setSensorPill(state.peaks.length ? "使用当前位置" : "附近暂无开放山峰数据", state.peaks.length ? "ready" : "warn");
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
    renderHome();
    renderDevPanel();
    enterScanner("experiment");
    startCamera();
    return;
  }

  state.dataSource = "查询 OSM";
  renderHome();

  const nearbyPeaks = await fetchNearbyPeaks(state.location.lat, state.location.lon);
  state.peaks = nearbyPeaks;
  state.dataSource = nearbyPeaks.length ? "OSM/Overpass" : "OSM 无结果";
  renderHome();
  renderMapFallback();
  updateMapFocus();

  enterScanner("experiment");
  startCamera();
}

async function locateFromHome() {
  state.dataSource = "定位中";
  renderHome();

  const gotLocation = await requestLocation();
  if (!gotLocation) {
    state.dataSource = "定位失败";
    renderHome();
    renderDevPanel();
    return;
  }

  state.dataSource = "查询 OSM";
  renderHome();
  state.peaks = await fetchNearbyPeaks(state.location.lat, state.location.lon);
  state.dataSource = state.peaks.length ? "OSM/Overpass" : "OSM 无结果";
  state.hasScanResults = false;
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
    state.dataSource = "查询 OSM";
    renderHome();
    state.peaks = await fetchNearbyPeaks(state.location.lat, state.location.lon);
    state.dataSource = state.peaks.length ? "OSM/Overpass" : "OSM 无结果";
    state.hasScanResults = false;
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

async function fetchNearbyPeaks(lat, lon, radius = 30000) {
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
          screenY: elevation > 300 ? 38 : 48,
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

function parseElevation(value) {
  if (!value) return 0;
  const match = String(value).match(/-?\d+(\.\d+)?/);
  return match ? Math.round(Number(match[0])) : 0;
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
  els.headingRange.value = String(Math.round(state.heading));
  updateHeadingUI();
  if (state.arLive || state.hasScanResults) {
    renderTargets();
  } else {
    renderRadar(computeTargets().slice(0, MAX_LABELS));
  }
  renderDevPanel();
  renderCompassMap();
}

function scan() {
  els.scannerScreen.classList.add("scanning");
  state.hasScanResults = false;
  state.arLive = false;
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
    state.hasScanResults = true;
    state.arLive = true;
    state.lastTargets = computeTargets().slice(0, MAX_LABELS);
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

function clearFrozenFrame() {
  state.frozen = false;
  state.hasScanResults = false;
  state.arLive = false;
  state.lastTargets = [];
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
    setActiveViewpoint(state.activeViewpointIndex);
    state.peaks = [...state.demoPeaks];
    state.dataSource = "上传演示";
    renderHome();
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

function renderTargets() {
  const targets = computeTargets().slice(0, MAX_LABELS);
  state.lastTargets = state.hasScanResults ? targets : [];
  els.labelLayer.innerHTML = "";

  if (state.hasScanResults) {
    targets.forEach((target, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `mountain-label ${index === 0 ? "primary" : ""}`;
      button.dataset.peakId = target.peak.id;
      button.style.left = `${target.x}%`;
      button.style.top = `${target.y}%`;
      button.innerHTML = `
        <strong>${target.peak.name}</strong>
        <span class="label-metrics">
          <b>↔ ${formatDistance(target.distance)}</b>
          <b>▲ ${target.peak.elevation}m</b>
          <b>◉ ${Math.round(target.confidence * 100)}%</b>
        </span>
      `;
      els.labelLayer.appendChild(button);
    });

    if (!targets.length) {
      const empty = document.createElement("div");
      empty.className = "label-empty";
      empty.textContent = state.peaks.length ? "当前朝向暂无山峰目标" : "附近暂无开放山峰数据";
      els.labelLayer.appendChild(empty);
    } else if (state.hiddenTargetCount > 0) {
      const overflow = document.createElement("div");
      overflow.className = "label-overflow";
      overflow.textContent = `还有 ${state.hiddenTargetCount} 个附近目标`;
      els.labelLayer.appendChild(overflow);
    }
  }

  renderRadar(targets);
  renderCompassMap();
}

function computeTargets() {
  if (!state.location) {
    state.hiddenTargetCount = 0;
    return [];
  }

  const measured = state.peaks.map((peak) => {
    const distance = distanceMeters(state.location, peak);
    const bearing = bearingDegrees(state.location, peak);
    const relative = normalizeRelativeAngle(bearing - state.heading);
    const visible = Math.abs(relative) <= FOV_DEGREES / 2;
    const confidence = clamp(1 - Math.abs(relative) / (FOV_DEGREES * 0.78), 0.38, 0.96);
    const x = clamp(50 + (relative / (FOV_DEGREES / 2)) * 36, 24, 76);
    const distanceLift = clamp((2400 - distance) / 2400, -0.4, 0.8) * 6;
    const y = clamp((peak.screenY ?? 48) - distanceLift, 25, 67);

    return {
      peak,
      distance,
      bearing,
      relative,
      visible,
      confidence,
      x,
      y,
      sourceWeight: peak.tags?.includes("OSM") ? 8 : 0,
      score: Math.abs(relative) + distance / 900
    };
  });

  const visible = measured.filter((item) => item.visible).sort((a, b) => a.score - b.score);
  if (visible.length) return placeLabels(visible);

  if (state.dataSource === "OSM/Overpass" || state.dataSource === "OSM 无结果") {
    state.hiddenTargetCount = measured.length;
    return [];
  }

  return placeLabels(
    measured
      .sort((a, b) => Math.abs(a.relative) - Math.abs(b.relative))
      .slice(0, MAX_LABELS)
      .map((item, index) => ({
        ...item,
        x: 24 + index * 12,
        confidence: Math.min(item.confidence, 0.56)
      }))
  );
}

function placeLabels(targets) {
  const offsets = [0, -12, 12, -24, 24, -34, 34];
  const placed = [];
  const sorted = [...targets].sort((a, b) => {
    const aRank = Math.abs(a.relative) + a.distance / 1200 + a.sourceWeight;
    const bRank = Math.abs(b.relative) + b.distance / 1200 + b.sourceWeight;
    return aRank - bRank;
  });

  sorted.forEach((target) => {
    if (placed.length >= MAX_LABELS) return;
    for (const offset of offsets) {
      const candidate = { ...target, y: clamp(target.y + offset, 25, 68) };
      const collides = placed.some((item) => labelsCollide(item, candidate));
      if (!collides) {
        placed.push(candidate);
        return;
      }
    }
  });

  state.hiddenTargetCount = Math.max(0, sorted.length - placed.length);
  return placed.sort((a, b) => b.confidence - a.confidence);
}

function labelsCollide(a, b) {
  return Math.abs(a.x - b.x) < 22 && Math.abs(a.y - b.y) < 14;
}

function computeTargetForPeak(peak) {
  const locationPoint = state.location ?? getActiveViewpoint();
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
  return state.peaks.length ? state.peaks : state.demoPeaks;
}

function getMapLocation() {
  return state.location ?? getActiveViewpoint();
}

function renderRadar(targets) {
  els.radarDots.innerHTML = "";
  els.radarHeading.style.transform = `translateX(-50%) rotate(${state.heading}deg)`;
  const visibleIds = new Set(targets.map((item) => item.peak.id));

  state.peaks.forEach((peak) => {
    const bearing = bearingDegrees(state.location, peak);
    const distance = distanceMeters(state.location, peak);
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
  const locationPoints = [getMapLocation()];
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
  const position = projectToMapFallback(getMapLocation(), bounds);
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
  try {
    state.map = new window.maplibregl.Map({
      container: els.map,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [getActiveViewpoint().lon, getActiveViewpoint().lat],
      zoom: 12.2,
      attributionControl: false,
      interactive: false
    });

    state.map.once("load", () => {
      els.mapFallback.classList.remove("active");
      addMapMarkers();
    });

    state.map.on("error", () => {
      els.mapFallback.classList.add("active");
    });
  } catch {
    els.mapFallback.classList.add("active");
  }
}

function addMapMarkers() {
  clearMapMarkers();

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
  state.map.jumpTo({
    center: [center.lon, center.lat],
    zoom: 12.2
  });
  addMapMarkers();
}

function buildCompassDial() {
  const cardinal = [
    { label: "北", angle: 0 },
    { label: "东", angle: 90 },
    { label: "南", angle: 180 },
    { label: "西", angle: 270 }
  ];
  const secondary = [
    { label: "东北", angle: 45 },
    { label: "东南", angle: 135 },
    { label: "西南", angle: 225 },
    { label: "西北", angle: 315 }
  ];
  const labels = [
    ...cardinal.map((item) => ({ ...item, className: "major" })),
    ...secondary.map((item) => ({ ...item, className: "minor" })),
    ...COMPASS_POINTS.map((item) => ({ ...item, className: "fengshui-label" }))
  ];

  els.compassDial.innerHTML = labels
    .map((item) => {
      const point = polarPercent(item.angle, item.className === "fengshui-label" ? 42 : 46);
      return `<span class="${item.className}" style="left:${point.x}%;top:${point.y}%">${item.label}</span>`;
    })
    .join("");
}

function openCompassMap() {
  if (!els.compassDialog.open) {
    els.compassDialog.showModal();
  }
  renderCompassMap();
}

function toggleCompassOverlay() {
  state.compassOverlay = !state.compassOverlay;
  renderCompassMap();
}

function setCompassStyle(style) {
  state.compassStyle = style === "fengshui" ? "fengshui" : "standard";
  document.querySelectorAll("[data-compass-style]").forEach((button) => {
    button.classList.toggle("active", button.dataset.compassStyle === state.compassStyle);
  });
  renderCompassMap();
}

function renderCompassMap() {
  if (!els.compassDialog.open) return;

  const locationPoint = getMapLocation();
  const peaks = getDisplayPeaks();
  const bounds = getBounds([...peaks, locationPoint]);
  const center = projectToMapFallback(locationPoint, bounds);
  const heading = normalizeDegrees(state.heading);

  els.compassBearingText.textContent = `${Math.round(heading)}°`;
  els.compassSourceText.textContent = state.location ? state.dataSource : "西湖演示";
  els.toggleCompassOverlayBtn.classList.toggle("active", state.compassOverlay);
  els.toggleCompassOverlayBtn.textContent = state.compassOverlay ? "隐藏叠层" : "罗盘叠层";
  els.compassDial.className = `compass-dial ${state.compassStyle} ${state.compassOverlay ? "active" : ""}`;
  els.compassDial.style.left = `${center.x}%`;
  els.compassDial.style.top = `${center.y}%`;
  els.compassDial.style.transform = `translate(-50%, -50%) rotate(${-heading}deg)`;

  els.compassViewCone.style.left = `${center.x}%`;
  els.compassViewCone.style.top = `${center.y}%`;
  els.compassViewCone.style.transform = `translate(-50%, -50%) rotate(${heading}deg)`;
  els.compassHeadingLine.style.left = `${center.x}%`;
  els.compassHeadingLine.style.top = `${center.y}%`;
  els.compassHeadingLine.style.transform = `translate(-50%, -100%) rotate(${heading}deg)`;

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
    dot.innerHTML = `<span>${peak.name}</span>`;
    dot.addEventListener("click", () => {
      if (target) showDetail(target);
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

function showDetail(target) {
  const { peak } = target;
  els.detailMeta.textContent = peak.tags.join(" · ");
  els.detailTitle.textContent = peak.name;
  els.detailElevation.textContent = `${peak.elevation}m`;
  els.detailDistance.textContent = formatDistance(target.distance);
  els.detailBearing.textContent = `${Math.round(target.bearing)}°`;
  els.detailIntro.textContent = peak.intro;
  els.detailRoute.textContent = peak.route;

  if (!els.detailDialog.open) {
    els.detailDialog.showModal();
  }
}

function toggleDevPanel() {
  els.devPanel.classList.toggle("active");
  renderDevPanel();
}

function closeDevPanel() {
  els.devPanel.classList.remove("active");
}

function renderDevPanel() {
  const targets = computeTargets().slice(0, MAX_LABELS);
  const rows = [
    ["页面", state.screen === "home" ? "地图入口" : "扫描页"],
    ["观景点", getActiveViewpoint()?.name ?? "-"],
    ["画面来源", cameraModeLabel()],
    ["AR 状态", state.arLive ? "实时叠加中" : "等待扫描"],
    ["位置", state.location ? `${state.location.lat.toFixed(5)}, ${state.location.lon.toFixed(5)}` : "-"],
    ["朝向", `${Math.round(state.heading)}°`],
    ["FOV", `${FOV_DEGREES}°`],
    ["可信度公式", `clamp(1 - |方位偏差| / (${FOV_DEGREES} × 0.78), 0.38, 0.96)`],
    ["结果状态", state.hasScanResults ? `实时显示 ${state.lastTargets.length} 个目标` : "等待扫描"]
  ];

  targets.forEach((target, index) => {
    rows.push([
      `目标 ${index + 1}`,
      `${target.peak.name} · 方位 ${Math.round(target.bearing)}° · 偏差 ${Math.round(target.relative)}° · ${formatDistance(target.distance)} · 可信度 ${Math.round(target.confidence * 100)}%`
    ]);
  });

  els.devReadout.innerHTML = rows
    .map(([label, value]) => `<div class="dev-row"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
}

function cameraModeLabel() {
  if (state.cameraMode === "live") return "实时摄像头";
  if (state.cameraMode === "upload") return "上传画面";
  if (state.cameraMode === "demo") return "演示图";
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
