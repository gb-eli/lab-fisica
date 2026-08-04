import {
  COULOMB_CONSTANT,
  pairInteraction,
  electricFieldAt,
  electricPotentialAt,
  normalizedToMeters,
} from '../science/electrostatics.js';
import { getQualityProfile } from '../quality.js';
import { saveExperiment, loadExperiment } from '../storage.js';
import { icon } from '../ui/icons.js';
import { mountCoulomb3D } from './coulomb3d.js';
import { reportRuntimeIssue } from '../stability.js';

const ARENA_METERS = 3;

function fmt(value, unit) {
  if (!Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if ((abs > 0 && abs < 0.001) || abs >= 10000) return `${value.toExponential(3)} ${unit}`;
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 4 })} ${unit}`;
}

function downloadJson(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function renderCoulomb(root, { getSettings = () => ({}) } = {}) {
  const shell = document.createElement('section');
  shell.className = 'module-shell';
  shell.innerHTML = `
    <header class="module-head module-head--focused">
      <div><span class="badge">Reconstrução R2 · experiência guiada</span><h1>Eletrostática 360°</h1><p>Observe como sinal e distância alteram força, campo e potencial. Comece por um cenário pronto e mude somente um parâmetro por vez.</p></div>
      <div class="module-head__mission"><small>PERGUNTA CENTRAL</small><strong>Como sinal e distância alteram a interação elétrica?</strong></div>
    </header>
    <div class="lab-grid lab-grid--priority coulomb-lab">
      <article class="sim-card coulomb-scene-card">
        <div class="sim-toolbar sim-toolbar--wrap coulomb-toolbar">
          <button data-action="play" data-icon="play" class="primary-action"><span class="icon-slot"></span><span>Executar</span></button>
          <button data-action="reset" data-icon="reset"><span class="icon-slot"></span><span>Restaurar</span></button>
          <button class="is-active" data-action="field" data-icon="field"><span class="icon-slot"></span><span>Campo</span></button>
          <button data-action="potential" data-icon="potential"><span class="icon-slot"></span><span>Potencial</span></button>
          <button data-action="view" data-icon="camera"><span class="icon-slot"></span><span>Usar 2D</span></button>
          <details class="toolbar-more"><summary aria-label="Mais ações">•••</summary><div><button data-action="save" data-icon="save"><span class="icon-slot"></span><span>Salvar</span></button><button data-action="export" data-icon="export"><span class="icon-slot"></span><span>Exportar JSON</span></button></div></details>
        </div>
        <div class="lab-status-rail coulomb-status" aria-label="Estado científico">
          <span class="status-chip" data-coulomb-status data-state="success">Cena 3D preparando…</span>
          <span class="status-chip" data-state="measure">Arraste q₁, q₂ ou a sonda</span>
          <span class="status-chip" data-interaction-chip>Configuração de atração</span>
        </div>
        <div class="coulomb-stage" data-coulomb-stage>
          <div class="coulomb-2d-fallback"><canvas data-coulomb-2d aria-label="Simulação de duas cargas elétricas e uma sonda de campo"></canvas></div>
          <div class="coulomb-stage__legend"><span><i class="positive"></i>Carga positiva</span><span><i class="negative"></i>Carga negativa</span><span><i class="probe"></i>Sonda</span></div>
        </div>
        <div class="readout readout--priority">
          <div><small>Interação</small><strong data-out="interaction"></strong></div>
          <div><small>Distância</small><strong data-out="distance"></strong></div>
          <div><small>Força</small><strong data-out="force"></strong></div>
          <div><small>Campo na sonda</small><strong data-out="field"></strong></div>
          <div><small>Potencial</small><strong data-out="potential"></strong></div>
        </div>
      </article>
      <aside class="control-stack coulomb-controls">
        <article class="control-card coulomb-start-card">
          <div class="card-title-row"><div><small>PASSO 1</small><h2>Escolha um cenário</h2></div><span>Pronto para investigar</span></div>
          <div class="scenario-preset-grid" role="group" aria-label="Cenários de eletrostática">
            <button data-preset="attraction" class="is-active"><b>Atração</b><small>+1 μC e −1 μC</small></button>
            <button data-preset="repulsion"><b>Repulsão</b><small>+1 μC e +1 μC</small></button>
            <button data-preset="asymmetric"><b>Assimétrico</b><small>+3 μC e −1 μC</small></button>
          </div>
          <ol class="guided-steps"><li><b>Posicione</b> as cargas.</li><li><b>Altere</b> sinal ou distância.</li><li><b>Compare</b> força, campo e potencial.</li></ol>
        </article>
        <article class="control-card coulomb-variable-card">
          <div class="card-title-row"><div><small>PASSO 2</small><h2>Altere um parâmetro</h2></div></div>
          <div class="control"><label>Carga q₁ <output data-value="q1"></output></label><input data-input="q1" type="range" min="-5" max="5" value="1" step=".1"></div>
          <div class="control"><label>Carga q₂ <output data-value="q2"></output></label><input data-input="q2" type="range" min="-5" max="5" value="-1" step=".1"></div>
          <details class="advanced-control"><summary>Movimento e velocidade</summary><div class="control"><label>Massa dinâmica <output data-value="mass"></output></label><input data-input="mass" type="range" min=".2" max="5" value="1" step=".1"></div><div class="segment" aria-label="Velocidade temporal"><button data-speed=".25">0,25×</button><button class="is-active" data-speed="1">1×</button><button data-speed="2">2×</button></div></details>
        </article>
        <article class="control-card coulomb-result-card">
          <div class="card-title-row"><div><small>PASSO 3</small><h3>Explique o resultado</h3></div></div>
          <div class="formula formula--compact" data-formula></div>
          <canvas class="chart" data-chart width="500" height="150"></canvas>
        </article>
        <article class="control-card instrument-panel instrument-panel--compact"><div class="instrument-panel__icon">${icon('probe')}</div><div><small>SONDA VETORIAL</small><strong>Arraste para medir sem alterar as cargas.</strong></div></article>
        <div class="note" data-note>Use o cenário 3D para observar o espaço ao redor das cargas. O modo 2D continua disponível para comparação e aparelhos com menor desempenho.</div>
      </aside>
    </div>`
  root.append(shell);

  const canvas = shell.querySelector('[data-coulomb-2d]');
  const ctx = canvas.getContext('2d');
  const chart = shell.querySelector('[data-chart]');
  const chartCtx = chart.getContext('2d');
  const inputs = Object.fromEntries([...shell.querySelectorAll('[data-input]')].map((el) => [el.dataset.input, el]));
  const outputs = Object.fromEntries([...shell.querySelectorAll('[data-value]')].map((el) => [el.dataset.value, el]));
  const readout = Object.fromEntries([...shell.querySelectorAll('[data-out]')].map((el) => [el.dataset.out, el]));
  const formula = shell.querySelector('[data-formula]');
  const note = shell.querySelector('[data-note]');

  const defaults = {
    q1: 1e-6,
    q2: -1e-6,
    mass: 1,
    speed: 1,
    playing: false,
    showField: true,
    showPotential: false,
    a: { x: 0.32, y: 0.55, vx: 0, vy: 0 },
    b: { x: 0.68, y: 0.55, vx: 0, vy: 0 },
    probe: { x: 0.5, y: 0.3 },
  };
  const saved = loadExperiment('coulomb.v2')?.data;
  const state = {
    ...structuredClone(defaults),
    ...(saved || {}),
    a: { ...defaults.a, ...(saved?.a || {}) },
    b: { ...defaults.b, ...(saved?.b || {}) },
    probe: { ...defaults.probe, ...(saved?.probe || {}) },
    drag: null,
    last: performance.now(),
    raf: 0,
    force2dView: false,
  };
  let cleanup3d = null;
  let disposed = false;

  inputs.q1.value = String(state.q1 * 1e6);
  inputs.q2.value = String(state.q2 * 1e6);
  inputs.mass.value = String(state.mass);

  function serializableState() {
    return {
      q1: state.q1,
      q2: state.q2,
      mass: state.mass,
      speed: state.speed,
      showField: state.showField,
      showPotential: state.showPotential,
      a: { x: state.a.x, y: state.a.y, vx: 0, vy: 0 },
      b: { x: state.b.x, y: state.b.y, vx: 0, vy: 0 },
      probe: { x: state.probe.x, y: state.probe.y },
    };
  }

  function reset() {
    Object.assign(state, structuredClone(defaults), { drag: null, last: performance.now(), raf: state.raf });
    inputs.q1.value = 1;
    inputs.q2.value = -1;
    inputs.mass.value = 1;
    shell.querySelector('[data-action="play"] span:last-child').textContent = 'Executar';
    shell.querySelector('[data-action="field"]').classList.add('is-active');
    shell.querySelector('[data-action="potential"]').classList.remove('is-active');
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, getQualityProfile().pixelRatio);
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function charges() {
    return [
      { q: state.q1, position: normalizedToMeters(state.a, ARENA_METERS) },
      { q: state.q2, position: normalizedToMeters(state.b, ARENA_METERS) },
    ];
  }

  function physics() {
    return pairInteraction(
      state.q1,
      normalizedToMeters(state.a, ARENA_METERS),
      state.q2,
      normalizedToMeters(state.b, ARENA_METERS),
    );
  }

  function fieldAtNormalized(point) {
    return electricFieldAt(charges(), normalizedToMeters(point, ARENA_METERS));
  }

  function potentialAtNormalized(point) {
    return electricPotentialAt(charges(), normalizedToMeters(point, ARENA_METERS));
  }

  function update(dt) {
    if (!state.playing || state.drag) return;
    const interaction = physics();
    const visualScale = 0.022;
    state.a.vx += interaction.forceOn1.x / state.mass * visualScale * dt;
    state.a.vy -= interaction.forceOn1.y / state.mass * visualScale * dt;
    state.b.vx += interaction.forceOn2.x / state.mass * visualScale * dt;
    state.b.vy -= interaction.forceOn2.y / state.mass * visualScale * dt;
    for (const body of [state.a, state.b]) {
      body.vx *= 0.998;
      body.vy *= 0.998;
      body.x += body.vx * dt;
      body.y += body.vy * dt;
      if (body.x < 0.08 || body.x > 0.92) {
        body.vx *= -0.55;
        body.x = Math.max(0.08, Math.min(0.92, body.x));
      }
      if (body.y < 0.18 || body.y > 0.82) {
        body.vy *= -0.55;
        body.y = Math.max(0.18, Math.min(0.82, body.y));
      }
    }
    if (interaction.rawDistance < 0.075) {
      state.playing = false;
      shell.querySelector('[data-action="play"] span:last-child').textContent = 'Executar';
      note.textContent = 'A simulação foi pausada na região mínima do modelo de cargas puntiformes.';
    }
  }

  function drawArrow(x1, y1, x2, y2, color, width = 2) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 9 * Math.cos(angle - 0.45), y2 - 9 * Math.sin(angle - 0.45));
    ctx.lineTo(x2 - 9 * Math.cos(angle + 0.45), y2 - 9 * Math.sin(angle + 0.45));
    ctx.closePath();
    ctx.fill();
  }

  function drawPotential(w, h) {
    if (!state.showPotential) return;
    const step = getQualityProfile().potentialStep;
    for (let y = 80; y < h - 74; y += step) {
      for (let x = 0; x < w; x += step) {
        const value = potentialAtNormalized({ x: (x + step / 2) / w, y: (y + step / 2) / h });
        const normalized = Math.tanh(value / 18000);
        const alpha = Math.min(0.34, Math.abs(normalized) * 0.3 + 0.03);
        ctx.fillStyle = normalized >= 0 ? `rgba(255,92,112,${alpha})` : `rgba(83,149,255,${alpha})`;
        ctx.fillRect(x, y, step + 1, step + 1);
      }
    }
  }

  function drawField(w, h) {
    if (!state.showField) return;
    const step = getQualityProfile().fieldStep;
    for (let y = 92; y < h - 82; y += step) {
      for (let x = 30; x < w - 30; x += step) {
        const field = fieldAtNormalized({ x: x / w, y: y / h });
        const magnitude = Math.max(1e-10, field.magnitude);
        const length = Math.min(18, 5 + Math.log10(magnitude + 1) * 1.6);
        drawArrow(x, y, x + field.x / magnitude * length, y - field.y / magnitude * length, 'rgba(117,224,255,.46)', 1);
      }
    }
  }

  function drawCharge(x, y, q, label) {
    const positive = q > 0;
    const neutral = q === 0;
    const color = neutral ? '#93a4b5' : positive ? '#ff7f8e' : '#68a8ff';
    const glow = ctx.createRadialGradient(x - 10, y - 12, 2, x, y, 44);
    glow.addColorStop(0, '#fff');
    glow.addColorStop(0.15, color);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 27, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.75)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#06101a';
    ctx.font = '800 25px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(neutral ? '○' : positive ? '+' : '−', x, y - 1);
    ctx.fillStyle = '#eef7ff';
    ctx.font = '700 13px system-ui';
    ctx.fillText(label, x, y + 48);
  }

  function drawProbe(x, y) {
    ctx.save();
    ctx.strokeStyle = '#55e39f';
    ctx.fillStyle = 'rgba(85,227,159,.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 21, y);
    ctx.lineTo(x + 21, y);
    ctx.moveTo(x, y - 21);
    ctx.lineTo(x, y + 21);
    ctx.stroke();
    ctx.fillStyle = '#d9ffec';
    ctx.font = '700 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('SONDA', x, y + 36);
    ctx.restore();
  }

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    const gradient = ctx.createRadialGradient(w * 0.5, h * 0.45, 10, w * 0.5, h * 0.45, Math.max(w, h) * 0.7);
    gradient.addColorStop(0, '#112a46');
    gradient.addColorStop(1, '#020711');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(83,216,255,.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 36) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 36) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    drawPotential(w, h);
    drawField(w, h);

    const interaction = physics();
    const ax = state.a.x * w;
    const ay = state.a.y * h;
    const bx = state.b.x * w;
    const by = state.b.y * h;
    ctx.setLineDash([6, 7]);
    ctx.strokeStyle = 'rgba(255,255,255,.38)';
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.setLineDash([]);

    const force1 = interaction.forceOn1;
    const force2 = interaction.forceOn2;
    const forceLength = Math.min(98, 28 + interaction.magnitude * 4200);
    const f1m = Math.hypot(force1.x, force1.y) || 1;
    const f2m = Math.hypot(force2.x, force2.y) || 1;
    drawArrow(ax, ay, ax + force1.x / f1m * forceLength, ay - force1.y / f1m * forceLength, '#ffe085', 3);
    drawArrow(bx, by, bx + force2.x / f2m * forceLength, by - force2.y / f2m * forceLength, '#ffe085', 3);

    drawCharge(ax, ay, state.q1, 'q₁');
    drawCharge(bx, by, state.q2, 'q₂');
    drawProbe(state.probe.x * w, state.probe.y * h);
    updateUI(interaction);
  }

  function updateUI(interaction) {
    const field = fieldAtNormalized(state.probe);
    const potential = potentialAtNormalized(state.probe);
    readout.distance.textContent = fmt(interaction.distance, 'm');
    readout.force.textContent = fmt(interaction.magnitude, 'N');
    readout.interaction.textContent = interaction.interaction === 'attraction' ? 'Atração' : interaction.interaction === 'repulsion' ? 'Repulsão' : 'Sem força mútua';
    const interactionChip = shell.querySelector('[data-interaction-chip]');
    interactionChip.textContent = interaction.interaction === 'attraction' ? 'Atração entre as cargas' : interaction.interaction === 'repulsion' ? 'Repulsão entre as cargas' : 'Uma carga está neutra';
    interactionChip.dataset.state = interaction.interaction === 'attraction' ? 'success' : interaction.interaction === 'repulsion' ? 'attention' : 'measurement';
    readout.field.textContent = fmt(field.magnitude, 'N/C');
    readout.potential.textContent = fmt(potential, 'V');
    outputs.q1.textContent = `${(state.q1 * 1e6).toFixed(1)} μC`;
    outputs.q2.textContent = `${(state.q2 * 1e6).toFixed(1)} μC`;
    outputs.mass.textContent = `${state.mass.toFixed(1)} kg`;
    formula.innerHTML = `
      F = k · |q₁q₂| / r²<br>
      F = 8,9875×10⁹ · |${state.q1.toExponential(2)} × ${state.q2.toExponential(2)}| / ${interaction.distance.toFixed(3)}²<br>
      <b>F = ${fmt(interaction.magnitude, 'N')}</b><br><br>
      E⃗(sonda) = Σ kqᵢr̂ᵢ/rᵢ² = <b>${fmt(field.magnitude, 'N/C')}</b><br>
      V(sonda) = Σ kqᵢ/rᵢ = <b>${fmt(potential, 'V')}</b>`;
    drawChart(interaction.distance);
  }

  function drawChart(current) {
    const w = chart.width;
    const h = chart.height;
    chartCtx.clearRect(0, 0, w, h);
    chartCtx.strokeStyle = 'rgba(83,216,255,.2)';
    chartCtx.lineWidth = 1;
    for (let y = 20; y < h; y += 40) {
      chartCtx.beginPath(); chartCtx.moveTo(0, y); chartCtx.lineTo(w, y); chartCtx.stroke();
    }
    chartCtx.strokeStyle = '#53d8ff';
    chartCtx.lineWidth = 3;
    chartCtx.beginPath();
    for (let i = 0; i < 150; i += 1) {
      const distance = 0.12 + i / 149 * 3;
      const force = COULOMB_CONSTANT * Math.abs(state.q1 * state.q2) / (distance ** 2);
      const x = i / 149 * w;
      const y = h - 8 - Math.min(h - 18, Math.log10(force * 1e6 + 1) * 23);
      if (i === 0) chartCtx.moveTo(x, y); else chartCtx.lineTo(x, y);
    }
    chartCtx.stroke();
    const x = Math.max(0, Math.min(w, (current - 0.12) / (3 - 0.12) * w));
    chartCtx.strokeStyle = '#ffc66d';
    chartCtx.beginPath(); chartCtx.moveTo(x, 0); chartCtx.lineTo(x, h); chartCtx.stroke();
  }

  function locate(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
  }

  canvas.addEventListener('pointerdown', (event) => {
    const point = locate(event);
    const targets = [
      ['a', Math.hypot(point.x - state.a.x, point.y - state.a.y)],
      ['b', Math.hypot(point.x - state.b.x, point.y - state.b.y)],
      ['probe', Math.hypot(point.x - state.probe.x, point.y - state.probe.y)],
    ].sort((a, b) => a[1] - b[1]);
    state.drag = targets[0][1] < 0.085 ? targets[0][0] : null;
    if (state.drag) canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!state.drag) return;
    const point = locate(event);
    const target = state[state.drag];
    target.x = Math.max(0.06, Math.min(0.94, point.x));
    target.y = Math.max(0.17, Math.min(0.83, point.y));
    if ('vx' in target) target.vx = target.vy = 0;
  });
  canvas.addEventListener('pointerup', () => { state.drag = null; });
  canvas.addEventListener('pointercancel', () => { state.drag = null; });

  Object.entries(inputs).forEach(([key, input]) => input.addEventListener('input', () => {
    if (key === 'q1' || key === 'q2') state[key] = Number(input.value) * 1e-6;
    else state[key] = Number(input.value);
  }));

  shell.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'play') {
      state.playing = !state.playing;
      button.querySelector('span:last-child').textContent = state.playing ? 'Pausar' : 'Executar';
    }
    if (action === 'reset') reset();
    if (action === 'field') {
      state.showField = !state.showField;
      button.classList.toggle('is-active', state.showField);
    }
    if (action === 'potential') {
      state.showPotential = !state.showPotential;
      button.classList.toggle('is-active', state.showPotential);
    }
    if (action === 'save') {
      saveExperiment('coulomb.v2', serializableState());
      note.textContent = 'Experimento salvo localmente neste dispositivo.';
    }
    if (action === 'export') {
      downloadJson('experimento-coulomb.json', {
        project: 'Física Imersiva 360',
        model: 'Cargas puntiformes com visualização 3D e fallback 2D',
        constant: COULOMB_CONSTANT,
        state: serializableState(),
        results: {
          interaction: physics(),
          fieldAtProbe: fieldAtNormalized(state.probe),
          potentialAtProbe: potentialAtNormalized(state.probe),
        },
      });
    }
    if (action === 'view') {
      state.force2dView = !state.force2dView;
      shell.querySelector('[data-coulomb-stage]').classList.toggle('is-2d-forced', state.force2dView);
      button.querySelector('span:last-child').textContent = state.force2dView ? 'Usar 3D' : 'Usar 2D';
      note.textContent = state.force2dView ? 'Modo 2D ativo para comparação direta e compatibilidade.' : 'Modo 3D ativo. Arraste as cargas e gire a câmera para observar o campo no espaço.';
    }
    if (button.dataset.preset) {
      const presets = {
        attraction: { q1: 1, q2: -1, a: { x: .31, y: .55 }, b: { x: .69, y: .55 } },
        repulsion: { q1: 1, q2: 1, a: { x: .31, y: .55 }, b: { x: .69, y: .55 } },
        asymmetric: { q1: 3, q2: -1, a: { x: .29, y: .58 }, b: { x: .71, y: .48 } },
      };
      const preset = presets[button.dataset.preset];
      if (preset) {
        state.q1 = preset.q1 * 1e-6; state.q2 = preset.q2 * 1e-6;
        Object.assign(state.a, preset.a, { vx: 0, vy: 0 }); Object.assign(state.b, preset.b, { vx: 0, vy: 0 });
        inputs.q1.value = preset.q1; inputs.q2.value = preset.q2; state.playing = false;
        shell.querySelector('[data-action="play"] span:last-child').textContent = 'Executar';
        shell.querySelectorAll('[data-preset]').forEach((item) => item.classList.toggle('is-active', item === button));
        note.textContent = `Cenário ${button.querySelector('b').textContent.toLowerCase()} aplicado. Agora altere somente um parâmetro e compare os resultados.`;
      }
    }
    if (button.dataset.speed) {
      state.speed = Number(button.dataset.speed);
      shell.querySelectorAll('[data-speed]').forEach((item) => item.classList.toggle('is-active', item === button));
    }
  });

  const threeState = () => ({
    q1: state.q1, q2: state.q2, a: state.a, b: state.b, probe: state.probe,
    showField: state.showField, showPotential: state.showPotential, interaction: physics(),
  });
  mountCoulomb3D({
    container: shell.querySelector('[data-coulomb-stage]'),
    statusElement: shell.querySelector('[data-coulomb-status]'),
    getSettings,
    getState: threeState,
    onPositionChange(kind, point) {
      const target = state[kind]; if (!target) return;
      target.x = point.x; target.y = point.y; if ('vx' in target) target.vx = target.vy = 0;
    },
  }).then((cleanup) => { if (disposed) cleanup?.(); else cleanup3d = cleanup; }).catch((error) => {
    shell.querySelector('[data-coulomb-status]').textContent = 'Modo 2D ativo · cena 3D indisponível';
    shell.querySelector('[data-coulomb-stage]').classList.add('is-2d-forced');
    reportRuntimeIssue(error, { label: 'Eletrostática em modo 2D', source: 'coulomb3d' });
  });

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();
  function frame(now) {
    const dt = Math.min(0.02, (now - state.last) / 1000) * state.speed;
    state.last = now;
    update(dt);
    draw();
    state.raf = requestAnimationFrame(frame);
  }
  state.raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(state.raf);
    resizeObserver.disconnect();
    disposed = true; cleanup3d?.();
  };
}
