import { Router } from './router.js';
import { renderHall } from './modules/hall.js';
import { renderCoulomb } from './modules/coulomb.js';
import { renderOhm } from './modules/ohm.js';
import { renderRoadmap } from './modules/roadmap.js';
import { renderAdvanced } from './modules/advanced.js';
import { renderMagnetism } from './modules/magnetism.js';
import { renderEnergy } from './modules/energy.js';
import { renderMechanics } from './modules/mechanics.js';
import { renderWaves } from './modules/waves.js';
import { renderThermal } from './modules/thermal.js';
import { loadSettings, saveSettings, clearLocalData } from './storage.js';
import { applyQuality, labels } from './quality.js';
import { applyModuleTheme, applyInterfaceSettings } from './design-system.js';
import { hydrateIconElements } from './ui/icons.js';
import { buildPerformanceAudit, formatPerformanceAudit, downloadPerformanceAudit } from './diagnostics.js';
import { buildDeviceValidation, formatDeviceValidation, saveDeviceValidation, loadDeviceValidationMatrix, exportDeviceValidationJSON, exportDeviceValidationCSV } from './device-validation.js';
import { GuidedLearningController } from './pedagogy/guided-learning.js';
import { createStabilityCenter, renderRouteBrief, bindRouteRenderState, reportRuntimeIssue } from './stability.js';
import { mountExperienceWorkspace } from './ui/experience-workspace.js';
import { runWebGLPreflight, formatWebGLPreflight } from './render/webgl-preflight.js';

const app = document.querySelector('#app');
const view = document.querySelector('#view');
const progress = document.querySelector('#boot-progress');
const bootText = document.querySelector('#boot-text');
let settings = loadSettings();
let router;
let pedagogy;
let stabilityCenter;
let unbindRouteState = () => {};
let unbindExperienceWorkspace = () => {};

const routes = {
  hall: (root) => renderHall(root, { navigate: (name) => router.navigate(name), getSettings: () => ({ ...settings }) }),
  coulomb: (root) => renderCoulomb(root, { getSettings: () => ({ ...settings }) }),
  ohm: (root) => renderOhm(root, { getSettings: () => ({ ...settings }) }),
  magnetism: (root) => renderMagnetism(root, { getSettings: () => ({ ...settings }) }),
  energy: (root) => renderEnergy(root, { getSettings: () => ({ ...settings }) }),
  mechanics: (root) => renderMechanics(root, { getSettings: () => ({ ...settings }) }),
  waves: (root) => renderWaves(root, { getSettings: () => ({ ...settings }) }),
  thermal: (root) => renderThermal(root, { getSettings: () => ({ ...settings }) }),
  advanced: (root) => renderAdvanced(root, { getSettings: () => ({ ...settings }) }),
  roadmap: (root) => renderRoadmap(root, { navigate: (name) => router.navigate(name) }),
};

function element(id) { return document.querySelector(`#${id}`); }
function setValue(id, value) { const node = element(id); if (node) node.value = value; }
function setChecked(id, value) { const node = element(id); if (node) node.checked = Boolean(value); }
function listen(id, event, handler) { const node = element(id); if (node) node.addEventListener(event, handler); }

function persistAndApply({ rerender = false, renderChange = false } = {}) {
  saveSettings(settings);
  applySettings();
  if (renderChange) window.dispatchEvent(new CustomEvent('fisica:renderchange', { detail: { ...settings } }));
  if (rerender && router?.currentRoute) router.navigate(router.currentRoute, { reload: true, replace: true });
}

