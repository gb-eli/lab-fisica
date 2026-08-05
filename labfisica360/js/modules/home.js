import { LAB_CATALOG } from '../labs/lab-catalog.js';
import { icon } from '../ui/icons.js';
import { formatDuration, shiftLabel } from '../session/student-session.js';

function createPhysicsBackdrop(canvas, getSettings = () => ({})) {
  const ctx = canvas.getContext('2d', { alpha: true });
  let width = 1;
  let height = 1;
  let ratio = 1;
  let frame = 0;
  let running = true;
  let last = 0;
  const charges = [
    { x: 0.24, y: 0.34, sign: 1, phase: 0 },
    { x: 0.76, y: 0.62, sign: -1, phase: Math.PI },
  ];
  const particles = Array.from({ length: 22 }, (_, index) => ({
    angle: (index / 22) * Math.PI * 2,
    radius: 0.1 + (index % 7) * 0.025,
    speed: 0.08 + (index % 5) * 0.015,
    band: index % 3,
  }));

  function resize() {
    const rect = canvas.getBoundingClientRect();
    ratio = Math.min(devicePixelRatio || 1, 1.5);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawGrid() {
    ctx.strokeStyle = 'rgba(91, 210, 255, .065)';
    ctx.lineWidth = 1;
    const step = Math.max(34, Math.min(64, width / 18));
    for (let x = -step; x < width + step; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = -step; y < height + step; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
  }

  function drawField(time) {
    charges.forEach((charge, chargeIndex) => {
      const cx = charge.x * width;
      const cy = charge.y * height;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.24);
      gradient.addColorStop(0, charge.sign > 0 ? 'rgba(90,220,255,.24)' : 'rgba(149,112,255,.22)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath(); ctx.arc(cx, cy, Math.min(width, height) * 0.24, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = charge.sign > 0 ? 'rgba(105,229,255,.28)' : 'rgba(167,129,255,.26)';
      for (let ring = 1; ring <= 3; ring += 1) {
        ctx.beginPath();
        ctx.arc(cx, cy, (34 + ring * 29) * (1 + Math.sin(time * 0.0005 + ring + chargeIndex) * .035), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = charge.sign > 0 ? '#7be7ff' : '#b698ff';
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(235,251,255,.9)';
      ctx.font = '700 13px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(charge.sign > 0 ? '+' : '−', cx, cy + .5);
    });
  }

  function drawWave(time) {
    ctx.strokeStyle = 'rgba(96, 229, 189, .26)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 5) {
      const y = height * .76 + Math.sin(x * .022 - time * .0012) * 14 * Math.sin(Math.PI * x / Math.max(1, width));
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function drawParticles(time) {
    const centerX = width * .5;
    const centerY = height * .46;
    particles.forEach((particle, index) => {
      const angle = particle.angle + time * .001 * particle.speed;
      const scale = Math.min(width, height);
      const x = centerX + Math.cos(angle) * scale * (particle.radius + particle.band * .025);
      const y = centerY + Math.sin(angle * (1 + particle.band * .13)) * scale * particle.radius * .58;
      ctx.fillStyle = index % 2 ? 'rgba(103,220,255,.55)' : 'rgba(115,235,189,.5)';
      ctx.beginPath(); ctx.arc(x, y, 1.6 + (index % 3) * .45, 0, Math.PI * 2); ctx.fill();
    });
  }

  function draw(time) {
    frame = 0;
    if (!running) return;
    if (time - last < 32) { frame = requestAnimationFrame(draw); return; }
    last = time;
    ctx.clearRect(0, 0, width, height);
    drawGrid();
    drawField(time);
    drawWave(time);
    if (!getSettings().reduceMotion) drawParticles(time);
    frame = requestAnimationFrame(draw);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const onVisibility = () => {
    running = !document.hidden;
    if (running && !frame) frame = requestAnimationFrame(draw);
    if (!running) { cancelAnimationFrame(frame); frame = 0; }
  };
  document.addEventListener('visibilitychange', onVisibility);
  resize();
  frame = requestAnimationFrame(draw);
  return () => {
    running = false;
    cancelAnimationFrame(frame);
    observer.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.width = 1; canvas.height = 1;
  };
}

function sessionMarkup(snapshot) {
  if (!snapshot?.loggedIn) return `
    <span class="portal-session-card__eyebrow">Sessão local</span>
    <h2>Escolha como acessar</h2>
    <p>Explore sem salvar ou use nome, turma, turno e PIN local para registrar tempo, módulos e ações.</p>
    <div class="portal-session-card__choices"><button class="primary" type="button" data-home-session>Entrar e registrar</button><button type="button" data-home-labs>Continuar sem login</button></div>`;
  return `
    <span class="portal-session-card__eyebrow">Sessão ativa</span>
    <h2>${snapshot.profile.name}</h2>
    <p>${snapshot.profile.className} · ${shiftLabel(snapshot.profile.shift)} · ${snapshot.labs.length} laboratório(s) acessado(s)</p>
    <div class="portal-session-card__time"><span>Tempo ativo</span><strong>${formatDuration(snapshot.totalActiveSeconds)}</strong></div>
    <button type="button" data-home-session>Ver ou exportar sessão</button>`;
}

export function renderHome(root, { navigate = () => {}, getSettings = () => ({}), session, openSession = () => {}, openMentors = () => {}, setFreeMode = () => {} } = {}) {
  const section = document.createElement('section');
  section.className = 'physics-portal';
  section.innerHTML = `
    <header class="physics-portal__hero">
      <canvas class="physics-portal__backdrop" aria-hidden="true"></canvas>
      <div class="physics-portal__glow" aria-hidden="true"></div>
      <div class="physics-portal__hero-copy">
        <span class="badge">Física Imersiva 360 · laboratório aberto e adaptativo</span>
        <h1>Experimente a Física.<br><em>Observe, altere e descubra.</em></h1>
        <p>Uma plataforma aberta para aprender além do quadro: entre como visitante ou registre sua sessão, escolha um fenômeno e carregue somente o laboratório necessário.</p>
        <div class="physics-portal__hero-actions">
          <button class="primary" type="button" data-home-labs>${icon('roadmap', 'ui-icon')} Explorar laboratórios</button>
          <button type="button" data-home-hall>${icon('hall', 'ui-icon')} Abrir Hall 3D opcional</button>
        </div>
        <div class="physics-portal__metrics">
          <span><strong>${LAB_CATALOG.length}</strong> laboratórios</span>
          <span><strong>0</strong> cenas 3D no início</span>
          <span><strong>adaptativo</strong> ao poder do aparelho</span>
        </div>
      </div>
      <aside class="portal-session-card" data-home-session-card>${sessionMarkup(session?.getSnapshot())}</aside>
    </header>

    <section class="portal-learning" aria-labelledby="portal-learning-title">
      <header><span>Como você deseja explorar?</span><h2 id="portal-learning-title">Livre para investigar ou guiado por uma trilha histórica</h2></header>
      <div class="portal-learning__grid">
        <article class="portal-learning-card ${getSettings().learningMode !== 'mentor' ? 'is-active' : ''}">
          <span class="portal-learning-card__index">01</span><div><h3>Modo Livre</h3><p>Escolha qualquer laboratório, altere os controles e explore sem sequência obrigatória.</p></div>
          <button type="button" data-home-free>Usar modo livre</button>
        </article>
        <article class="portal-learning-card portal-learning-card--guided ${getSettings().learningMode === 'mentor' ? 'is-active' : ''}">
          <span class="portal-learning-card__index">02</span><div><h3>Modo Guiado por mentor</h3><p>Einstein, Newton ou Faraday conduzem etapas, acendem controles e registram checkpoints.</p></div>
          <button type="button" class="primary" data-home-mentors>${getSettings().mentorId ? 'Continuar trilha' : 'Escolher mentor'}</button>
        </article>
      </div>
      <p class="portal-learning__disclaimer">As trilhas são inspiradas na obra e no contexto histórico dessas personalidades; não simulam falas literais.</p>
    </section>

    <section class="portal-purpose" aria-label="Objetivo pedagógico do laboratório">
      <header><span>Aprender fazendo</span><h2>Da explicação da sala para uma experiência investigativa</h2></header>
      <div class="portal-purpose__grid">
        <article><strong>1</strong><h3>Observe</h3><p>Comece por um cenário seguro e identifique grandezas, instrumentos e fenômenos.</p></article>
        <article><strong>2</strong><h3>Experimente</h3><p>Altere uma variável por vez, monte circuitos, mova objetos e teste hipóteses.</p></article>
        <article><strong>3</strong><h3>Compare</h3><p>Acompanhe vetores, gráficos, medições e resultados científicos contextualizados.</p></article>
        <article><strong>4</strong><h3>Registre</h3><p>Quando solicitado, exporte tempo, laboratórios, ações e etapas da sessão.</p></article>
      </div>
    </section>

    <section class="physics-portal__section aria-labelledby="portal-labs-title">
      <header><div><span>Laboratórios disponíveis</span><h2 id="portal-labs-title">Escolha pela pergunta que deseja investigar</h2></div><button type="button" data-home-labs>Ver catálogo completo</button></header>
      <div class="physics-portal__lab-grid">
        ${LAB_CATALOG.map((lab) => `
          <article class="portal-lab-card" style="--lab-color:#${lab.color.toString(16).padStart(6, '0')}">
            <div class="portal-lab-card__icon">${icon(lab.icon, 'ui-icon')}</div>
            <div class="portal-lab-card__meta"><span>${lab.group}</span><small>${lab.estimatedMinutes} min</small></div>
            <h3>${lab.shortTitle}</h3>
            <p>${lab.learningQuestion}</p>
            <div class="portal-lab-card__load"><span>Carrega ao abrir</span><small>Interface · lógica · 3D · assets</small></div>
            <button type="button" data-open-lab="${lab.route}">Abrir laboratório</button>
          </article>`).join('')}
      </div>
    </section>

    <section class="physics-portal__architecture" aria-label="Como funciona o carregamento modular">
      <article><span>01</span><div><h3>Portal leve</h3><p>Somente navegação, sessão e animação 2D de baixo custo.</p></div></article>
      <article><span>02</span><div><h3>Escolha consciente</h3><p>O aluno lê objetivo, duração e pergunta antes de entrar.</p></div></article>
      <article><span>03</span><div><h3>Carga isolada</h3><p>CSS, lógica, Three.js e GLBs entram apenas para a rota escolhida.</p></div></article>
      <article><span>04</span><div><h3>Liberação ao sair</h3><p>Loops, listeners, canvases, materiais, texturas e estilos são desmontados.</p></div></article>
    </section>`;
  root.append(section);

  const disposeBackdrop = createPhysicsBackdrop(section.querySelector('canvas'), getSettings);
  const onClick = (event) => {
    const lab = event.target.closest('[data-open-lab]');
    if (lab) { navigate(lab.dataset.openLab); return; }
    if (event.target.closest('[data-home-labs]')) { navigate('roadmap'); return; }
    if (event.target.closest('[data-home-hall]')) { navigate('hall'); return; }
    if (event.target.closest('[data-home-session]')) { openSession(); return; }
    if (event.target.closest('[data-home-mentors]')) { openMentors(); return; }
    if (event.target.closest('[data-home-free]')) { setFreeMode(); return; }
  };
  section.addEventListener('click', onClick);
  const unsubscribe = session?.subscribe((snapshot) => {
    const card = section.querySelector('[data-home-session-card]');
    if (card) card.innerHTML = sessionMarkup(snapshot);
  }) || (() => {});

  return () => {
    unsubscribe();
    section.removeEventListener('click', onClick);
    disposeBackdrop();
  };
}
