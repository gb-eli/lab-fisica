import { renderUsageValidation, loadUsageValidationMatrix, summarizeUsageValidation } from './usage-validation.js';

export const PROGRESS_KEY = 'fisica-imersiva-360.learning-progress.v1';

function checkpoints(scene, parameters, analysis, conclusion) {
  return [
    { id: 'scene', label: scene, trigger: 'scene', hint: 'Gire, aproxime, arraste ou toque na área da experiência.' },
    { id: 'parameters', label: parameters, trigger: 'parameters', hint: 'Altere pelo menos um controle científico e observe a resposta.' },
    { id: 'analysis', label: analysis, trigger: 'action', hint: 'Use uma validação, prática, comparação, gráfico ou instrumento antes de confirmar.' },
    { id: 'conclusion', label: conclusion, trigger: 'conclusion', hint: 'Escreva uma conclusão com pelo menos 20 caracteres.' },
  ];
}

export const LAB_GUIDES = {
  hall: {
    title: 'Orientação no Hall Científico', shortTitle: 'Hall',
    objective: 'Reconhecer os setores da plataforma e escolher o laboratório adequado para a investigação.',
    simplified: 'Explore o Hall, abra um portal e escolha o laboratório que combina com sua pergunta.',
    checkpoints: [
      { id: 'scene', label: 'Explorar o Hall em 360°', trigger: 'scene', hint: 'Arraste a cena ou use a barra de câmera.' },
      { id: 'parameters', label: 'Abrir ou destacar um setor', trigger: 'navigation', hint: 'Toque em um portal, mapa ou botão de setor.' },
      { id: 'analysis', label: 'Identificar a área de Física adequada', trigger: 'manual', hint: 'Compare os nomes e objetivos dos setores e confirme esta etapa.' },
      { id: 'conclusion', label: 'Registrar um plano de exploração', trigger: 'conclusion', hint: 'Escreva qual laboratório pretende utilizar e por quê.' },
    ],
  },
  coulomb: { title: 'Investigação de Coulomb', shortTitle: 'Coulomb', objective: 'Relacionar sinal, intensidade e distância das cargas com força, campo e potencial elétrico.', simplified: 'Mova as cargas, altere seus valores e observe como força, campo e potencial mudam.', checkpoints: checkpoints('Mover uma carga ou a sonda', 'Alterar cargas ou massa dinâmica', 'Comparar força, campo e potencial', 'Explicar o efeito do sinal e da distância') },
  ohm: { title: 'Circuitos e instrumentação', shortTitle: 'Ohm', objective: 'Montar, medir e diagnosticar circuitos série, paralelo e mistos com instrumentos e proteções.', simplified: 'Monte um circuito, mude resistores, faça uma medição e explique o resultado.', checkpoints: checkpoints('Inspecionar a bancada em 360°', 'Alterar topologia, fonte ou resistores', 'Validar montagem e medidas', 'Explicar corrente, tensão e proteção') },
  magnetism: { title: 'Eletromagnetismo e máquinas', shortTitle: 'Magnetismo', objective: 'Relacionar corrente, campo, fluxo e movimento em ímãs, bobinas, motores, geradores e transformadores.', simplified: 'Mude corrente, bobina ou movimento e veja o campo e a energia responderem.', checkpoints: checkpoints('Explorar ímãs ou máquinas em 360°', 'Alterar um parâmetro eletromagnético', 'Comparar campo, fluxo ou potência', 'Explicar causa e efeito observados') },
  energy: { title: 'Energia, casa e rede', shortTitle: 'Energia', objective: 'Analisar consumo, proteção, geração distribuída, armazenamento e perdas em uma rede elétrica.', simplified: 'Ligue cargas, observe o consumo e compare geração, bateria e rede.', checkpoints: checkpoints('Inspecionar casa, quadro ou rede', 'Alterar cargas, geração ou proteção', 'Comparar consumo, custo e perdas', 'Propor uma decisão energética segura') },
  mechanics: { title: 'Mecânica e gravidade', shortTitle: 'Mecânica', objective: 'Investigar forças, movimento, energia, colisões, oscilações e gravidade por medições e gráficos.', simplified: 'Mude massa, força ou gravidade e compare movimento, energia e gráficos.', checkpoints: checkpoints('Acompanhar um movimento em 360°', 'Alterar força, massa, atrito ou gravidade', 'Comparar vetores, energia ou momento', 'Explicar o movimento observado') },
  waves: { title: 'Ondas, som e óptica', shortTitle: 'Ondas', objective: 'Relacionar frequência, comprimento de onda, interferência, acústica e propagação da luz.', simplified: 'Mude frequência, meio ou geometria e observe ondas, som ou luz.', checkpoints: checkpoints('Explorar frentes de onda ou raios', 'Alterar frequência, meio ou geometria', 'Comparar gráfico, padrão ou leitura', 'Explicar o fenômeno de onda ou luz') },
  thermal: { title: 'Termologia, gases e fluidos', shortTitle: 'Termofluidos', objective: 'Analisar transferência de energia, gases, pressão, empuxo, escoamento e máquinas térmicas.', simplified: 'Mude temperatura, pressão ou vazão e observe calor, fluido e energia.', checkpoints: checkpoints('Inspecionar partículas, fluidos ou máquinas', 'Alterar temperatura, pressão ou vazão', 'Comparar energia, pressão ou eficiência', 'Explicar o balanço físico observado') },
  advanced: { title: 'Física Avançada', shortTitle: 'Avançada', objective: 'Explorar modelos declarados de quântica, relatividade, gravitação, matéria escura e causalidade.', simplified: 'Escolha um observatório, altere parâmetros e interprete o modelo com seus limites.', checkpoints: checkpoints('Explorar um observatório em 360°', 'Alterar parâmetros do modelo', 'Comparar leitura, gráfico e limitação', 'Registrar interpretação sem extrapolar o modelo') },
  roadmap: {
    title: 'Planejamento dos módulos', shortTitle: 'Módulos', objective: 'Reconhecer o estado real dos módulos e planejar uma sequência de aprendizagem.', simplified: 'Veja o que está pronto, escolha uma sequência e escreva seu plano.',
    checkpoints: [
      { id: 'scene', label: 'Percorrer a lista de módulos', trigger: 'scene', hint: 'Role e examine os cartões de módulos.' },
      { id: 'parameters', label: 'Abrir um módulo pelo roteiro', trigger: 'navigation', hint: 'Escolha um laboratório disponível.' },
      { id: 'analysis', label: 'Organizar uma sequência de estudo', trigger: 'manual', hint: 'Considere pré-requisitos e confirme esta etapa.' },
      { id: 'conclusion', label: 'Registrar o próximo passo', trigger: 'conclusion', hint: 'Escreva qual módulo será estudado e com qual objetivo.' },
    ],
  },
};

