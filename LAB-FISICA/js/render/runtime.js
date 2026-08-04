import { loadThree } from './three-loader.js';
import { createProceduralEnvironment } from './environment.js';
import { createMaterialLibrary } from './materials.js';
import { LightweightPostFX } from './postfx.js';
import { PerformanceMonitor } from './performance-monitor.js';
import { AdaptiveSceneOptimizer } from './adaptive-scene-optimizer.js';
import { registerRuntime, updateRuntime, unregisterRuntime } from './runtime-registry.js';
import { disposeObject3D } from './dispose.js';
import { getQualityProfile } from '../quality.js';
import { createArtisticRefinement } from './artistic-refinement.js';
import { reportRuntimeIssue, setRenderState } from '../stability.js';
import { runWebGLPreflight } from './webgl-preflight.js';
import { createRenderWatchdog } from './render-watchdog.js';

function constrainProfileToPreflight(profile, preflight, safe3d = false) {
  const constrained = { ...profile };
  const tier = safe3d && preflight.tier === 'advanced' ? 'balanced' : preflight.tier;
  if (tier === 'minimal') {
    Object.assign(constrained, {
      pixelRatio: Math.min(profile.pixelRatio, 1), particles: Math.min(profile.particles, 240), antialias: false,
      shadows: false, architectureDetail: 0, postProcessing: false, maxDynamicLights: Math.min(profile.maxDynamicLights, 2),
      targetFps: Math.min(profile.targetFps, 30), powerPreference: 'low-power', lodBias: Math.max(profile.lodBias, 2),
    });
  } else if (tier === 'balanced') {
    Object.assign(constrained, {
      pixelRatio: Math.min(profile.pixelRatio, 1.35), particles: Math.min(profile.particles, 600),
      shadowMapSize: Math.min(profile.shadowMapSize, 1024), architectureDetail: Math.min(profile.architectureDetail, 1),
      postProcessing: false, maxDynamicLights: Math.min(profile.maxDynamicLights, 4), targetFps: Math.min(profile.targetFps, 45),
      lodBias: Math.max(profile.lodBias, 1),
    });
  }
  return constrained;
}

function createDiagnostics(container) {
  const element = document.createElement('output');
  element.className = 'render-diagnostics';
  element.hidden = true;
  element.setAttribute('aria-live', 'polite');
  container.append(element);
  return element;
}


function createCameraAssist(container, getSettings) {
  const controls = document.createElement('div');
  controls.className = 'scene-camera-controls';
  controls.setAttribute('aria-label', 'Controles da câmera 3D');
  controls.innerHTML = `
    <button type="button" data-camera-command="left" aria-label="Girar câmera para a esquerda">↶</button>
    <button type="button" data-camera-command="zoom-in" aria-label="Aproximar câmera">＋</button>
    <button type="button" data-camera-command="reset" aria-label="Restaurar câmera">◎</button>
    <button type="button" data-camera-command="zoom-out" aria-label="Afastar câmera">−</button>
    <button type="button" data-camera-command="right" aria-label="Girar câmera para a direita">↷</button>`;
  const hint = document.createElement('p');
  hint.className = 'scene-camera-hint';
  hint.textContent = 'Arraste para girar · pinça ou roda para zoom · dois dedos movem o foco · toque duplo restaura';
  container.append(controls, hint);
  let controller = null;
  function sync() {
    const visible = getSettings().cameraAssist !== false;
    controls.hidden = !visible;
    hint.hidden = !visible;
    container.classList.toggle('camera-assist-off', !visible);
  }
  controls.addEventListener('click', (event) => {
    const command = event.target.closest('[data-camera-command]')?.dataset.cameraCommand;
    if (!command || !controller) return;
    if (command === 'left') controller.rotate?.(0.2);
    if (command === 'right') controller.rotate?.(-0.2);
    if (command === 'zoom-in') controller.zoom?.(0.84);
    if (command === 'zoom-out') controller.zoom?.(1.18);
    if (command === 'reset') controller.reset?.();
    controller.update?.();
  });
  sync();
  return { bind(next) { controller = next; sync(); }, sync, dispose() { controls.remove(); hint.remove(); controller = null; } };
}

