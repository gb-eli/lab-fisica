import { Router } from './router.js';
import { loadSettings, saveSettings, clearLocalData } from './storage.js';
import { applyQuality, labels } from './quality.js';
import { applyModuleTheme, applyInterfaceSettings } from './design-system.js';
import { hydrateIconElements } from './ui/icons.js';
import { GuidedLearningController } from './pedagogy/guided-learning.js';
import { createStabilityCenter, renderRouteBrief, bindRouteRenderState, reportRuntimeIssue } from './stability.js';
import { ROUTE_DEFINITIONS, INITIAL_ROUTE, getRouteDefinition } from './labs/route-registry.js';
import { RouteResourceManager } from './labs/route-resource-manager.js';
import { StudentSessionManager, formatDuration, shiftLabel } from './session/student-session.js';

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
let utilityStylesReady = false;
let diagnosticsModulePromise = null;
let deviceValidationModulePromise = null;
let webglPreflightModulePromise = null;
let workspaceLoadToken = 0;
let mentorController = null;
let mentorModulePromise = null;
let mentorStylesReady = false;
const loadDiagnosticsModule = () => diagnosticsModulePromise ||= import('./diagnostics.js');
const loadDeviceValidationModule = () => deviceValidationModulePromise ||= import('./device-validation.js');
const loadWebGLPreflightModule = () => webglPreflightModulePromise ||= import('./render/webgl-preflight.js');

async function ensureMentorSystem() {
  if (!mentorStylesReady) { mentorStylesReady = true; await routeResources.loadStyle('css/mentor-guided.css'); }
  const { MentorController } = await (mentorModulePromise ||= import('./mentors/mentor-controller.js'));
  if (!mentorController) mentorController = new MentorController({
    getSettings: () => ({ ...settings }),
    updateSettings: (patch) => { settings = { ...settings, ...patch }; saveSettings(settings); applySettings(); },
    navigate: (route) => router?.navigate(route),
    session: studentSession,
  });
  return mentorController;
}
const studentSession = new StudentSessionManager();
const routeResources = new RouteResourceManager({ session: studentSession });
window.__FISICA_DEBUG__ = Object.freeze({
  getRouteResources: () => routeResources.getReport(),
  getStudentSession: () => studentSession.getSnapshot(),
  getCurrentRoute: () => router?.currentRoute || null,
});

function routeContext(routeName) {
  const base = {
    navigate: (name) => router.navigate(name),
    getSettings: () => ({ ...settings }),
    session: studentSession,
    openSession: () => openStudentSession(),
    openMentors: async () => (await ensureMentorSystem()).openSelector(),
    setFreeMode: async () => { const controller = await ensureMentorSystem(); controller.setFreeMode(); if (router?.currentRoute === 'home') router.navigate('home', { reload: true, replace: true }); },
  };
  if (routeName === 'roadmap') return { navigate: base.navigate, session: studentSession, openSession: base.openSession };
  if (routeName === 'home') return base;
  if (routeName === 'hall') return base;
  return { getSettings: base.getSettings, session: studentSession };
}

const routes = Object.fromEntries(Object.entries(ROUTE_DEFINITIONS).map(([routeName, definition]) => [
  routeName,
  (root) => routeResources.open(definition, root, routeContext(routeName)),
]));

function element(id) { return document.querySelector(`#${id}`); }
function setValue(id, value) { const node = element(id); if (node) node.value = value; }
function setChecked(id, value) { const node = element(id); if (node) node.checked = Boolean(value); }
function listen(id, event, handler) { const node = element(id); if (node) node.addEventListener(event, handler); }
function initials(name = '') { return String(name).trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?'; }

async function ensureUtilityStyles() {
  if (utilityStylesReady) return;
  utilityStylesReady = true;
  await Promise.all([
    routeResources.loadStyle('css/performance-validation.css'),
    routeResources.loadStyle('css/device-validation.css'),
  ]).catch((error) => reportRuntimeIssue(error, { label: 'Estilos de diagnóstico indisponíveis', source: 'settings' }));
}

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
  document.body.classList.toggle('learning-mode-free', settings.learningMode !== 'mentor');
  document.body.classList.toggle('learning-mode-mentor', settings.learningMode === 'mentor');
  const learningButton = element('btn-learning-mode');
  if (learningButton) learningButton.textContent = settings.learningMode === 'mentor' ? 'Modo guiado' : 'Modo livre';
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
  setChecked('allow-remote-three', settings.allowRemoteThree !== false);
  setChecked('tutorial-auto-start', settings.tutorialAutoStart === true);
  setChecked('simplified-instructions', settings.simplifiedInstructions === true);
  setChecked('large-touch-targets', settings.largeTouchTargets === true);
  setChecked('strong-focus', settings.strongFocus !== false);
  setChecked('persistent-labels', settings.persistentLabels === true);
  applyInterfaceSettings(settings);
}

