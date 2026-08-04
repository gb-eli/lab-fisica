import { getLab } from '../labs/lab-catalog.js';

const ROUTE_LAYOUT = Object.freeze({
  coulomb: {
    root: '.module-shell', stage: '.sim-card', controls: '.control-stack',
    support: ['.control-card:nth-last-of-type(1)', '.control-card:nth-last-of-type(2)'],
  },
  ohm: {
    root: '.electrical-bench-module', stage: '.bench-scene-card', controls: '.control-stack',
    scenarioSelect: '[data-select="template"]',
    result: ['.branch-card', '.meter-card', '.fault-panel'],
    support: ['.interaction-card', '.component-focus', '.history-card', '.guided-practice', '.evidence-card', '.control-card:nth-last-of-type(2)', '.control-card:nth-last-of-type(3)'],
  },
  magnetism: {
    root: '.magnetism-lab', stage: '.magnetism-stage', controls: '.magnetism-controls', modeButtons: '[data-mag-mode]',
    support: ['.mag-model-info', '.mag-practice'],
  },
  energy: {
    root: '.energy-lab', stage: '.energy-stage', controls: '.energy-controls', modeButtons: '[data-energy-mode]',
    result: ['.energy-results'], support: ['.energy-practice'],
  },
  mechanics: {
    root: '.mechanics-lab', stage: '.mechanics-stage', controls: '.mechanics-controls', modeButtons: '[data-mechanics-mode]',
    support: ['.mechanics-model', '.mechanics-practice'],
  },
  waves: {
    root: '.waves-lab', stage: '.waves-stage', controls: '.waves-controls', modeButtons: '[data-waves-mode]',
    support: ['.waves-practice'],
  },
  thermal: {
    root: '.thermal-lab', stage: '.thermal-stage', controls: '.thermal-controls', modeButtons: '[data-thermal-mode]',
    support: ['.thermal-model', '.thermal-practice'],
  },
  advanced: {
    root: '.advanced-premium', stage: '.advanced-stage', controls: '.advanced-controls', modeButtons: '[data-advanced-mode]',
    support: ['.advanced-practice', '.advanced-controls > .glass-card:nth-child(3)'],
  },
});

const VIEW_LABELS = Object.freeze({
  overview: 'Laboratório', scene: 'Cena', controls: 'Controles', results: 'Resultados', support: 'Apoio',
});

function text(node) {
  return String(node?.textContent || '').replace(/\s+/g, ' ').trim();
}

function findHeader(card) {
  return card.querySelector(':scope > .card-title-row, :scope > .panel-title, :scope > h2, :scope > h3') || card.firstElementChild;
}

function makeCollapsible(card, { collapsed = true } = {}) {
  if (!card || card.dataset.workspaceCollapsible === 'true') return () => {};
  const header = findHeader(card);
  if (!header) return () => {};
  const controlled = [...card.children].filter((child) => child !== header);
  if (!controlled.length) return () => {};
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'workspace-card-toggle';
  button.setAttribute('aria-label', 'Expandir ou recolher seção');
  button.innerHTML = '<span aria-hidden="true">⌄</span>';
  header.classList.add('workspace-card-header');
  header.append(button);
  card.dataset.workspaceCollapsible = 'true';
  let isCollapsed = false;
  const apply = (next) => {
    isCollapsed = Boolean(next);
    card.classList.toggle('is-workspace-collapsed', isCollapsed);
    button.setAttribute('aria-expanded', String(!isCollapsed));
    controlled.forEach((child) => { child.hidden = isCollapsed; });
  };
  const onClick = (event) => { event.preventDefault(); event.stopPropagation(); apply(!isCollapsed); };
  button.addEventListener('click', onClick);
  apply(collapsed);
  return () => button.removeEventListener('click', onClick);
}

function uniqueNodes(nodes) {
  return [...new Set(nodes.filter(Boolean))];
}

function queryMany(root, selectors = []) {
  return uniqueNodes(selectors.flatMap((selector) => [...root.querySelectorAll(selector)]));
}

function classifyCards(section, controls, config, guided) {
  if (!controls) return [];
  const cards = [...controls.querySelectorAll(':scope > .glass-card, :scope > .control-card, :scope > article')];
  cards.forEach((card) => { card.dataset.experienceCard = 'true'; card.dataset.experienceKind = 'primary'; });
  queryMany(section, config.result).forEach((card) => { card.dataset.experienceCard = 'true'; card.dataset.experienceKind = 'result'; });
  queryMany(section, config.support).forEach((card) => { card.dataset.experienceCard = 'true'; card.dataset.experienceKind = 'support'; });
  const cleanups = [];
  cards.forEach((card, index) => {
    const kind = card.dataset.experienceKind;
    const shouldCollapse = guided && (kind === 'support' || (window.innerWidth < 760 && index > 1));
    if (kind === 'support' || kind === 'result' || index > 1) cleanups.push(makeCollapsible(card, { collapsed: shouldCollapse }));
  });
  return cleanups;
}