function applySettings() {
  const effective = applyQuality(settings.quality);
  document.body.classList.toggle('reduce-motion', settings.reduceMotion);
  document.body.classList.toggle('high-contrast', settings.highContrast);
  document.body.classList.toggle('surface-detail-off', settings.surfaceDetail === false);
  document.body.classList.toggle('camera-assist-off', settings.cameraAssist === false);
  document.body.classList.toggle('simplified-instructions', settings.simplifiedInstructions === true);
  document.body.classList.toggle('large-touch-targets', settings.largeTouchTargets === true);
  document.body.classList.toggle('strong-focus', settings.strongFocus !== false);
  document.body.classList.toggle('persistent-labels', settings.persistentLabels === true);
  document.body.classList.toggle('force-2d', settings.force2d === true);
  document.body.classList.toggle('experience-guided', (settings.experienceMode || 'guided') === 'guided');
  document.body.classList.toggle('experience-explore', settings.experienceMode === 'explore');
  document.body.classList.toggle('experience-presentation', settings.experienceMode === 'presentation');
  const qualityLabel = document.querySelector('#btn-quality .pill__label');
  if (qualityLabel) qualityLabel.textContent = settings.quality === 'auto' ? `Auto · ${labels[effective]}` : labels[effective];
  setValue('quality-select', settings.quality);
  setChecked('reduce-motion', settings.reduceMotion);
  setChecked('high-contrast', settings.highContrast);
  setChecked('sound-enabled', settings.sound);
  setValue('density-select', settings.density || 'comfortable');
  setValue('experience-mode-select', settings.experienceMode || 'guided');
  setValue('ui-scale-select', String(settings.uiScale || 100));
  setChecked('low-transparency', settings.lowTransparency === true);
  setChecked('dynamic-resolution', settings.dynamicResolution !== false);
  setChecked('post-processing', settings.postProcessing !== false);
  setChecked('show-performance', settings.showPerformance === true);
  setChecked('adaptive-quality', settings.adaptiveQuality !== false);
  setChecked('pause-hidden-scenes', settings.pauseHiddenScenes !== false);
  setChecked('webgl-recovery', settings.webglRecovery !== false);
  setChecked('surface-detail', settings.surfaceDetail !== false);
  setChecked('inspection-lighting', settings.inspectionLighting !== false);
  setChecked('camera-assist', settings.cameraAssist !== false);
  setChecked('force-2d', settings.force2d === true);
  setChecked('safe-3d', settings.safe3d === true);
  setChecked('tutorial-auto-start', settings.tutorialAutoStart === true);
  setChecked('simplified-instructions', settings.simplifiedInstructions === true);
  setChecked('large-touch-targets', settings.largeTouchTargets === true);
  setChecked('strong-focus', settings.strongFocus !== false);
  setChecked('persistent-labels', settings.persistentLabels === true);
  applyInterfaceSettings(settings);
}

function refreshPerformanceAudit() {
  const audit = buildPerformanceAudit({ settings });
  const output = element('render-audit-output');
  const status = element('audit-status');
  if (output) output.textContent = formatPerformanceAudit(audit);
  if (status) {
    status.textContent = audit.assessment === 'dentro-do-orcamento' ? 'Estável' : audit.assessment === 'requer-reducao' ? 'Ajustando' : 'Aguardando';
    status.dataset.state = audit.assessment;
  }
  return audit;
}


async function refreshWebGLPreflight({ recovery = false } = {}) {
  const output = element('webgl-preflight-output');
  const status = element('webgl-preflight-status');
  if (output) output.textContent = 'Testando contexto, shaders e desenho…';
  if (status) { status.textContent = 'Executando'; status.dataset.state = 'running'; }
  const report = await runWebGLPreflight({ preferWebGL2: true, testRecovery: recovery });
  if (output) output.textContent = formatWebGLPreflight(report);
  if (status) {
    status.textContent = report.available ? (report.tier === 'minimal' ? 'Limitado' : 'Aprovado') : 'Falhou';
    status.dataset.state = report.available ? report.tier : 'failed';
  }
  refreshPerformanceAudit();
  return report;
}

let latestDeviceValidation = null;
function readManualValidation() {
  return Object.fromEntries([...document.querySelectorAll('[data-device-criterion]')].map((select) => [select.dataset.deviceCriterion, select.value]));
}
function refreshDeviceValidation() {
  latestDeviceValidation = buildDeviceValidation({
    settings,
    label: element('device-validation-label')?.value || '',
    manual: readManualValidation(),
    notes: element('device-validation-notes')?.value || '',
  });
  const output = element('device-validation-output');
  const status = element('device-validation-status');
  const history = element('device-validation-history');
  if (output) output.textContent = formatDeviceValidation(latestDeviceValidation);
  if (status) { status.textContent = latestDeviceValidation.assessment; status.dataset.state = latestDeviceValidation.assessment; }
  const count = loadDeviceValidationMatrix().length;
  if (history) history.textContent = count ? `${count} aparelho(s) registrado(s) localmente.` : 'Nenhum aparelho salvo.';
  return latestDeviceValidation;
}