function safeParse(raw, fallback) { try { return JSON.parse(raw); } catch { return fallback; } }
function nowIso() { return new Date().toISOString(); }

export function createEmptyProgress() {
  return { version: 1, createdAt: nowIso(), updatedAt: nowIso(), routes: {} };
}

function createRouteProgress() {
  return { checkpoints: {}, conclusion: '', activeSeconds: 0, lastOpenedAt: null, completedAt: null, tutorialSeen: false };
}

export function normalizeLearningProgress(raw) {
  const source = raw && typeof raw === 'object' ? raw : createEmptyProgress();
  const result = { version: 1, createdAt: source.createdAt || nowIso(), updatedAt: source.updatedAt || nowIso(), routes: {} };
  Object.keys(LAB_GUIDES).forEach((route) => {
    const value = source.routes?.[route] || {};
    result.routes[route] = {
      ...createRouteProgress(), ...value,
      checkpoints: value.checkpoints && typeof value.checkpoints === 'object' ? value.checkpoints : {},
      conclusion: String(value.conclusion || '').slice(0, 4000),
      activeSeconds: Math.max(0, Number(value.activeSeconds) || 0),
    };
  });
  return result;
}

export function computeProgressSummary(progress) {
  const normalized = normalizeLearningProgress(progress);
  let completed = 0; let total = 0; let completedRoutes = 0;
  Object.entries(LAB_GUIDES).forEach(([route, guide]) => {
    const routeProgress = normalized.routes[route];
    const routeCompleted = guide.checkpoints.filter((checkpoint) => routeProgress.checkpoints[checkpoint.id]?.done).length;
    completed += routeCompleted; total += guide.checkpoints.length;
    if (routeCompleted === guide.checkpoints.length) completedRoutes += 1;
  });
  return { completed, total, percentage: total ? Math.round((completed / total) * 100) : 0, completedRoutes, totalRoutes: Object.keys(LAB_GUIDES).length };
}

