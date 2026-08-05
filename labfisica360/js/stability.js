import { ROUTE_META } from './labs/lab-catalog.js';

const MAX_ISSUES = 30;
const issues = [];

export const LAB_META = ROUTE_META;

function normalizeError(error) {
  if (error instanceof Error) return { message: error.message || 'Erro sem mensagem', stack: error.stack || '' };
  if (typeof error === 'string') return { message: error, stack: '' };
  try { return { message: JSON.stringify(error), stack: '' }; } catch { return { message: String(error), stack: '' }; }
}

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 600);
}

export function reportRuntimeIssue(error, context = {}) {
  const normalized = normalizeError(error);
  const issue = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    at: new Date().toISOString(),
    route: location.hash.slice(1) || 'hall',
    message: normalized.message,
    stack: normalized.stack,
    context,
  };
  issues.unshift(issue);
  issues.splice(MAX_ISSUES);
  window.dispatchEvent(new CustomEvent('fisica:issue', { detail: issue }));
  return issue;
}

export function getRuntimeIssues() {
  return issues.map((issue) => ({ ...issue, context: { ...issue.context } }));
}

export function setRenderState(state, detail = {}) {
  window.dispatchEvent(new CustomEvent('fisica:renderstate', { detail: { state, ...detail } }));
}

export function createStabilityCenter({ getSettings, saveSettings, retryRoute, openLabs }) {
  const host = document.createElement('aside');
  host.className = 'stability-center';
  host.hidden = true;
  host.setAttribute('role', 'alert');
  host.setAttribute('aria-live', 'assertive');
  host.innerHTML = `
    <div class="stability-center__copy">
      <strong data-stability-title>Falha recuperável</strong>
      <span data-stability-message>O laboratório encontrou um problema.</span>
    </div>
    <div class="stability-center__actions">
      <button type="button" data-stability-retry>Tentar novamente</button>
      <button type="button" data-stability-safe>Usar modo 2D</button>
      <button type="button" data-stability-labs>Laboratórios</button>
      <button type="button" data-stability-details>Detalhes</button>
      <button type="button" data-stability-close aria-label="Fechar aviso">×</button>
    </div>`;
  document.body.append(host);

  const dialog = document.createElement('dialog');
  dialog.className = 'modal stability-dialog';
  dialog.innerHTML = `<form method="dialog" class="modal__card modal__card--wide">
    <div class="modal__head"><h2>Diagnóstico de funcionamento</h2><button aria-label="Fechar">×</button></div>
    <p>Este relatório registra somente erros técnicos desta sessão. Nenhuma informação pessoal é coletada.</p>
    <pre data-stability-log>Nenhum erro registrado.</pre>
    <div class="stability-dialog__actions"><button type="button" data-stability-export>Exportar JSON</button><button value="close">Fechar</button></div>
  </form>`;
  document.body.append(dialog);

  let hideTimer = 0;
  const title = host.querySelector('[data-stability-title]');
  const message = host.querySelector('[data-stability-message]');
  const log = dialog.querySelector('[data-stability-log]');

  function renderLog() {
    log.textContent = issues.length
      ? issues.map((issue, index) => `${index + 1}. ${issue.at} · ${issue.route}\n${issue.message}\n${issue.context?.source || ''}\n`).join('\n')
      : 'Nenhum erro registrado.';
  }

  function show(issue) {
    clearTimeout(hideTimer);
    title.textContent = issue.context?.label || 'Falha recuperável';
    message.textContent = issue.message || 'O laboratório encontrou um problema.';
    host.hidden = false;
    hideTimer = setTimeout(() => { host.hidden = true; }, 14000);
  }

  function enableSafeMode() {
    const settings = { ...getSettings(), force2d: true, postProcessing: false, adaptiveQuality: true };
    saveSettings(settings);
    document.body.classList.add('force-2d');
    window.dispatchEvent(new CustomEvent('fisica:renderchange', { detail: settings }));
    retryRoute?.();
  }

  host.querySelector('[data-stability-retry]').addEventListener('click', () => retryRoute?.());
  host.querySelector('[data-stability-safe]').addEventListener('click', enableSafeMode);
  host.querySelector('[data-stability-labs]').addEventListener('click', () => openLabs?.());
  host.querySelector('[data-stability-details]').addEventListener('click', () => { renderLog(); dialog.showModal(); });
  host.querySelector('[data-stability-close]').addEventListener('click', () => { clearTimeout(hideTimer); host.hidden = true; });
  dialog.querySelector('[data-stability-export]').addEventListener('click', () => downloadJson({ version: '0.5.0', generatedAt: new Date().toISOString(), issues: getRuntimeIssues() }, `fisica-imersiva-diagnostico-${new Date().toISOString().slice(0, 10)}.json`));

  const onIssue = (event) => show(event.detail);
  const onError = (event) => reportRuntimeIssue(event.error || event.message, { source: event.filename || 'window.error', line: event.lineno, column: event.colno });
  const onRejection = (event) => reportRuntimeIssue(event.reason, { source: 'unhandledrejection' });
  window.addEventListener('fisica:issue', onIssue);
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);

  return {
    show,
    enableSafeMode,
    dispose() {
      clearTimeout(hideTimer);
      window.removeEventListener('fisica:issue', onIssue);
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      host.remove();
      dialog.remove();
    },
  };
}