function createRecoveryOverlay(container) {
  const element = document.createElement('section');
  element.className = 'webgl-recovery';
  element.hidden = true;
  element.innerHTML = '<strong>Renderização 3D interrompida</strong><p>O navegador perdeu o contexto gráfico. A recuperação automática está em andamento.</p><button type="button">Recarregar laboratório</button>';
  element.querySelector('button').addEventListener('click', () => location.reload());
  container.append(element);
  return element;
}

export async function createRenderRuntime({
  container,
  statusElement,
  getSettings = () => ({}),
  canvasClass = 'physics-webgl',
  camera = {},
  scene = {},
  environment = {},
  fallbackClass = 'stage--fallback',
}) {
  const route = location.hash.slice(1) || 'hall';
  const settingsAtStart = getSettings();
  setRenderState('loading', { route, label: 'Testando compatibilidade WebGL' });
  const preflight = container && settingsAtStart.force2d !== true && !new URLSearchParams(location.search).has('no3d')
    ? await runWebGLPreflight({ preferWebGL2: true, testRecovery: false })
    : { available: false, webglVersion: 0, tier: 'unsupported', error: 'Modo 2D selecionado.' };
  if (!container || !preflight.available || settingsAtStart.force2d === true || new URLSearchParams(location.search).has('no3d')) {
    container?.classList.add(fallbackClass);
    if (statusElement) statusElement.textContent = settingsAtStart.force2d ? 'Modo estável 2D ativado' : 'Modo compatibilidade 2D';
    setRenderState('fallback', { route, label: settingsAtStart.force2d ? 'Modo 2D escolhido' : 'WebGL indisponível', preflight });
    return null;
  }

  let loaded;
  try {
    loaded = await loadThree();
  } catch (error) {
    console.warn('Núcleo 3D indisponível.', error);
    container.classList.add(fallbackClass);
    if (statusElement) statusElement.textContent = 'Fallback 2D · motor 3D indisponível';
    reportRuntimeIssue(error, { label: 'Motor 3D indisponível', source: canvasClass });
    setRenderState('fallback', { route, label: 'Three.js indisponível' });
    return null;
  }

  const { THREE, source } = loaded;
  let profile = constrainProfileToPreflight(getQualityProfile(), preflight, settingsAtStart.safe3d === true);
  const worldScene = new THREE.Scene();
  worldScene.background = new THREE.Color(scene.background ?? 0x020711);
  if (scene.fogDensity) worldScene.fog = new THREE.FogExp2(scene.fogColor ?? scene.background ?? 0x020711, scene.fogDensity);
  const perspective = new THREE.PerspectiveCamera(camera.fov ?? 48, 1, camera.near ?? 0.1, camera.far ?? 100);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: profile.antialias,
      powerPreference: profile.powerPreference || (profile.targetFps <= 30 ? 'low-power' : 'high-performance'),
      alpha: false,
      failIfMajorPerformanceCaveat: false,
    });
  } catch (error) {
    container.classList.add(fallbackClass);
    if (statusElement) statusElement.textContent = 'Fallback 2D · falha ao criar o WebGL';
    reportRuntimeIssue(error, { label: 'Falha ao iniciar a cena 3D', source: canvasClass, webglVersion: preflight.webglVersion, preflight });
    setRenderState('error', { route, label: 'Falha ao criar WebGL' });
    return null;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = scene.exposure ?? 1.12;
  renderer.shadowMap.enabled = Boolean(profile.shadows);
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = canvasClass;
  renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());
  container.prepend(renderer.domElement);
  container.classList.add('is-webgl');

  let materialLibrary;
  let env;
  try {
    materialLibrary = createMaterialLibrary(THREE, { accent: environment.accent ? new THREE.Color(environment.accent).getHex() : 0x52d9ff });
    env = createProceduralEnvironment(THREE, renderer, environment);
  } catch (error) {
    renderer.dispose();
    renderer.domElement.remove();
    container.classList.remove('is-webgl');
    container.classList.add(fallbackClass);
    if (statusElement) statusElement.textContent = 'Fallback 2D · falha ao preparar materiais';
    reportRuntimeIssue(error, { label: 'Falha ao preparar materiais 3D', source: canvasClass });
    setRenderState('error', { route, label: 'Falha nos materiais 3D' });
    return null;
  }
  worldScene.environment = env.texture;
  if (environment.background === true) worldScene.background = env.texture;
  const postFX = new LightweightPostFX(THREE, renderer, { enabled: Boolean(profile.postProcessing && getSettings().postProcessing !== false) });
  const artistic = createArtisticRefinement({ THREE, scene: worldScene, camera: perspective, renderer, getSettings, accent: environment.accent ? new THREE.Color(environment.accent).getHex() : 0x52d9ff });
  const cameraAssist = createCameraAssist(container, getSettings);
  const diagnostics = createDiagnostics(container);
  const recoveryOverlay = createRecoveryOverlay(container);
  const runtimeId = registerRuntime({ canvasClass, source, revision: THREE.REVISION, preflight });

  let dynamicScale = 1;
  let width = 1;
  let height = 1;
  let running = false;
  let disposed = false;
  let contextLost = false;
  let contextRecoveryTimer = 0;
  let frameId = 0;
  let last = performance.now();
  let updateCallback = () => {};
  let documentVisible = !document.hidden;
  let containerVisible = true;
  let latestReport = null;
  let suspensionReason = '';
  let firstFrameRendered = false;
  let fallbackActivated = false;

  const optimizer = new AdaptiveSceneOptimizer({
    scene: worldScene,
    renderer,
    profile,
    onChange(adaptive) { updateRuntime(runtimeId, { adaptive }); },
  });

  function basePixelRatio(activeProfile = profile) {
    return Math.min(devicePixelRatio || 1, activeProfile.pixelRatio);
  }

  function resize() {
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    width = rect.width;
    height = rect.height;
    const ratio = basePixelRatio() * dynamicScale;
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    perspective.aspect = width / height;
    perspective.updateProjectionMatrix();
    postFX.setSize(width, height, ratio);
  }

  function adaptivePostProcessing() {
    const settings = getSettings();
    const adaptive = optimizer.getState();
    return Boolean(profile.postProcessing && settings.postProcessing !== false && adaptive.postProcessing);
  }

  function updateDiagnostics(report) {
    latestReport = report;
    const settings = getSettings();
    const adaptive = optimizer.update(report, settings.adaptiveQuality !== false);
    postFX.setEnabled(adaptivePostProcessing());
    diagnostics.hidden = settings.showPerformance !== true;
    diagnostics.dataset.status = report.budgetStatus;
    diagnostics.textContent = `${Math.round(report.fps)} FPS · baixo ${Math.round(report.fpsLow)} · ${report.drawCalls} draws · ${Math.round(report.triangles / 1000)}k tri · ${report.textures} tex · ${Math.round(report.dynamicScale * 100)}% · ${adaptive.tier}`;
    if (statusElement) statusElement.textContent = `Three.js r${THREE.REVISION} · ${Math.round(report.fps)} FPS · ${report.budgetStatus}`;
    updateRuntime(runtimeId, { report, adaptive, suspended: suspensionReason || null });
    window.dispatchEvent(new CustomEvent('fisica:renderreport', { detail: { runtimeId, report, adaptive } }));
  }

  const monitor = new PerformanceMonitor({
    renderer,
    targetFps: profile.targetFps || 52,
    onScaleChange(scale) {
      if (getSettings().dynamicResolution === false) return;
      dynamicScale = scale;
      resize();
    },
    onReport: updateDiagnostics,
  });

  function activateRuntimeFallback(label, error = null) {
    if (fallbackActivated || disposed) return;
    fallbackActivated = true;
    running = false;
    cancelAnimationFrame(frameId);
    frameId = 0;
    renderer.domElement.hidden = true;
    container.classList.remove('is-webgl');
    container.classList.add(fallbackClass, 'is-render-timeout');
    recoveryOverlay.hidden = false;
    recoveryOverlay.querySelector('strong').textContent = 'Modo 2D ativado automaticamente';
    recoveryOverlay.querySelector('p').textContent = `${label}. Os controles, cálculos e gráficos continuam disponíveis.`;
    if (statusElement) statusElement.textContent = `Fallback 2D · ${label}`;
    if (error) reportRuntimeIssue(error, { label, source: canvasClass, preflight });
    setRenderState('fallback', { route, label, preflight });
    updateRuntime(runtimeId, { fallback: label, preflight });
    window.dispatchEvent(new CustomEvent('fisica:render-fallback', { detail: { runtimeId, route, label, preflight } }));
  }

  const watchdog = createRenderWatchdog({
    timeout: Number(settingsAtStart.firstFrameTimeout) || 7000,
    onTimeout: ({ elapsedMs }) => activateRuntimeFallback(`A cena não desenhou o primeiro quadro em ${elapsedMs} ms`, new Error('Tempo limite do primeiro frame 3D.')),
    onReady: ({ firstFrameMs }) => {
      if (statusElement) statusElement.textContent = `Three.js r${THREE.REVISION} · ${source} · WebGL ${preflight.webglVersion}`;
      setRenderState('ready', { route, label: `3D pronto · ${firstFrameMs} ms`, source, preflight });
      updateRuntime(runtimeId, { firstFrameMs, preflight, ready: true });
      window.dispatchEvent(new CustomEvent('fisica:render-ready', { detail: { runtimeId, route, firstFrameMs, source, preflight } }));
    },
  });

  function render() {
    postFX.render(worldScene, perspective);
    if (!firstFrameRendered) {
      firstFrameRendered = true;
      watchdog.markReady();
    }
  }

  function shouldSuspend() {
    const settings = getSettings();
    if (settings.pauseHiddenScenes === false) return false;
    return !documentVisible || !containerVisible;
  }

  function scheduleFrame() {
    if (!running || disposed || frameId) return;
    frameId = requestAnimationFrame(frame);
  }

  function syncSuspension() {
    const suspended = shouldSuspend();
    suspensionReason = !documentVisible ? 'document-hidden' : !containerVisible ? 'offscreen' : '';
    container.classList.toggle('is-render-suspended', suspended);
    if (suspended) {
      cancelAnimationFrame(frameId);
      frameId = 0;
      if (statusElement && !contextLost) statusElement.textContent = 'Cena 3D pausada fora de vista';
      setRenderState('suspended', { route, label: 'Cena pausada fora de vista' });
      updateRuntime(runtimeId, { suspended: suspensionReason });
    } else {
      last = performance.now();
      monitor.reset();
      scheduleFrame();
      setRenderState('resumed', { route, label: 'Cena 3D retomada' });
      updateRuntime(runtimeId, { suspended: null });
    }
  }

  function frame(now) {
    frameId = 0;
    if (!running || disposed || shouldSuspend()) return;
    const delta = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (!contextLost) {
      updateCallback({
        now,
        time: now * 0.001,
        delta,
        THREE,
        scene: worldScene,
        camera: perspective,
        renderer,
        materials: materialLibrary,
        performance: latestReport,
        adaptive: optimizer.getState(),
      });
      artistic.update();
      render();
      monitor.frame(delta, now);
    }
    scheduleFrame();
  }

  function onContextLost(event) {
    event.preventDefault();
    contextLost = true;
    container.classList.add('is-context-lost');
    recoveryOverlay.hidden = false;
    if (statusElement) statusElement.textContent = 'Contexto gráfico perdido · tentando recuperar';
    setRenderState('error', { route, label: 'Contexto WebGL perdido' });
    clearTimeout(contextRecoveryTimer);
    if (getSettings().webglRecovery !== false) {
      contextRecoveryTimer = window.setTimeout(() => {
        if (!contextLost) return;
        container.classList.add(fallbackClass);
        recoveryOverlay.querySelector('p').textContent = 'A recuperação automática não terminou. Recarregue o laboratório ou use o modo 2D.';
      }, 8000);
    }
  }

  function onContextRestored() {
    clearTimeout(contextRecoveryTimer);
    contextLost = false;
    container.classList.remove('is-context-lost', fallbackClass);
    recoveryOverlay.hidden = true;
    optimizer.restore();
    monitor.reset();
    resize();
    if (statusElement) statusElement.textContent = `Three.js r${THREE.REVISION} · contexto restaurado`;
    setRenderState('ready', { route, label: '3D restaurado' });
  }

  function onQualityChange(event) {
    profile = constrainProfileToPreflight(event.detail.profile, preflight, getSettings().safe3d === true);
    optimizer.profile = profile;
    renderer.shadowMap.enabled = Boolean(profile.shadows && optimizer.getState().shadows);
    postFX.setEnabled(adaptivePostProcessing());
    dynamicScale = 1;
    monitor.targetFps = profile.targetFps || 52;
    monitor.reset();
    resize();
  }

  function onRenderChange() {
    const settings = getSettings();
    if (settings.adaptiveQuality === false) optimizer.restore();
    postFX.setEnabled(adaptivePostProcessing());
    diagnostics.hidden = settings.showPerformance !== true;
    cameraAssist.sync();
    container.classList.toggle('surface-detail-off', settings.surfaceDetail === false);
    artistic.update();
    if (settings.dynamicResolution === false) dynamicScale = 1;
    syncSuspension();
    resize();
  }

  function onVisibilityChange() {
    documentVisible = !document.hidden;
    syncSuspension();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const intersectionObserver = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver((entries) => {
      containerVisible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0.01);
      syncSuspension();
    }, { threshold: [0, 0.01] })
    : null;
  intersectionObserver?.observe(container);

  renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
  renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false);
  window.addEventListener('fisica:qualitychange', onQualityChange);
  window.addEventListener('fisica:renderchange', onRenderChange);
  document.addEventListener('visibilitychange', onVisibilityChange);
  resize();
  if (statusElement) statusElement.textContent = `Three.js r${THREE.REVISION} · ${source} · preparando primeiro quadro`;
  setRenderState('loading', { route, label: `Preparando primeiro quadro · WebGL ${preflight.webglVersion}`, source, preflight });

  return {
    THREE,
    scene: worldScene,
    camera: perspective,
    renderer,
    materials: materialLibrary,
    source,
    preflight,
    render,
    resize,
    getMetrics: () => latestReport,
    getAdaptiveState: () => optimizer.getState(),
    start(callback) {
      updateCallback = typeof callback === 'function' ? callback : () => {};
      if (running) return;
      artistic.enhance(worldScene);
      running = true;
      last = performance.now();
      watchdog.start();
      syncSuspension();
      scheduleFrame();
    },
    stop() {
      running = false;
      cancelAnimationFrame(frameId);
      frameId = 0;
    },
    setPostProcessing(value) { postFX.setEnabled(Boolean(value && optimizer.getState().postProcessing)); },
    setDiagnosticsVisible(value) { diagnostics.hidden = !value; },
    bindCameraController(controller) { cameraAssist.bind(controller); },
    enhanceArt(root = worldScene) { artistic.enhance(root); },
    dispose({ disposeScene = true } = {}) {
      if (disposed) return;
      disposed = true;
      running = false;
      cancelAnimationFrame(frameId);
      clearTimeout(contextRecoveryTimer);
      watchdog.dispose();
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('fisica:qualitychange', onQualityChange);
      window.removeEventListener('fisica:renderchange', onRenderChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      if (disposeScene) disposeObject3D(worldScene);
      cameraAssist.dispose();
      artistic.dispose();
      postFX.dispose();
      env.dispose();
      renderer.renderLists?.dispose?.();
      renderer.dispose();
      renderer.forceContextLoss?.();
      renderer.domElement.remove();
      diagnostics.remove();
      recoveryOverlay.remove();
      unregisterRuntime(runtimeId);
      container.classList.remove('is-webgl', 'is-context-lost', 'is-render-suspended', 'is-render-timeout', fallbackClass);
    },
  };
}