export function buildLearningEvidence(progress, { route = null, settings = {}, usageValidation = [] } = {}) {
  const normalized = normalizeLearningProgress(progress);
  const routes = route && LAB_GUIDES[route] ? { [route]: normalized.routes[route] } : normalized.routes;
  return {
    platform: 'Física Imersiva 360', version: '0.4.5', generatedAt: nowIso(), route,
    summary: computeProgressSummary(normalized), routes,
    accessibility: {
      reduceMotion: !!settings.reduceMotion, highContrast: !!settings.highContrast,
      simplifiedInstructions: !!settings.simplifiedInstructions, largeTouchTargets: !!settings.largeTouchTargets,
      strongFocus: settings.strongFocus !== false, persistentLabels: !!settings.persistentLabels,
    },
    usageValidationSummary: summarizeUsageValidation(usageValidation),
  };
}

function formatSeconds(seconds) {
  const minutes = Math.floor(seconds / 60); const remaining = seconds % 60;
  return minutes ? `${minutes} min ${remaining.toString().padStart(2, '0')} s` : `${remaining} s`;
}

function downloadJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const anchor = Object.assign(document.createElement('a'), { href: url, download: filename });
  anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function isSceneTarget(target) {
  return Boolean(target?.closest?.('canvas,.hero-scene,[class*="stage"],[class*="viewport"],[class*="webgl"],[class*="scene"]'));
}

function isMeaningfulAction(button) {
  if (!button) return false;
  const signature = `${[...button.attributes].map((item) => `${item.name}=${item.value}`).join(' ')} ${button.textContent || ''}`.toLowerCase();
  return /(validar|verificar|comparar|medir|exportar|salvar|evidência|prática|diagnóstico|calcular|executar)/.test(signature);
}

export class GuidedLearningController {
  constructor({ getSettings = () => ({}) } = {}) {
    this.getSettings = getSettings;
    this.progress = normalizeLearningProgress(typeof localStorage === 'undefined' ? null : safeParse(localStorage.getItem(PROGRESS_KEY) || 'null', null));
    this.currentRoute = 'hall'; this.currentRoot = null; this.cleanupRoute = null; this.interval = null; this.lastActivity = Date.now();
    this.tutorialIndex = 0; this.highlighted = null;
    this.createUi(); this.render();
  }