function getModeValue(button) {
  const entries = Object.entries(button.dataset);
  const mode = entries.find(([key]) => /Mode$/.test(key));
  return mode?.[1] || button.value || text(button);
}

function setupScenarioPicker(section, config, slot) {
  if (!slot) return () => {};
  const sourceSelect = config.scenarioSelect ? section.querySelector(config.scenarioSelect) : null;
  const buttons = config.modeButtons ? [...section.querySelectorAll(config.modeButtons)] : [];
  if (!sourceSelect && buttons.length < 2) { slot.hidden = true; return () => {}; }
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Escolher experiência ou cenário');
  if (sourceSelect) {
    [...sourceSelect.options].forEach((option) => select.add(new Option(option.textContent.trim(), option.value)));
    select.value = sourceSelect.value;
  } else {
    buttons.forEach((button) => select.add(new Option(text(button), getModeValue(button))));
    const active = buttons.find((button) => button.classList.contains('is-active') || button.getAttribute('aria-pressed') === 'true');
    select.value = active ? getModeValue(active) : getModeValue(buttons[0]);
  }
  slot.hidden = false;
  slot.replaceChildren(Object.assign(document.createElement('span'), { textContent: 'Experiência' }), select);

  const onChange = () => {
    if (sourceSelect) {
      sourceSelect.value = select.value;
      sourceSelect.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      buttons.find((button) => getModeValue(button) === select.value)?.click();
    }
  };
  const sync = () => {
    if (sourceSelect) select.value = sourceSelect.value;
    else {
      const active = buttons.find((button) => button.classList.contains('is-active') || button.getAttribute('aria-pressed') === 'true');
      if (active) select.value = getModeValue(active);
    }
  };
  select.addEventListener('change', onChange);
  sourceSelect?.addEventListener('change', sync);
  buttons.forEach((button) => button.addEventListener('click', sync));
  return () => {
    select.removeEventListener('change', onChange);
    sourceSelect?.removeEventListener('change', sync);
    buttons.forEach((button) => button.removeEventListener('click', sync));
  };
}

function readPairs(section) {
  const candidates = [...section.querySelectorAll([
    '.readout > div', '.mag-readout', '.energy-readout', '.mechanics-readouts > div', '.waves-readouts > div',
    '.thermal-readouts > div', '.advanced-readouts > div', '.meter-reading', '.energy-result-grid > div',
  ].join(','))];
  const pairs = [];
  const seen = new Set();
  for (const node of candidates) {
    if (node.closest('[data-experience-summary]')) continue;
    const labelNode = node.querySelector('small, span, label');
    const valueNode = node.querySelector('strong, output, b');
    const label = text(labelNode) || 'Leitura';
    const value = text(valueNode) || text(node);
    const key = `${label}|${value}`;
    if (!value || seen.has(key)) continue;
    seen.add(key);
    pairs.push({ label, value });
    if (pairs.length >= 14) break;
  }
  return pairs;
}

function readAlerts(section) {
  const nodes = [...section.querySelectorAll('[data-fault-list] li, [data-state="danger"], [data-state="attention"], .energy-alert')];
  return [...new Set(nodes.map(text).filter((value) => value && value.length < 240))].slice(0, 6);
}