async function refreshPerformanceAudit() {
  const { buildPerformanceAudit, formatPerformanceAudit } = await loadDiagnosticsModule();
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
  const { runWebGLPreflight, formatWebGLPreflight } = await loadWebGLPreflightModule();
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
async function refreshDeviceValidation() {
  const { buildDeviceValidation, formatDeviceValidation, loadDeviceValidationMatrix } = await loadDeviceValidationModule();
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

function updateSessionUI(snapshot = studentSession.getSnapshot()) {
  const profile = snapshot.profile;
  document.querySelectorAll('[data-session-avatar]').forEach((node) => { node.textContent = initials(profile?.name); });
  document.querySelectorAll('[data-session-name]').forEach((node) => { node.textContent = profile?.name || 'Visitante'; });
  document.querySelectorAll('[data-session-class]').forEach((node) => { node.textContent = profile ? `${profile.className} · ${shiftLabel(profile.shift)}` : 'Entrar como estudante'; });
  const login = document.querySelector('[data-session-login]');
  const current = document.querySelector('[data-session-current]');
  if (login) login.hidden = snapshot.loggedIn;
  if (current) current.hidden = !snapshot.loggedIn;
  if (!snapshot.loggedIn) return;
  const visits = snapshot.routes.reduce((sum, route) => sum + route.visits, 0);
  const setText = (selector, value) => { const node = document.querySelector(selector); if (node) node.textContent = value; };
  setText('[data-dialog-avatar]', initials(profile.name));
  setText('[data-dialog-name]', profile.name);
  setText('[data-dialog-class]', `${profile.className} · ${shiftLabel(profile.shift)}`);
  const mentorLabels = { einstein: 'Einstein', newton: 'Newton', faraday: 'Faraday', curie: 'Marie Curie', tesla: 'Nikola Tesla', galileo: 'Galileu' };
  setText('[data-dialog-learning]', snapshot.session?.learning?.mode === 'mentor' ? `Modo Guiado · ${mentorLabels[snapshot.session?.learning?.mentorId] || 'Mentor histórico'}` : 'Modo Livre');
  setText('[data-dialog-time]', formatDuration(snapshot.totalActiveSeconds));
  setText('[data-dialog-labs]', String(snapshot.labs.length));
  setText('[data-dialog-visits]', String(visits));
  const list = document.querySelector('[data-dialog-routes]');
  if (list) {
    list.innerHTML = snapshot.routes.length ? snapshot.routes.map((route) => `
      <article class="student-session-route"><span>${route.title}</span><small>${route.visits} acesso(s)</small><strong>${formatDuration(route.activeSeconds)}</strong></article>`).join('')
      : '<p class="student-session-empty">Nenhum laboratório foi acessado nesta sessão.</p>';
  }
}

function openStudentSession() {
  updateSessionUI();
  element('student-session-dialog')?.showModal();
}

function afterNavigate(routeName, routeRoot) {
  document.body.dataset.currentRoute = routeName;
  applyModuleTheme(routeName);
  hydrateIconElements(routeRoot);
  hydrateIconElements(document.querySelector('.dock'));
  const definition = getRouteDefinition(routeName);
  if (definition.kind === 'lab' || definition.kind === 'orientation') {
    pedagogy?.attachRoute(routeName, routeRoot);
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
    const token = ++workspaceLoadToken;
    import('./ui/experience-workspace.js').then(({ mountExperienceWorkspace }) => {
      if (token !== workspaceLoadToken || router?.currentRoute !== routeName) return;
      unbindExperienceWorkspace = mountExperienceWorkspace(view, routeName, workspaceOptions);
      mentorController?.render?.();
    }).catch((error) => reportRuntimeIssue(error, { label: 'Falha ao organizar workspace', source: routeName }));
    unbindRouteState = bindRouteRenderState(view, routeName);
    if (settings.learningMode === 'mentor') ensureMentorSystem().then((controller) => controller.attachRoute(routeName, routeRoot)).catch((error) => reportRuntimeIssue(error, { label: 'Falha no modo mentor', source: routeName }));
    else mentorController?.detachRoute();
  } else {
    workspaceLoadToken += 1;
    unbindRouteState(); unbindRouteState = () => {};
    unbindExperienceWorkspace(); unbindExperienceWorkspace = () => {};
    mentorController?.detachRoute();
  }
}

async function boot() {
  try {
    const steps = ['Carregando somente o portal…', 'Restaurando preferências e sessão…', 'Preparando o catálogo modular…'];
    for (let index = 0; index < steps.length; index += 1) {
      if (bootText) bootText.textContent = steps[index];
      if (progress) progress.style.width = `${((index + 1) / steps.length) * 100}%`;
      await new Promise((resolve) => setTimeout(resolve, 35));
    }
    hydrateIconElements(document);
    applySettings();
    updateSessionUI();
    pedagogy = new GuidedLearningController({ getSettings: () => ({ ...settings }) });
    router = new Router(view, routes, { afterNavigate, fallbackRoute: INITIAL_ROUTE });
    stabilityCenter = createStabilityCenter({
      getSettings: () => ({ ...settings }),
      saveSettings: (next) => { settings = { ...settings, ...next }; saveSettings(settings); applySettings(); },
      retryRoute: () => router.navigate(router.currentRoute || INITIAL_ROUTE, { reload: true, replace: true }),
      openLabs: () => router.navigate('roadmap'),
    });
    const initial = location.hash.slice(1);
    await router.navigate(routes[initial] ? initial : INITIAL_ROUTE, { replace: true });
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('./sw.js').catch((error) => reportRuntimeIssue(error, { label: 'Offline indisponível', source: 'service-worker' }));
    }
  } catch (error) {
    reportRuntimeIssue(error, { label: 'Falha na inicialização', source: 'boot' });
    if (view) view.innerHTML = `<section class="boot-error"><span class="badge">Modo de recuperação</span><h1>A plataforma não terminou de iniciar.</h1><p>Abra o portal leve ou a lista simplificada de laboratórios.</p><div><button data-boot-retry>Recarregar</button><button data-boot-labs>Laboratórios</button></div></section>`;
    view?.querySelector('[data-boot-retry]')?.addEventListener('click', () => location.reload());
    view?.querySelector('[data-boot-labs]')?.addEventListener('click', () => { location.hash = '#roadmap'; location.reload(); });
  } finally {
    element('boot')?.remove();
    app?.classList.remove('is-hidden');
    document.body.dataset.appReady = 'true';
    window.dispatchEvent(new CustomEvent('fisica:app-ready', { detail: { route: router?.currentRoute || INITIAL_ROUTE } }));
  }
}

document.querySelectorAll('[data-route]').forEach((button) => button.addEventListener('click', () => router?.navigate(button.dataset.route)));
listen('brand', 'click', () => router?.navigate('home'));
listen('btn-student-session', 'click', openStudentSession);
listen('dock-session', 'click', openStudentSession);
listen('student-login', 'click', () => {
  try {
    studentSession.login({ name: element('student-name')?.value, className: element('student-class')?.value, shift: element('student-shift')?.value, pin: element('student-pin')?.value });
    const activeDefinition = getRouteDefinition(router?.currentRoute || INITIAL_ROUTE);
    studentSession.enterRoute(activeDefinition.route, { kind: activeDefinition.kind, title: activeDefinition.title });
    studentSession.recordLearningMode({ mode: settings.learningMode || 'free', mentorId: settings.mentorId || null, trackId: settings.mentorId ? `${settings.mentorId}-core-r9` : null });
    updateSessionUI();
  } catch (error) { alert(error.message); }
});
listen('export-session-json', 'click', () => studentSession.exportJSON());
listen('export-session-csv', 'click', () => studentSession.exportCSV());
listen('switch-student', 'click', () => {
  studentSession.switchStudent();
  updateSessionUI();
  element('student-name')?.focus();
});
listen('logout-student', 'click', () => {
  studentSession.logout();
  updateSessionUI();
});
studentSession.subscribe(updateSessionUI);

const actionLogState = new Map();
function readableControlLabel(node) {
  return node.getAttribute('aria-label') || node.title || node.dataset.guidedAction || node.name || node.id || node.textContent?.trim().slice(0, 80) || node.tagName.toLowerCase();
}
function logStudentInteraction(event) {
  const snapshot = studentSession.getSnapshot();
  const route = router?.currentRoute;
  const definition = getRouteDefinition(route || INITIAL_ROUTE);
  if (!snapshot.loggedIn || definition.kind !== 'lab') return;
  const node = event.target?.closest?.('button,input,select,textarea,[role="button"],[data-guided-action]');
  if (!node || node.closest('#student-session-dialog,#settings-dialog,#help-dialog')) return;
  if (node.type === 'password' || node.id === 'student-pin') return;
  const target = node.dataset.guidedAction || node.id || node.name || node.getAttribute('role') || node.tagName.toLowerCase();
  const key = `${route}:${event.type}:${target}`;
  const now = Date.now();
  if (now - (actionLogState.get(key) || 0) < (event.type === 'input' ? 1800 : 350)) return;
  actionLogState.set(key, now);
  studentSession.recordAction({ route, action: event.type, target, label: readableControlLabel(node), inputType: node.type || node.tagName.toLowerCase() });
}
document.addEventListener('click', logStudentInteraction, true);
document.addEventListener('change', logStudentInteraction, true);
document.addEventListener('input', logStudentInteraction, true);


listen('btn-settings', 'click', async () => { await ensureUtilityStyles(); refreshPerformanceAudit(); refreshDeviceValidation(); element('settings-dialog')?.showModal(); });
listen('btn-progress', 'click', async () => { if (settings.learningMode === 'mentor') (await ensureMentorSystem()).openSelector(); else pedagogy?.openProgress(); });
listen('dock-progress', 'click', async () => { if (settings.learningMode === 'mentor') (await ensureMentorSystem()).openSelector(); else pedagogy?.openProgress(); });
listen('btn-learning-mode', 'click', async () => (await ensureMentorSystem()).openSelector());
listen('btn-help', 'click', () => element('help-dialog')?.showModal());
listen('btn-quality', 'click', async () => { await ensureUtilityStyles(); refreshPerformanceAudit(); refreshDeviceValidation(); element('settings-dialog')?.showModal(); });

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
  'safe-3d': 'safe3d', 'allow-remote-three': 'allowRemoteThree',
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
listen('export-render-audit', 'click', async () => { const { downloadPerformanceAudit } = await loadDiagnosticsModule(); downloadPerformanceAudit(await refreshPerformanceAudit()); });
window.addEventListener('fisica:renderreport', () => { if (element('settings-dialog')?.open) refreshPerformanceAudit(); });
window.addEventListener('fisica:runtimeerror', (event) => reportRuntimeIssue(event.detail?.error || event.detail?.message || 'Falha de execução', event.detail || {}));
window.addEventListener('fisica:requestsafe2d', () => updateForce2d(true));

listen('run-device-validation', 'click', refreshDeviceValidation);
document.querySelectorAll('[data-device-criterion]').forEach((select) => select.addEventListener('change', refreshDeviceValidation));
listen('save-device-validation', 'click', async () => { const { saveDeviceValidation } = await loadDeviceValidationModule(); saveDeviceValidation(await refreshDeviceValidation()); await refreshDeviceValidation(); });
listen('export-device-validation-json', 'click', async () => { const { exportDeviceValidationJSON } = await loadDeviceValidationModule(); exportDeviceValidationJSON(); });
listen('export-device-validation-csv', 'click', async () => { const { exportDeviceValidationCSV } = await loadDeviceValidationModule(); exportDeviceValidationCSV(); });
listen('clear-lab-cache', 'click', async () => {
  try {
    await caches?.delete?.('fisica-imersiva-360-v0.5.0-labs');
    navigator.serviceWorker?.controller?.postMessage({ type: 'CLEAR_LAB_CACHE' });
    alert('Arquivos baixados dos laboratórios foram removidos. O portal leve permanece disponível.');
  } catch (error) { reportRuntimeIssue(error, { label: 'Falha ao limpar cache dos laboratórios', source: 'cache' }); }
});
listen('clear-local', 'click', () => {
  if (confirm('Apagar preferências, progresso, sessões e experiências locais desta plataforma?')) {
    clearLocalData(); alert('Dados locais apagados. A plataforma será reiniciada.');
    location.hash = '#home';
    location.reload();
  }
});

boot();