  createUi() {
    this.hud = document.createElement('aside'); this.hud.className = 'guided-hud'; this.hud.setAttribute('aria-label', 'Roteiro pedagógico');
    this.hud.innerHTML = `<button type="button" data-guide-open><span class="guided-hud__label">Roteiro</span><strong data-guide-hud-title>Hall</strong><span class="guided-hud__progress"><i data-guide-hud-bar></i></span><small data-guide-hud-count>0/4</small></button>`;
    document.querySelector('#app')?.append(this.hud);

    this.dialog = document.createElement('dialog'); this.dialog.className = 'modal pedagogy-dialog'; this.dialog.id = 'pedagogy-dialog';
    this.dialog.innerHTML = `<form method="dialog" class="modal__card modal__card--pedagogy">
      <div class="modal__head"><div><small>Aprendizagem guiada</small><h2 data-guide-dialog-title>Roteiro</h2></div><button aria-label="Fechar">×</button></div>
      <div class="pedagogy-tabs" role="tablist"><button type="button" role="tab" aria-selected="true" data-pedagogy-tab="route">Roteiro atual</button><button type="button" role="tab" aria-selected="false" data-pedagogy-tab="progress">Progresso geral</button><button type="button" role="tab" aria-selected="false" data-pedagogy-tab="validation">Validação de uso</button></div>
      <section data-pedagogy-panel="route">
        <div class="guided-objective"><span>Objetivo</span><p data-guide-objective></p><div class="guided-objective__actions"><button type="button" data-guide-speak>Ler objetivo</button><button type="button" data-guide-tutorial>Iniciar tutorial</button></div></div>
        <div class="guided-route-meta"><span data-guide-time>Tempo ativo: 0 s</span><span data-guide-route-progress>0/4 etapas</span></div>
        <ol class="guided-checklist" data-guide-checklist></ol>
        <label class="guided-conclusion">Conclusão da investigação<textarea data-guide-conclusion minlength="20" maxlength="4000" placeholder="Explique o que mudou, qual relação física foi observada e qual evidência sustenta sua conclusão."></textarea><small data-guide-conclusion-count>0/20 caracteres mínimos</small></label>
        <div class="guided-actions"><button type="button" data-guide-confirm>Confirmar etapa de análise</button><button type="button" data-guide-export>Exportar evidência</button><button type="button" data-guide-reset>Reiniciar roteiro</button></div>
        <output class="guided-feedback" data-guide-feedback aria-live="polite"></output>
      </section>
      <section data-pedagogy-panel="progress" hidden><div data-guide-overall></div></section>
      <section data-pedagogy-panel="validation" hidden><div class="usage-validation" data-usage-validation></div></section>
    </form>`;
    document.body.append(this.dialog);

    this.tutorial = document.createElement('dialog'); this.tutorial.className = 'tutorial-dialog';
    this.tutorial.innerHTML = `<div class="tutorial-card" role="document"><span class="tutorial-card__step" data-tutorial-step>1/3</span><h2 data-tutorial-title>Tutorial</h2><p data-tutorial-text></p><div class="tutorial-card__actions"><button type="button" data-tutorial-skip>Pular</button><button type="button" data-tutorial-prev>Anterior</button><button type="button" data-tutorial-next>Próximo</button></div></div>`;
    document.body.append(this.tutorial);

    this.usageValidation = renderUsageValidation(this.dialog.querySelector('[data-usage-validation]'), { currentRoute: this.currentRoute });
    this.hud.querySelector('[data-guide-open]').addEventListener('click', () => this.openProgress());
    this.dialog.querySelector('[data-guide-tutorial]').addEventListener('click', () => this.startTutorial());
    this.dialog.querySelector('[data-guide-speak]').addEventListener('click', () => this.speakObjective());
    this.dialog.querySelector('[data-guide-confirm]').addEventListener('click', () => { this.markCheckpoint('analysis', 'manual'); this.feedback('Etapa de análise confirmada. Registre agora sua conclusão.'); });
    this.dialog.querySelector('[data-guide-export]').addEventListener('click', () => this.exportEvidence(this.currentRoute));
    this.dialog.querySelector('[data-guide-reset]').addEventListener('click', () => this.resetRoute(this.currentRoute));
    this.dialog.querySelector('[data-guide-conclusion]').addEventListener('input', (event) => this.setConclusion(event.target.value));
    this.dialog.querySelectorAll('[data-pedagogy-tab]').forEach((button) => button.addEventListener('click', () => this.selectTab(button.dataset.pedagogyTab)));
    this.tutorial.querySelector('[data-tutorial-skip]').addEventListener('click', () => this.finishTutorial());
    this.tutorial.querySelector('[data-tutorial-prev]').addEventListener('click', () => { this.tutorialIndex = Math.max(0, this.tutorialIndex - 1); this.renderTutorialStep(); });
    this.tutorial.querySelector('[data-tutorial-next]').addEventListener('click', () => { if (this.tutorialIndex >= 2) this.finishTutorial(); else { this.tutorialIndex += 1; this.renderTutorialStep(); } });
    this.tutorial.addEventListener('close', () => this.clearHighlight());
  }