function createSummary(section, meta) {
  const panel = document.createElement('section');
  panel.className = 'experience-summary';
  panel.dataset.experienceSummary = 'true';
  panel.hidden = true;
  panel.innerHTML = `
    <header><div><span>Resultados organizados</span><h2>${meta.shortTitle || meta.title}</h2></div><small data-summary-time>Aguardando interação</small></header>
    <div class="experience-summary__question"><span>Pergunta central</span><strong>${meta.learningQuestion || meta.objective}</strong></div>
    <div class="experience-summary__grid" data-summary-grid></div>
    <section class="experience-summary__alerts" data-summary-alerts hidden><h3>Atenção</h3><ul></ul></section>
    <p class="experience-summary__hint">Altere um parâmetro por vez e compare o resultado antes e depois.</p>`;
  section.append(panel);
  const grid = panel.querySelector('[data-summary-grid]');
  const alertBox = panel.querySelector('[data-summary-alerts]');
  let frame = 0;
  const update = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const pairs = readPairs(section);
      grid.innerHTML = pairs.length
        ? pairs.map(({ label, value }) => `<article><span>${label}</span><strong>${value}</strong></article>`).join('')
        : '<p class="experience-summary__empty">As leituras aparecerão depois que a experiência for iniciada ou um parâmetro for alterado.</p>';
      const alerts = readAlerts(section);
      alertBox.hidden = !alerts.length;
      alertBox.querySelector('ul').innerHTML = alerts.map((alert) => `<li>${alert}</li>`).join('');
      panel.querySelector('[data-summary-time]').textContent = `Atualizado às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    });
  };
  const observer = new MutationObserver(update);
  const stage = section.querySelector('[data-experience-stage]');
  const controls = section.querySelector('[data-experience-controls]');
  if (stage) observer.observe(stage, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-state'] });
  if (controls) observer.observe(controls, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-state', 'value'] });
  section.addEventListener('input', update);
  section.addEventListener('change', update);
  section.addEventListener('click', update);
  update();
  return {
    panel,
    update,
    dispose() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      section.removeEventListener('input', update);
      section.removeEventListener('change', update);
      section.removeEventListener('click', update);
      panel.remove();
    },
  };
}

function rebuildBrief(brief, meta, settings, callbacks) {
  brief.className = 'route-brief route-brief--workspace';
  brief.innerHTML = `
    <div class="route-brief__identity">
      <span>${meta.group}</span>
      <strong>${meta.shortTitle || meta.title}</strong>
      <p>${meta.objective}</p>
    </div>
    <label class="route-brief__scenario" data-experience-scenario-slot hidden></label>
    <nav class="route-brief__views" aria-label="Organizar área do laboratório">
      ${Object.entries(VIEW_LABELS).map(([view, label]) => `<button type="button" data-experience-view="${view}" aria-pressed="false">${label}</button>`).join('')}
    </nav>
    <div class="route-brief__state">
      <span data-route-render-state data-state="loading">Preparando laboratório</span>
      <button type="button" data-route-objective>Objetivo</button>
      <details class="route-brief__more"><summary>Mais</summary><div>
        <button type="button" data-route-reload>Reabrir</button>
        <button type="button" data-route-safe>${settings.force2d ? 'Ativar 3D' : 'Usar 2D'}</button>
        <button type="button" data-route-labs>Laboratórios</button>
      </div></details>
    </div>
    <section class="route-brief__objective" data-route-objective-panel hidden>
      <div><span>Pergunta central</span><strong>${meta.learningQuestion || meta.objective}</strong></div>
      <ol>${meta.steps.map((step) => `<li>${step}</li>`).join('')}</ol>
      <p>${meta.controls}</p>
      <button type="button" data-route-guide>Abrir roteiro completo</button>
    </section>`;
  const objectivePanel = brief.querySelector('[data-route-objective-panel]');
  brief.querySelector('[data-route-objective]').addEventListener('click', () => { objectivePanel.hidden = !objectivePanel.hidden; });
  brief.querySelector('[data-route-guide]').addEventListener('click', () => callbacks.openGuide?.());
  brief.querySelector('[data-route-reload]').addEventListener('click', () => callbacks.reloadRoute?.());
  brief.querySelector('[data-route-safe]').addEventListener('click', () => callbacks.setForce2d?.(!settings.force2d));
  brief.querySelector('[data-route-labs]').addEventListener('click', () => callbacks.openLabs?.());
}

export function mountExperienceWorkspace(view, routeName, {
  settings = {}, openGuide, reloadRoute, openLabs, setForce2d,
} = {}) {
  const config = ROUTE_LAYOUT[routeName];
  if (!config) return () => {};
  const section = view.querySelector(config.root);
  const brief = view.querySelector('[data-route-brief]');
  if (!section || !brief) return () => {};
  const meta = getLab(routeName);
  rebuildBrief(brief, meta, settings, { openGuide, reloadRoute, openLabs, setForce2d });
  section.classList.add('experience-route');
  section.dataset.experienceMode = settings.experienceMode || 'guided';
  const stage = section.querySelector(config.stage);
  const controls = section.querySelector(config.controls);
  stage?.setAttribute('data-experience-stage', 'true');
  controls?.setAttribute('data-experience-controls', 'true');
  const guided = (settings.experienceMode || 'guided') !== 'explore';
  const cardCleanups = classifyCards(section, controls, config, guided);
  const scenarioCleanup = setupScenarioPicker(section, config, brief.querySelector('[data-experience-scenario-slot]'));
  const summary = createSummary(section, meta);
  const viewButtons = [...brief.querySelectorAll('[data-experience-view]')];
  const media = window.matchMedia?.('(max-width: 820px)');
  const defaultView = settings.experienceMode === 'presentation' ? 'scene' : media?.matches ? 'scene' : 'overview';
  let currentView = defaultView;

  const applyView = (next) => {
    currentView = VIEW_LABELS[next] ? next : 'overview';
    section.dataset.experienceView = currentView;
    viewButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.experienceView === currentView)));
    summary.panel.hidden = currentView !== 'results';
    if (currentView === 'results') summary.update();
    stage?.scrollIntoView?.({ block: 'nearest', behavior: settings.reduceMotion ? 'auto' : 'smooth' });
  };
  const onView = (event) => applyView(event.currentTarget.dataset.experienceView);
  viewButtons.forEach((button) => button.addEventListener('click', onView));
  applyView(defaultView);

  return () => {
    viewButtons.forEach((button) => button.removeEventListener('click', onView));
    cardCleanups.forEach((cleanup) => cleanup());
    scenarioCleanup();
    summary.dispose();
    section.classList.remove('experience-route');
    delete section.dataset.experienceView;
    delete section.dataset.experienceMode;
  };
}

export const experienceRouteLayout = ROUTE_LAYOUT;
