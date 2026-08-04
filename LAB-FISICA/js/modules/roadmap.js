import { icon } from '../ui/icons.js';
import { LAB_CATALOG, getLearningPath } from '../labs/lab-catalog.js';

const CATEGORY_LABELS = Object.freeze({
  all: 'Todos', fundamentos: 'Fundamentos', eletricidade: 'Eletricidade', aplicada: 'Aplicada', avancada: 'Avançada',
});

function badgeFor(lab) {
  if (lab.route === 'coulomb') return '2D interativo';
  if (lab.route === 'advanced') return 'Modelo didático 3D + 2D';
  return '3D + modo 2D';
}

export function renderRoadmap(root, { navigate = () => {} } = {}) {
  const section = document.createElement('section');
  section.className = 'lab-hub lab-hub--organized';
  section.innerHTML = `
    <header class="lab-hub__head">
      <span class="badge">Mapa de aprendizagem · versão 0.4.5</span>
      <h1>Escolha pelo conteúdo e pela pergunta que deseja investigar</h1>
      <p>Os laboratórios estão organizados em uma sequência recomendada. Cada cartão informa objetivo, tempo sugerido, cenários e o que o aluno deve observar.</p>
    </header>
    <section class="learning-path" aria-label="Sequência recomendada">
      <div><span>Trilha recomendada</span><strong>Fundamentos → aplicações → aprofundamento</strong></div>
      <ol>${getLearningPath().map((lab) => `<li><button type="button" data-open-lab="${lab.route}"><span>${lab.order}</span>${lab.shortTitle}</button></li>`).join('')}</ol>
    </section>
    <div class="lab-hub__filters" aria-label="Filtrar laboratórios">
      ${Object.entries(CATEGORY_LABELS).map(([value, label], index) => `<button type="button" data-filter="${value}" aria-pressed="${index === 0}">${label}</button>`).join('')}
    </div>
    <div class="lab-hub__grid"></div>`;

  const grid = section.querySelector('.lab-hub__grid');
  LAB_CATALOG.forEach((lab) => {
    const card = document.createElement('article');
    card.className = 'lab-launch-card lab-launch-card--organized';
    card.dataset.category = lab.category;
    card.innerHTML = `
      <div class="lab-launch-card__icon">${icon(lab.icon, 'ui-icon')}</div>
      <div class="lab-launch-card__body">
        <div class="lab-launch-card__meta"><span class="status ready">${badgeFor(lab)}</span><span>${lab.estimatedMinutes} min</span><span>${lab.level}</span></div>
        <h2>${lab.shortTitle}</h2>
        <p class="lab-launch-card__question">${lab.learningQuestion}</p>
        <p>${lab.objective}</p>
        <div class="lab-launch-card__scenarios" aria-label="Cenários disponíveis">${lab.scenarios.map((scenario) => `<span>${scenario}</span>`).join('')}</div>
        <div class="lab-launch-card__steps">${lab.steps.map((step, index) => `<span>${index + 1}. ${step}</span>`).join('')}</div>
        <div class="lab-launch-card__actions">
          <button type="button" class="primary" data-open-lab="${lab.route}">Abrir laboratório</button>
          <button type="button" data-show-objective="${lab.route}" aria-expanded="false">Como usar</button>
        </div>
        <div class="lab-launch-card__controls" data-objective-copy="${lab.route}" hidden><strong>Controles essenciais</strong><p>${lab.controls}</p></div>
      </div>`;
    grid.append(card);
  });

  section.addEventListener('click', (event) => {
    const filter = event.target.closest('[data-filter]');
    if (filter) {
      const category = filter.dataset.filter;
      section.querySelectorAll('[data-filter]').forEach((button) => button.setAttribute('aria-pressed', String(button === filter)));
      section.querySelectorAll('.lab-launch-card').forEach((card) => { card.hidden = category !== 'all' && card.dataset.category !== category; });
      return;
    }
    const open = event.target.closest('[data-open-lab]');
    if (open) { navigate(open.dataset.openLab); return; }
    const controls = event.target.closest('[data-show-objective]');
    if (controls) {
      const copy = section.querySelector(`[data-objective-copy="${controls.dataset.showObjective}"]`);
      if (copy) {
        copy.hidden = !copy.hidden;
        controls.setAttribute('aria-expanded', String(!copy.hidden));
        controls.textContent = copy.hidden ? 'Como usar' : 'Ocultar';
      }
    }
  });

  root.append(section);
}
