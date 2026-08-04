import { getRuntimeSnapshot } from './render/runtime-registry.js';
import { getQualityBudget } from './quality.js';
import { getLastWebGLPreflight } from './render/webgl-preflight.js';

function testContext(kind) {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext(kind, { powerPreference: 'high-performance' }));
  } catch {
    return false;
  }
}

export function getDeviceProfile() {
  const webgl2 = testContext('webgl2');
  const webgl = webgl2 || testContext('webgl');
  const cores = navigator.hardwareConcurrency || null;
  const memory = navigator.deviceMemory || null;
  const touch = navigator.maxTouchPoints > 0 || matchMedia('(pointer: coarse)').matches;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {
    webgl,
    webgl2,
    cores,
    memory,
    touch,
    reducedMotion,
    saveData: navigator.connection?.saveData === true,
    pixelRatio: devicePixelRatio || 1,
    viewport: `${innerWidth}×${innerHeight}`,
  };
}

export function describeDevice(profile) {
  const graphics = profile.webgl2 ? 'WebGL 2' : profile.webgl ? 'WebGL 1' : 'Compatibilidade 2D';
  const resources = [
    profile.cores ? `${profile.cores} núcleos` : null,
    profile.memory ? `${profile.memory} GB estimados` : null,
    profile.touch ? 'toque' : 'ponteiro preciso',
    profile.saveData ? 'economia de dados' : null,
  ].filter(Boolean).join(' · ');
  return { graphics, resources: resources || 'Recursos não informados pelo navegador' };
}

export function buildPerformanceAudit({ settings = {}, route = location.hash.slice(1) || 'hall' } = {}) {
  const device = getDeviceProfile();
  const runtime = getRuntimeSnapshot();
  const quality = document.documentElement.dataset.quality || 'medium';
  const budget = getQualityBudget(quality);
  const latest = runtime.latest;
  const withinBudget = latest
    ? latest.drawCalls <= budget.maxDrawCalls && latest.triangles <= budget.maxTriangles && latest.fps >= budget.targetFps * 0.68
    : null;
  return {
    generatedAt: new Date().toISOString(),
    version: '0.4.5',
    route,
    quality,
    budget,
    settings: {
      dynamicResolution: settings.dynamicResolution !== false,
      adaptiveQuality: settings.adaptiveQuality !== false,
      pauseHiddenScenes: settings.pauseHiddenScenes !== false,
      postProcessing: settings.postProcessing !== false,
      reduceMotion: settings.reduceMotion === true,
    },
    device,
    webglPreflight: getLastWebGLPreflight(),
    runtime,
    assessment: latest ? (withinBudget ? 'dentro-do-orcamento' : 'requer-reducao') : 'aguardando-cena-3d',
  };
}

export function formatPerformanceAudit(audit) {
  const { graphics, resources } = describeDevice(audit.device);
  const latest = audit.runtime.latest;
  const preflight = audit.webglPreflight;
  const lines = [
    `${graphics} · ${resources}`,
    `Viewport ${audit.device.viewport} · DPR ${audit.device.pixelRatio.toFixed(2)} · perfil ${audit.quality}`,
    preflight ? `Pré-teste: WebGL ${preflight.webglVersion || 0} · ${preflight.tier} · desenho ${preflight.drawPassed ? 'aprovado' : 'falhou'}` : 'Pré-teste WebGL ainda não executado',
  ];
  if (latest) {
    lines.push(`${Math.round(latest.fps)} FPS · baixo ${Math.round(latest.fpsLow)} · ${latest.drawCalls} draws · ${Math.round(latest.triangles / 1000)}k tri`);
    lines.push(`${latest.textures} texturas · ${latest.geometries} geometrias · escala ${Math.round(latest.dynamicScale * 100)}% · ${latest.adaptiveTier}`);
    lines.push(`Avaliação: ${audit.assessment === 'dentro-do-orcamento' ? 'dentro do orçamento atual' : 'adaptação gráfica recomendada'}`);
  } else {
    lines.push('Abra um laboratório 3D e aguarde alguns segundos para registrar as métricas.');
  }
  return lines.join('\n');
}

export function downloadPerformanceAudit(audit) {
  const blob = new Blob([JSON.stringify(audit, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `fisica-imersiva-diagnostico-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