  save() {
    this.progress.updatedAt = nowIso();
    if (typeof localStorage !== 'undefined') localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.progress));
    window.dispatchEvent(new CustomEvent('fisica:learning-progress', { detail: computeProgressSummary(this.progress) }));
  }

  routeProgress(route = this.currentRoute) {
    if (!this.progress.routes[route]) this.progress.routes[route] = createRouteProgress();
    return this.progress.routes[route];
  }

  attachRoute(route, root) {
    this.detachRoute(); this.currentRoute = LAB_GUIDES[route] ? route : 'hall'; this.currentRoot = root;
    const routeProgress = this.routeProgress(); routeProgress.lastOpenedAt = nowIso(); this.lastActivity = Date.now(); this.save();
    const activity = () => { this.lastActivity = Date.now(); };
    const pointer = (event) => { activity(); if (isSceneTarget(event.target)) this.markByTrigger('scene'); };
    const wheel = (event) => { activity(); if (isSceneTarget(event.target)) this.markByTrigger('scene'); };
    const change = (event) => { activity(); if (event.target.closest('[data-guide-conclusion]')) return; if (event.target.matches('input,select')) this.markByTrigger('parameters'); };
    const click = (event) => {
      activity(); const navigation = event.target.closest('[data-open],[data-route],[data-hall-sector]');
      if (navigation) this.markByTrigger('navigation');
      const button = event.target.closest('button'); if (isMeaningfulAction(button)) this.markByTrigger('action');
    };
    root.addEventListener('pointerdown', pointer, true); root.addEventListener('wheel', wheel, { passive: true, capture: true }); root.addEventListener('input', change, true); root.addEventListener('change', change, true); root.addEventListener('click', click, true);
    this.cleanupRoute = () => { root.removeEventListener('pointerdown', pointer, true); root.removeEventListener('wheel', wheel, true); root.removeEventListener('input', change, true); root.removeEventListener('change', change, true); root.removeEventListener('click', click, true); };
    this.interval = setInterval(() => { if (!document.hidden && Date.now() - this.lastActivity < 90000) { const activeProgress = this.routeProgress(); activeProgress.activeSeconds += 5; this.save(); this.render(); } }, 5000);
    this.usageValidation?.setRoute(this.currentRoute); this.render();
    const settings = this.getSettings();
    if (settings.tutorialAutoStart !== false && !routeProgress.tutorialSeen) setTimeout(() => this.startTutorial(), 450);
  }

  detachRoute() { this.cleanupRoute?.(); this.cleanupRoute = null; if (this.interval) clearInterval(this.interval); this.interval = null; this.clearHighlight(); }

  markByTrigger(trigger) {
    const guide = LAB_GUIDES[this.currentRoute]; const checkpoint = guide.checkpoints.find((item) => item.trigger === trigger && !this.routeProgress().checkpoints[item.id]?.done);
    if (checkpoint) this.markCheckpoint(checkpoint.id, trigger);
  }

  markCheckpoint(id, source = 'manual') {
    const guide = LAB_GUIDES[this.currentRoute]; if (!guide.checkpoints.some((item) => item.id === id)) return;
    const progress = this.routeProgress(); if (progress.checkpoints[id]?.done) return;
    progress.checkpoints[id] = { done: true, at: nowIso(), source };
    const completed = guide.checkpoints.every((item) => progress.checkpoints[item.id]?.done);
    progress.completedAt = completed ? (progress.completedAt || nowIso()) : null;
    this.save(); this.render();
  }

  setConclusion(value) {
    const progress = this.routeProgress(); progress.conclusion = String(value).slice(0, 4000);
    if (progress.conclusion.trim().length >= 20) {
      if (progress.checkpoints.conclusion?.done) { this.save(); this.render(); }
      else this.markCheckpoint('conclusion', 'text');
    } else { delete progress.checkpoints.conclusion; progress.completedAt = null; this.save(); this.render(); }
  }

  resetRoute(route) {
    if (!confirm('Reiniciar apenas o roteiro pedagógico deste laboratório? A configuração científica do laboratório não será apagada.')) return;
    this.progress.routes[route] = createRouteProgress(); this.save(); this.render(); this.feedback('Roteiro reiniciado.');
  }

  resetAll() { this.progress = normalizeLearningProgress(null); this.save(); this.render(); }

  reload() { this.progress = normalizeLearningProgress(typeof localStorage === 'undefined' ? null : safeParse(localStorage.getItem(PROGRESS_KEY) || 'null', null)); this.render(); }

  feedback(message) { const output = this.dialog.querySelector('[data-guide-feedback]'); if (output) output.textContent = message; }

  selectTab(name) {
    this.dialog.querySelectorAll('[data-pedagogy-tab]').forEach((button) => button.setAttribute('aria-selected', String(button.dataset.pedagogyTab === name)));
    this.dialog.querySelectorAll('[data-pedagogy-panel]').forEach((panel) => { panel.hidden = panel.dataset.pedagogyPanel !== name; });
    if (name === 'validation') this.usageValidation?.refresh();
  }

  openProgress(tab = 'route') { this.selectTab(tab); this.render(); if (!this.dialog.open) this.dialog.showModal(); }

  speakObjective() {
    const guide = LAB_GUIDES[this.currentRoute]; const text = this.getSettings().simplifiedInstructions ? guide.simplified : guide.objective;
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') { this.feedback('A leitura por voz não está disponível neste navegador.'); return; }
    speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'pt-BR'; utterance.rate = 0.95; speechSynthesis.speak(utterance);
  }

  tutorialSteps() {
    const guide = LAB_GUIDES[this.currentRoute];
    return [
      { title: 'Objetivo da investigação', text: this.getSettings().simplifiedInstructions ? guide.simplified : guide.objective, selector: 'h1' },
      { title: 'Explore o ambiente', text: 'Use a câmera 360°, o zoom ou a interação direta para observar a experiência antes de alterar os parâmetros.', selector: 'canvas,.hero-scene,[class*="stage"],[class*="viewport"],[class*="webgl"]' },
      { title: 'Teste, compare e conclua', text: 'Altere um parâmetro, compare as leituras e registre uma conclusão baseada na evidência mostrada.', selector: 'input,select,.control-card,.glass-card' },
    ];
  }

  startTutorial() { this.tutorialIndex = 0; if (!this.tutorial.open) this.tutorial.showModal(); this.renderTutorialStep(); }

  renderTutorialStep() {
    const steps = this.tutorialSteps(); const step = steps[this.tutorialIndex];
    this.tutorial.querySelector('[data-tutorial-step]').textContent = `${this.tutorialIndex + 1}/${steps.length}`;
    this.tutorial.querySelector('[data-tutorial-title]').textContent = step.title;
    this.tutorial.querySelector('[data-tutorial-text]').textContent = step.text;
    this.tutorial.querySelector('[data-tutorial-prev]').disabled = this.tutorialIndex === 0;
    this.tutorial.querySelector('[data-tutorial-next]').textContent = this.tutorialIndex === steps.length - 1 ? 'Concluir' : 'Próximo';
    this.clearHighlight(); const target = this.currentRoot?.querySelector(step.selector);
    if (target) { this.highlighted = target; target.classList.add('guided-highlight'); target.scrollIntoView({ block: 'center', behavior: this.getSettings().reduceMotion ? 'auto' : 'smooth' }); }
  }

  finishTutorial() { const progress = this.routeProgress(); progress.tutorialSeen = true; this.save(); this.clearHighlight(); this.tutorial.close(); this.render(); }
  clearHighlight() { this.highlighted?.classList.remove('guided-highlight'); this.highlighted = null; }

  exportEvidence(route = null) {
    const evidence = buildLearningEvidence(this.progress, { route, settings: this.getSettings(), usageValidation: loadUsageValidationMatrix() });
    downloadJson(evidence, `fisica-imersiva-evidencia-${route || 'geral'}-${new Date().toISOString().slice(0, 10)}.json`);
    this.feedback('Evidência exportada em JSON.');
  }

  renderOverall() {
    const root = this.dialog.querySelector('[data-guide-overall]'); const summary = computeProgressSummary(this.progress);
    root.innerHTML = `<div class="guided-overall__summary"><span>Progresso geral</span><strong>${summary.percentage}%</strong><small>${summary.completedRoutes}/${summary.totalRoutes} roteiros completos</small><div class="guided-overall__bar"><i style="width:${summary.percentage}%"></i></div></div><div class="guided-overall__routes"></div><div class="guided-overall__actions"><button type="button" data-guide-export-all>Exportar progresso geral</button></div>`;
    const routesRoot = root.querySelector('.guided-overall__routes');
    Object.entries(LAB_GUIDES).forEach(([route, guide]) => {
      const routeProgress = this.progress.routes[route]; const done = guide.checkpoints.filter((item) => routeProgress.checkpoints[item.id]?.done).length;
      const card = document.createElement('div'); card.className = 'guided-overall__route'; card.innerHTML = `<span>${guide.shortTitle}</span><strong>${done}/${guide.checkpoints.length}</strong><small>${formatSeconds(routeProgress.activeSeconds)}</small>`; routesRoot.append(card);
    });
    root.querySelector('[data-guide-export-all]').addEventListener('click', () => this.exportEvidence(null));
  }

  render() {
    const guide = LAB_GUIDES[this.currentRoute] || LAB_GUIDES.hall; const routeProgress = this.routeProgress();
    const done = guide.checkpoints.filter((item) => routeProgress.checkpoints[item.id]?.done).length; const percent = Math.round((done / guide.checkpoints.length) * 100);
    this.hud.querySelector('[data-guide-hud-title]').textContent = guide.shortTitle;
    this.hud.querySelector('[data-guide-hud-count]').textContent = `${done}/${guide.checkpoints.length}`;
    this.hud.querySelector('[data-guide-hud-bar]').style.width = `${percent}%`;
    const topbarLabel = document.querySelector('[data-global-progress]'); if (topbarLabel) topbarLabel.textContent = `${computeProgressSummary(this.progress).percentage}%`;
    this.dialog.querySelector('[data-guide-dialog-title]').textContent = guide.title;
    this.dialog.querySelector('[data-guide-objective]').textContent = this.getSettings().simplifiedInstructions ? guide.simplified : guide.objective;
    this.dialog.querySelector('[data-guide-time]').textContent = `Tempo ativo: ${formatSeconds(routeProgress.activeSeconds)}`;
    this.dialog.querySelector('[data-guide-route-progress]').textContent = `${done}/${guide.checkpoints.length} etapas`;
    const checklist = this.dialog.querySelector('[data-guide-checklist]'); checklist.replaceChildren(...guide.checkpoints.map((checkpoint) => {
      const item = document.createElement('li'); const state = routeProgress.checkpoints[checkpoint.id]; item.dataset.done = String(Boolean(state?.done));
      item.innerHTML = `<span class="guided-checklist__mark" aria-hidden="true">${state?.done ? '✓' : '○'}</span><div><strong></strong><small></small></div>`;
      item.querySelector('strong').textContent = checkpoint.label; item.querySelector('small').textContent = state?.done ? `Concluída · ${checkpoint.trigger === 'manual' ? 'confirmação' : checkpoint.trigger}` : checkpoint.hint;
      if (checkpoint.trigger === 'manual' && !state?.done) { const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Confirmar'; button.addEventListener('click', () => this.markCheckpoint(checkpoint.id, 'manual')); item.append(button); }
      return item;
    }));
    const conclusion = this.dialog.querySelector('[data-guide-conclusion]'); if (conclusion.value !== routeProgress.conclusion) conclusion.value = routeProgress.conclusion;
    this.dialog.querySelector('[data-guide-conclusion-count]').textContent = `${routeProgress.conclusion.trim().length}/20 caracteres mínimos`;
    this.renderOverall();
  }
}