function updateForce2d(enabled, { reload = true } = {}) {
  settings.force2d = Boolean(enabled);
  if (enabled) settings.postProcessing = false;
  persistAndApply({ renderChange: true });
  if (reload && router?.currentRoute) router.navigate(router.currentRoute, { reload: true, replace: true });
}

function afterNavigate(routeName, routeRoot) {
  document.body.dataset.currentRoute = routeName;
  applyModuleTheme(routeName);
  hydrateIconElements(routeRoot);
  hydrateIconElements(document.querySelector('.dock'));
  if (pedagogy) pedagogy.attachRoute(routeName, routeRoot);
  unbindRouteState();
  const workspaceOptions = {
    settings,
    openGuide: () => pedagogy?.openProgress('route'),
    reloadRoute: () => router.navigate(routeName, { reload: true, replace: true }),
    openLabs: () => router.navigate('roadmap'),
    setForce2d: (enabled) => updateForce2d(enabled),
  };
  renderRouteBrief(view, routeName, workspaceOptions);
  unbindExperienceWorkspace();
  unbindExperienceWorkspace = mountExperienceWorkspace(view, routeName, workspaceOptions);
  unbindRouteState = bindRouteRenderState(view, routeName);
}

async function boot() {
  try {
    const steps = ['Verificando a interface…', 'Aplicando modo seguro…', 'Preparando laboratórios…'];
    for (let index = 0; index < steps.length; index += 1) {
      if (bootText) bootText.textContent = steps[index];
      if (progress) progress.style.width = `${((index + 1) / steps.length) * 100}%`;
      await new Promise((resolve) => setTimeout(resolve, 45));
    }
    hydrateIconElements(document);
    applySettings();
    pedagogy = new GuidedLearningController({ getSettings: () => ({ ...settings }) });
    router = new Router(view, routes, { afterNavigate });
    stabilityCenter = createStabilityCenter({
      getSettings: () => ({ ...settings }),
      saveSettings: (next) => { settings = { ...settings, ...next }; saveSettings(settings); applySettings(); },
      retryRoute: () => router.navigate(router.currentRoute || 'hall', { reload: true, replace: true }),
      openLabs: () => router.navigate('roadmap'),
    });
    const initial = location.hash.slice(1);
    await router.navigate(routes[initial] ? initial : 'hall', { replace: true });
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('./sw.js').catch((error) => reportRuntimeIssue(error, { label: 'Offline indisponível', source: 'service-worker' }));
    }
  } catch (error) {
    reportRuntimeIssue(error, { label: 'Falha na inicialização', source: 'boot' });
    if (view) view.innerHTML = `<section class="boot-error"><span class="badge">Modo de recuperação</span><h1>A plataforma não terminou de iniciar.</h1><p>Abra a lista simplificada de laboratórios ou recarregue a página.</p><div><button data-boot-retry>Recarregar</button><button data-boot-labs>Laboratórios</button></div></section>`;
    view?.querySelector('[data-boot-retry]')?.addEventListener('click', () => location.reload());
    view?.querySelector('[data-boot-labs]')?.addEventListener('click', () => { location.hash = '#roadmap'; location.reload(); });
  } finally {
    element('boot')?.remove();
    app?.classList.remove('is-hidden');
    document.body.dataset.appReady = 'true';
    window.dispatchEvent(new CustomEvent('fisica:app-ready', { detail: { route: router?.currentRoute || 'hall' } }));
  }
}

