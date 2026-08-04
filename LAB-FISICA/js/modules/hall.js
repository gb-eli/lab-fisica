import { getDeviceProfile, describeDevice } from '../diagnostics.js';
import { mountHall3D } from './hall3d.js';
import { icon } from '../ui/icons.js';
import { reportRuntimeIssue } from '../stability.js';
import { LAB_CATALOG } from '../labs/lab-catalog.js';

const portals = LAB_CATALOG.map((lab) => ({
  route: lab.route, title: lab.shortTitle, subtitle: lab.subtitle, icon: lab.icon, color: lab.color, active: true,
  level: lab.level, status: lab.status, description: lab.objective,
}));

function renderSectorButtons(className = '') {
  return portals.map((portal, index) => `
    <button class="hall-map-sector ${className}" data-hall-sector="${index}" style="--sector-color:#${portal.color.toString(16).padStart(6, '0')}" aria-label="Ir ao setor ${portal.title}">
      <span class="hall-map-sector__icon">${icon(portal.icon, 'ui-icon')}</span>
      <span><b>${portal.title}</b><small>${portal.status}</small></span>
    </button>`).join('');
}

export function renderHall(root, { navigate, getSettings }) {
  const section = document.createElement('section');
  section.className = 'hall hall--premium hall--recovered hall--r2';
  section.innerHTML = `
    <div class="hero-scene hall-stage hall-stage--premium" data-hall-stage aria-label="Hall Científico 360. Escolha um setor no mapa ou na lista.">
      <div class="hall-fallback hall-fallback--premium" aria-hidden="true">
        <div class="hall-fallback__architecture"></div><div class="hall-core"></div><div class="fallback-portals"></div>
      </div>
      <div class="hall-label-layer" data-hall-labels></div>
      <div class="hall-objective-chip"><span>COMECE AQUI</span><strong>1. Escolha uma área · 2. Leia o objetivo · 3. Abra o laboratório</strong></div>
      <div class="hall-view-controls" aria-label="Controles principais do Hall">
        <button data-hall-map data-icon="map" aria-expanded="false"><span class="icon-slot"></span><span class="hall-control-label">Laboratórios</span></button>
        <button data-hall-walk data-icon="walk" aria-pressed="false"><span class="icon-slot"></span><span class="hall-control-label">Passeio</span></button>
        <button data-hall-reset data-icon="reset"><span class="icon-slot"></span><span class="hall-control-label">Recentrar</span></button>
        <button data-hall-fullscreen data-icon="fullscreen"><span class="icon-slot"></span><span class="hall-control-label">Tela cheia</span></button>
        <button data-hall-auto data-icon="camera" aria-pressed="false" hidden><span class="icon-slot"></span><span class="hall-control-label">Câmera automática</span></button>
        <button data-hall-audio data-icon="audio" aria-pressed="false" hidden><span class="icon-slot"></span><span class="hall-control-label">Áudio</span></button>
      </div>
      <div class="hall-engine-status" data-hall-status role="status">Preparando Hall…</div>
      <section class="hall-map-panel" data-hall-map-panel hidden aria-label="Lista de laboratórios">
        <header><div><span>Navegação direta</span><strong>Escolha um laboratório</strong></div><button data-hall-map aria-label="Fechar lista">×</button></header>
        <div class="hall-map-list">${renderSectorButtons()}</div>
      </section>
      <article class="hall-sector-brief" data-hall-sector-brief hidden>
        <div class="hall-sector-brief__icon" data-sector-icon></div>
        <div class="hall-sector-brief__copy"><span data-sector-level></span><strong data-sector-title></strong><p data-sector-description></p><small data-sector-status></small></div>
        <button class="primary" data-hall-enter-sector data-icon="teleport"><span class="icon-slot"></span><span data-sector-action>Abrir laboratório</span></button>
      </article>
      <div class="hall-guided-controls" aria-label="Setores do passeio" hidden>
        <button data-hall-prev data-icon="previous" aria-label="Setor anterior"><span class="icon-slot"></span></button>
        <output data-hall-guided-label>Visão geral</output>
        <button data-hall-next data-icon="next" aria-label="Próximo setor"><span class="icon-slot"></span></button>
      </div>
    </div>
    <aside class="hall-side hall-side--premium hall-side--recovered">
      <article class="glass-card hall-overview-card">
        <span class="badge badge--blue">Versão 0.4.5 · playtest e estabilidade</span>
        <h1>Onde você quer começar?</h1>
        <p>Use a trilha recomendada ou abra a lista completa. O Hall serve somente para orientar; cada laboratório abre em uma tela própria.</p>
      </article>
      <article class="glass-card hall-start-path">
        <div class="card-title-row"><div><small>TRILHA RECOMENDADA</small><h2>Fundamentos para circuitos</h2></div></div>
        <ol>
          <li><button data-open="coulomb"><span>1</span><div><b>Eletrostática</b><small>Entenda força, campo e potencial.</small></div></button></li>
          <li><button data-open="ohm"><span>2</span><div><b>Eletricidade</b><small>Monte e meça circuitos com segurança.</small></div></button></li>
          <li><button data-open="magnetism"><span>3</span><div><b>Eletromagnetismo</b><small>Relacione corrente, campo e máquinas.</small></div></button></li>
        </ol>
      </article>
      <article class="glass-card hall-choice-card">
        <button class="primary" data-open="coulomb" data-icon="coulomb"><span class="icon-slot"></span><span><b>Começar pela Eletrostática</b><small>Experiência guiada de 25 minutos</small></span></button>
        <button data-open="roadmap" data-icon="roadmap"><span class="icon-slot"></span><span><b>Ver todos os laboratórios</b><small>Filtrar por conteúdo e nível</small></span></button>
      </article>
      <details class="glass-card hall-accessible-map">
        <summary>Controles do Hall e alternativa 2D</summary>
        <p>Arraste para girar e use roda ou pinça para aproximar. A navegação textual funciona mesmo sem WebGL.</p>
        <div class="hall-compact-lab-list">${portals.map((portal) => `<button data-open="${portal.route}">${portal.title}</button>`).join('')}</div>
      </details>
    </aside>`;

  const fallback = section.querySelector('.fallback-portals');
  portals.forEach((portal, index) => {
    const ring = document.createElement('div');
    ring.className = 'portal-ring';
    ring.style.setProperty('--rot', `${index * (360 / portals.length)}deg`);
    ring.innerHTML = `<button class="portal" data-open="${portal.route}"><b>${icon(portal.icon, 'ui-icon')} ${portal.title}</b><small>${portal.subtitle}</small></button>`;
    fallback.append(ring);
  });

  const sectorBrief = section.querySelector('[data-hall-sector-brief]');
  const guidedLabel = section.querySelector('[data-hall-guided-label]');
  function updateSectorBrief(portal, index) {
    if (!portal || index < 0) { sectorBrief.hidden = true; guidedLabel.textContent = 'Visão geral'; return; }
    sectorBrief.hidden = false;
    sectorBrief.style.setProperty('--sector-color', `#${portal.color.toString(16).padStart(6, '0')}`);
    section.querySelector('[data-sector-icon]').innerHTML = icon(portal.icon, 'ui-icon');
    section.querySelector('[data-sector-title]').textContent = portal.title;
    section.querySelector('[data-sector-description]').textContent = portal.description;
    section.querySelector('[data-sector-status]').textContent = portal.status;
    section.querySelector('[data-sector-level]').textContent = portal.level;
    section.querySelector('[data-sector-action]').textContent = 'Abrir laboratório';
    guidedLabel.textContent = `${index + 1} de ${portals.length} · ${portal.title}`;
  }

  section.addEventListener('click', (event) => {
    const direct = event.target.closest('[data-open]');
    if (direct) { navigate(direct.dataset.open); return; }
    const sectorTrigger = event.target.closest('[data-hall-sector]');
    const stage = section.querySelector('[data-hall-stage]');
    if (sectorTrigger && !stage.classList.contains('is-webgl')) {
      const portal = portals[Number(sectorTrigger.dataset.hallSector)];
      if (portal) navigate(portal.route);
    }
  });

  root.append(section);
  let cleanup3d = () => {};
  let disposed = false;
  mountHall3D({
    container: section.querySelector('[data-hall-stage]'), labelsLayer: section.querySelector('[data-hall-labels]'), portals, navigate,
    statusElement: section.querySelector('[data-hall-status]'), getSettings, onSectorChange: updateSectorBrief, controlsRoot: section,
  }).then((cleanup) => { if (disposed) cleanup(); else cleanup3d = cleanup; }).catch((error) => {
    if (disposed) return;
    section.querySelector('[data-hall-status]').textContent = 'Lista 2D ativa · Hall 3D indisponível.';
    reportRuntimeIssue(error, { label: 'Hall em modo 2D', source: 'hall3d' });
  });
  return () => { disposed = true; cleanup3d(); };
}