export function renderRouteBrief(view, routeName, {
  settings = {},
  openGuide,
  reloadRoute,
  openLabs,
  setForce2d,
} = {}) {
  view.querySelector('[data-route-brief]')?.remove();
  if (routeName === 'hall' || routeName === 'roadmap') return null;
  const meta = LAB_META[routeName] || LAB_META.hall;
  const bar = document.createElement('section');
  bar.className = 'route-brief';
  bar.dataset.routeBrief = routeName;
  bar.innerHTML = `
    <div class="route-brief__main">
      <span>${meta.group}</span>
      <strong>${meta.objective}</strong>
      <ol>${meta.steps.map((step) => `<li>${step}</li>`).join('')}</ol>
    </div>
    <div class="route-brief__status">
      <span data-route-render-state data-state="loading">Preparando laboratório</span>
      <button type="button" data-route-controls>Controles</button>
      <button type="button" data-route-guide>Objetivo e etapas</button>
      <button type="button" data-route-reload>Reabrir</button>
      <button type="button" data-route-safe>${settings.force2d ? 'Ativar 3D' : 'Usar 2D'}</button>
      <button type="button" data-route-labs>Laboratórios</button>
    </div>
    <p class="route-brief__controls" data-route-controls-copy hidden>${meta.controls}</p>`;
  view.prepend(bar);
  bar.querySelector('[data-route-controls]').addEventListener('click', () => {
    const copy = bar.querySelector('[data-route-controls-copy]');
    copy.hidden = !copy.hidden;
  });
  bar.querySelector('[data-route-guide]').addEventListener('click', () => openGuide?.());
  bar.querySelector('[data-route-reload]').addEventListener('click', () => reloadRoute?.());
  bar.querySelector('[data-route-safe]').addEventListener('click', () => setForce2d?.(!settings.force2d));
  bar.querySelector('[data-route-labs]').addEventListener('click', () => openLabs?.());
  return bar;
}

export function bindRouteRenderState(view, routeName) {
  const onState = (event) => {
    const detail = event.detail || {};
    if (detail.route && detail.route !== routeName) return;
    const element = view.querySelector('[data-route-render-state]');
    if (!element) return;
    const labels = {
      loading: 'Carregando 3D',
      ready: '3D pronto',
      fallback: 'Modo 2D ativo',
      error: 'Falha no 3D',
      suspended: 'Cena pausada',
      resumed: '3D retomado',
    };
    element.dataset.state = detail.state || 'loading';
    element.textContent = detail.label || labels[detail.state] || 'Estado desconhecido';
  };
  window.addEventListener('fisica:renderstate', onState);
  return () => window.removeEventListener('fisica:renderstate', onState);
}