// Navegação principal.
document.querySelectorAll('[data-route]').forEach((button) => button.addEventListener('click', () => router?.navigate(button.dataset.route)));
listen('brand', 'click', () => router?.navigate('hall'));
listen('btn-settings', 'click', () => { refreshPerformanceAudit(); refreshDeviceValidation(); element('settings-dialog')?.showModal(); });
listen('btn-progress', 'click', () => pedagogy?.openProgress());
listen('dock-progress', 'click', () => pedagogy?.openProgress());
listen('btn-help', 'click', () => element('help-dialog')?.showModal());
listen('btn-quality', 'click', () => { refreshPerformanceAudit(); refreshDeviceValidation(); element('settings-dialog')?.showModal(); });

const settingBindings = {
  'quality-select': ['quality', (node) => node.value],
  'reduce-motion': ['reduceMotion', (node) => node.checked],
  'high-contrast': ['highContrast', (node) => node.checked],
  'sound-enabled': ['sound', (node) => node.checked],
  'density-select': ['density', (node) => node.value],
  'experience-mode-select': ['experienceMode', (node) => node.value],
  'ui-scale-select': ['uiScale', (node) => Number(node.value)],
  'low-transparency': ['lowTransparency', (node) => node.checked],
};
Object.entries(settingBindings).forEach(([id, [key, read]]) => listen(id, 'change', (event) => {
  settings[key] = read(event.target);
  persistAndApply({ rerender: key === 'experienceMode' });
}));

const renderToggleMap = {
  'dynamic-resolution': 'dynamicResolution', 'post-processing': 'postProcessing', 'show-performance': 'showPerformance',
  'adaptive-quality': 'adaptiveQuality', 'pause-hidden-scenes': 'pauseHiddenScenes', 'webgl-recovery': 'webglRecovery',
  'surface-detail': 'surfaceDetail', 'inspection-lighting': 'inspectionLighting', 'camera-assist': 'cameraAssist',
  'safe-3d': 'safe3d',
};
Object.entries(renderToggleMap).forEach(([id, key]) => listen(id, 'change', (event) => {
  settings[key] = event.target.checked;
  persistAndApply({ renderChange: true });
  refreshPerformanceAudit();
}));
listen('force-2d', 'change', (event) => updateForce2d(event.target.checked));

const pedagogyToggleMap = {
  'tutorial-auto-start': 'tutorialAutoStart', 'simplified-instructions': 'simplifiedInstructions',
  'large-touch-targets': 'largeTouchTargets', 'strong-focus': 'strongFocus', 'persistent-labels': 'persistentLabels',
};
Object.entries(pedagogyToggleMap).forEach(([id, key]) => listen(id, 'change', (event) => {
  settings[key] = event.target.checked;
  persistAndApply();
  pedagogy?.render();
}));

listen('run-render-audit', 'click', refreshPerformanceAudit);
listen('run-webgl-preflight', 'click', () => refreshWebGLPreflight({ recovery: false }));
listen('run-webgl-recovery-test', 'click', () => refreshWebGLPreflight({ recovery: true }));
listen('export-render-audit', 'click', () => downloadPerformanceAudit(refreshPerformanceAudit()));
window.addEventListener('fisica:renderreport', () => { if (element('settings-dialog')?.open) refreshPerformanceAudit(); });
window.addEventListener('fisica:runtimeerror', (event) => reportRuntimeIssue(event.detail?.error || event.detail?.message || 'Falha de execução', event.detail || {}));
window.addEventListener('fisica:requestsafe2d', () => updateForce2d(true));

listen('run-device-validation', 'click', refreshDeviceValidation);
document.querySelectorAll('[data-device-criterion]').forEach((select) => select.addEventListener('change', refreshDeviceValidation));
listen('save-device-validation', 'click', () => { saveDeviceValidation(refreshDeviceValidation()); refreshDeviceValidation(); });
listen('export-device-validation-json', 'click', exportDeviceValidationJSON);
listen('export-device-validation-csv', 'click', exportDeviceValidationCSV);
listen('clear-local', 'click', () => {
  if (confirm('Apagar preferências, progresso e experiências locais desta plataforma?')) {
    clearLocalData(); settings = loadSettings(); applySettings(); pedagogy?.reload(); alert('Dados locais apagados.');
    router?.navigate(router.currentRoute || 'hall', { reload: true, replace: true });
  }
});

boot();
