import { getDeviceProfile } from './diagnostics.js';
import { getRuntimeSnapshot } from './render/runtime-registry.js';

const KEY = 'fisica-imersiva-360.device-validation.v1';
export const MANUAL_CRITERIA = [
  ['visual', 'Sombras, materiais e iluminação'],
  ['touch', 'Toque, pinça e precisão dos controles'],
  ['readability', 'Legibilidade de textos, gráficos e displays'],
  ['orientation', 'Retrato, paisagem e áreas seguras'],
  ['temperature', 'Aquecimento após uso prolongado'],
  ['battery', 'Consumo de bateria'],
];

function storageAvailable() {
  try {
    const key = '__fisica_validation__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch { return false; }
}

function visibleTouchTargets() {
  if (typeof document === 'undefined') return [];
  return [...document.querySelectorAll('button, select, input, [role="button"]')]
    .filter((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    })
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height), label: element.getAttribute('aria-label') || element.textContent?.trim().slice(0, 32) || element.id };
    });
}

export function classifyValidation(tests = [], manual = {}) {
  const statuses = [...tests.map((item) => item.status), ...Object.values(manual)];
  if (statuses.includes('fail')) return 'reprovado';
  if (statuses.some((status) => status === 'warning' || status === 'pending')) return 'com-ressalvas';
  return 'aprovado';
}

export function buildDeviceValidation({ settings = {}, label = '', manual = {}, notes = '' } = {}) {
  const profile = getDeviceProfile();
  const runtime = getRuntimeSnapshot();
  const targets = visibleTouchTargets();
  const undersized = targets.filter((target) => target.width < 40 || target.height < 40);
  const width = typeof innerWidth === 'number' ? innerWidth : 0;
  const height = typeof innerHeight === 'number' ? innerHeight : 0;
  const latest = runtime.latest;
  const tests = [
    { id: 'viewport', label: 'Viewport mínimo', status: Math.min(width, height) >= 320 ? 'pass' : 'fail', detail: `${width}×${height}` },
    { id: 'webgl2', label: 'WebGL 2', status: profile.webgl2 ? 'pass' : profile.webgl ? 'warning' : 'fail', detail: profile.webgl2 ? 'Disponível' : profile.webgl ? 'Somente WebGL 1' : 'Indisponível' },
    { id: 'touch-targets', label: 'Alvos de toque', status: undersized.length ? 'warning' : 'pass', detail: undersized.length ? `${undersized.length} controles abaixo de 40 px` : `${targets.length} controles verificados` },
    { id: 'storage', label: 'Armazenamento local', status: storageAvailable() ? 'pass' : 'warning', detail: storageAvailable() ? 'Disponível' : 'Bloqueado ou modo privado' },
    { id: 'fullscreen', label: 'Tela cheia', status: document.fullscreenEnabled ? 'pass' : 'warning', detail: document.fullscreenEnabled ? 'Disponível' : 'Não exposta pelo navegador' },
    { id: 'service-worker', label: 'PWA e cache', status: 'serviceWorker' in navigator ? 'pass' : 'warning', detail: 'serviceWorker' in navigator ? 'Suportado' : 'Sem suporte' },
    { id: 'runtime', label: 'Métrica 3D', status: latest ? (latest.budgetStatus === 'critical' ? 'warning' : 'pass') : 'pending', detail: latest ? `${Math.round(latest.fps)} FPS · ${latest.drawCalls} draws` : 'Abra um laboratório 3D' },
  ];
  const normalizedManual = Object.fromEntries(MANUAL_CRITERIA.map(([id]) => [id, manual[id] || 'pending']));
  const report = {
    version: '0.5.0',
    generatedAt: new Date().toISOString(),
    label: label.trim() || `${profile.touch ? 'Dispositivo touch' : 'Computador'} ${profile.viewport}`,
    route: location.hash.slice(1) || 'hall',
    profile,
    settings: {
      quality: settings.quality || 'auto',
      surfaceDetail: settings.surfaceDetail !== false,
      inspectionLighting: settings.inspectionLighting !== false,
      cameraAssist: settings.cameraAssist !== false,
      reduceMotion: settings.reduceMotion === true,
    },
    tests,
    manual: normalizedManual,
    notes: notes.trim(),
    undersizedTargets: undersized.slice(0, 12),
  };
  report.assessment = classifyValidation(tests, normalizedManual);
  return report;
}

export function formatDeviceValidation(report) {
  const symbols = { pass: '✓', warning: '△', fail: '✕', pending: '○', approved: '✓', concern: '△' };
  const lines = [`${report.label} · ${report.assessment}`, `${report.profile.viewport} · DPR ${Number(report.profile.pixelRatio || 1).toFixed(2)} · ${report.profile.touch ? 'toque' : 'mouse/teclado'}`];
  report.tests.forEach((test) => lines.push(`${symbols[test.status] || '•'} ${test.label}: ${test.detail}`));
  const pending = Object.values(report.manual).filter((value) => value === 'pending').length;
  lines.push(pending ? `${pending} verificações visuais ainda precisam ser preenchidas no aparelho.` : 'Checklist visual manual preenchido.');
  return lines.join('\n');
}

export function loadDeviceValidationMatrix() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function saveDeviceValidation(report) {
  const matrix = loadDeviceValidationMatrix();
  matrix.unshift(report);
  localStorage.setItem(KEY, JSON.stringify(matrix.slice(0, 30)));
  return matrix;
}

function download(content, type, filename) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function exportDeviceValidationJSON(matrix = loadDeviceValidationMatrix()) {
  download(JSON.stringify({ platformVersion: '0.5.0', exportedAt: new Date().toISOString(), devices: matrix }, null, 2), 'application/json', `fisica-imersiva-matriz-dispositivos-${new Date().toISOString().slice(0, 10)}.json`);
}

export function exportDeviceValidationCSV(matrix = loadDeviceValidationMatrix()) {
  const headers = ['data', 'aparelho', 'avaliacao', 'viewport', 'webgl2', 'qualidade', ...MANUAL_CRITERIA.map(([id]) => id), 'observacoes'];
  const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const rows = matrix.map((report) => [report.generatedAt, report.label, report.assessment, report.profile.viewport, report.profile.webgl2, report.settings.quality, ...MANUAL_CRITERIA.map(([id]) => report.manual[id]), report.notes].map(quote).join(','));
  download([headers.join(','), ...rows].join('\n'), 'text/csv;charset=utf-8', `fisica-imersiva-matriz-dispositivos-${new Date().toISOString().slice(0, 10)}.csv`);
}
