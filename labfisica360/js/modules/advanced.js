import { mountAdvanced3D } from './advanced3d.js';
import {
  C, ELECTRON_MASS, calculateAdvancedExperiment, gaussianWavePacket,
  galaxyRotationCurve, gravitationalTimeDilation,
} from '../science/advanced-physics.js';
import { reportRuntimeIssue } from '../stability.js';
import { mountR4Guidance } from '../ui/r4-guided-labs.js';

const STORAGE_KEY = 'fisica360:advanced-premium:v2';

export const ADVANCED_TOPICS = {
  quantum: {
    label: 'Física Quântica', icon: 'ψ', level: 'Universidade · Quântica introdutória', confidence: 'Teoria estabelecida · modelo educacional parametrizado',
    title: 'Pacote de onda e tunelamento', summary: 'Explore comprimento de onda de de Broglie, densidade de probabilidade e transmissão por uma barreira. A nuvem representa probabilidade, não uma trajetória clássica do elétron.',
    topics: ['dualidade onda-partícula', 'pacote gaussiano', 'de Broglie', 'tunelamento', 'probabilidade'], formula: 'λ = h/p · T ≈ e^(−2κa)',
    warning: 'O módulo usa pacote gaussiano e aproximação WKB para a barreira. Ele não substitui uma solução numérica geral da equação de Schrödinger.',
    objective: 'Compare a transmissão ao alterar energia, altura e largura da barreira.',
  },
  darkMatter: {
    label: 'Matéria Escura', icon: '◉', level: 'Universidade · Astrofísica galáctica', confidence: 'Evidência gravitacional forte · composição microscópica desconhecida',
    title: 'Curvas de rotação e halo galáctico', summary: 'Compare a velocidade prevista pela matéria luminosa com uma curva que inclui um halo gravitacional. O halo transparente é uma convenção visual para uma distribuição inferida.',
    topics: ['curva de rotação', 'massa encerrada', 'halo', 'evidência indireta', 'dinâmica galáctica'], formula: 'v(r) = √(GM(r)/r)',
    warning: 'A matéria escura não foi fotografada como uma nuvem luminosa; o halo é uma metáfora visual e o perfil utilizado é simplificado para investigação educacional.',
    objective: 'Ajuste o halo até obter uma curva externa aproximadamente plana.',
  },
  relativity: {
    label: 'Relatividade', icon: 'c', level: 'Universidade · Relatividade Especial', confidence: 'Teoria estabelecida e amplamente testada',
    title: 'Relógios, comprimento e viagem relativística', summary: 'Compare os tempos medidos na Terra e na nave, além da contração do comprimento, para velocidades expressas como fração da velocidade da luz.',
    topics: ['fator de Lorentz', 'dilatação temporal', 'contração', 'tempo próprio', 'viagem interestelar'], formula: 'γ = 1/√(1−β²) · Δτ = Δt/γ',
    warning: 'A cena comprime distâncias e acelera movimentos para visualização. Os cálculos apresentados usam movimento inercial uniforme e não incluem as fases de aceleração.',
    objective: 'Encontre uma velocidade em que a diferença entre os dois relógios seja claramente observável.',
  },
  blackHole: {
    label: 'Buracos Negros', icon: '●', level: 'Universidade · Gravitação relativística', confidence: 'Objetos observados · renderização física aproximada',
    title: 'Horizonte, órbitas e lente gravitacional', summary: 'Investigue o raio de Schwarzschild, a esfera de fótons, a órbita circular estável mais interna, a dilatação gravitacional e a deflexão da luz.',
    topics: ['horizonte', 'esfera de fótons', 'ISCO', 'disco de acreção', 'lente gravitacional'], formula: 'rₛ = 2GM/c² · α ≈ 4GM/(bc²)',
    warning: 'A deflexão usa o limite de campo fraco e o disco é procedural. A imagem não é um traçamento relativístico espectral de precisão.',
    objective: 'Aproxime a sonda do limite estável e observe a diferença entre tempo local e distante.',
  },
  timeTravel: {
    label: 'Tempo e Causalidade', icon: '∞', level: 'Universidade/Mestrado · Espaço-tempo', confidence: 'Cones de luz estabelecidos · viagem temporal prática não demonstrada',
    title: 'Intervalos e cones de luz', summary: 'Posicione dois eventos no espaço-tempo e determine se a separação é temporal, luminosa ou espacial, verificando se uma influência causal subluminal é possível.',
    topics: ['intervalo', 'cone de luz', 'causalidade', 'eventos', 'limite c'], formula: 's² = c²Δt² − Δx² − Δy² − Δz²',
    warning: 'Este módulo é especulativo e não apresenta um método real de viajar no tempo. Buracos de minhoca e curvas temporais fechadas permanecem hipóteses teóricas, não tecnologias demonstradas.',
    objective: 'Mova o evento para dentro, sobre e fora do cone de luz.',
  },
};

const DEFAULTS = {
  mode: 'quantum', speedPercentC: 5, massRatio: 1, energyEv: 4, barrierEv: 8, barrierWidthNm: .6,
  radiusKpc: 8, diskMassBillion: 60, scaleLengthKpc: 3, haloVelocityKmS: 190, haloCoreKpc: 4,
  beta: .8, distanceLy: 4.37, properLength: 100, coordinateTime: 10,
  blackHoleMassSolar: 10, orbitRadiusRs: 6, impactInRs: 8,
  deltaTimeNs: 10, deltaX: 2, deltaY: 0, deltaZ: 0,
  intensity: .78, speed: 1, particles: true, conclusion: '',
};

const CONTROL_GROUPS = {
  quantum: [
    ['speedPercentC', 'Velocidade', .1, 50, .1, '% de c'], ['massRatio', 'Massa da partícula', .2, 5, .1, 'mₑ'],
    ['energyEv', 'Energia', .2, 20, .1, 'eV'], ['barrierEv', 'Altura da barreira', .2, 25, .1, 'eV'], ['barrierWidthNm', 'Largura da barreira', .05, 2, .01, 'nm'],
  ],
  darkMatter: [
    ['radiusKpc', 'Raio analisado', .5, 30, .1, 'kpc'], ['diskMassBillion', 'Massa do disco', 5, 150, 1, '10⁹ M☉'],
    ['scaleLengthKpc', 'Escala do disco', 1, 8, .1, 'kpc'], ['haloVelocityKmS', 'Velocidade do halo', 0, 320, 1, 'km/s'], ['haloCoreKpc', 'Raio do núcleo', .5, 12, .1, 'kpc'],
  ],
  relativity: [
    ['beta', 'Velocidade β', .05, .999, .001, 'c'], ['distanceLy', 'Distância', .1, 30, .01, 'anos-luz'],
    ['properLength', 'Comprimento próprio', 1, 500, 1, 'm'], ['coordinateTime', 'Tempo na Terra', .1, 50, .1, 'anos'],
  ],
  blackHole: [
    ['blackHoleMassSolar', 'Massa', 3, 100, 1, 'M☉'], ['orbitRadiusRs', 'Raio da sonda', 3.05, 20, .05, 'rₛ'], ['impactInRs', 'Parâmetro de impacto', 2, 30, .1, 'rₛ'],
  ],
  timeTravel: [
    ['deltaTimeNs', 'Separação temporal', .1, 60, .1, 'ns'], ['deltaX', 'Δx', -18, 18, .1, 'm'], ['deltaY', 'Δy', -18, 18, .1, 'm'], ['deltaZ', 'Δz', -18, 18, .1, 'm'],
  ],
};

const format = (value, digits = 3) => Number.isFinite(value) ? Number(value).toLocaleString('pt-BR', { maximumFractionDigits: digits }) : '—';
const scientific = (value, digits = 3) => Number.isFinite(value) ? Number(value).toExponential(digits).replace('.', ',') : '—';
const loadSaved = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; } };
function download(name, content) { const blob = new Blob([content], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 500); }

function readingsFor(mode, result) {
  if (mode === 'quantum') return [
    ['Comprimento de onda', `${format(result.wave.wavelength * 1e9, 4)} nm`, 'de Broglie relativístico'],
    ['Transmissão', `${format(result.tunnel.transmission * 100, 5)}%`, result.tunnel.regime],
    ['Reflexão', `${format(result.tunnel.reflection * 100, 3)}%`, 'R = 1 − T'],
    ['Fator de Lorentz', format(result.wave.gamma, 5), `β = ${format(result.beta, 4)}`],
  ];
  if (mode === 'darkMatter') return [
    ['Velocidade luminosa', `${format(result.curve.luminousVelocity / 1000, 1)} km/s`, 'apenas disco'],
    ['Velocidade total', `${format(result.curve.totalVelocity / 1000, 1)} km/s`, 'disco + halo'],
    ['Fração do halo', `${format(result.curve.haloFraction * 100, 1)}%`, 'massa efetiva encerrada'],
    ['Massa do halo', `${format(result.curve.haloMass / 1.98847e30 / 1e9, 2)} ×10⁹ M☉`, `r = ${format(result.curve.radiusKpc, 1)} kpc`],
  ];
  if (mode === 'relativity') return [
    ['Fator γ', format(result.journey.gamma, 5), `β = ${format(result.beta, 4)}`],
    ['Tempo na Terra', `${format(result.journey.earthYears, 3)} anos`, `${format(result.journey.distanceLy, 2)} a.l.`],
    ['Tempo na nave', `${format(result.journey.travelerYears, 3)} anos`, 'tempo próprio'],
    ['Comprimento observado', `${format(result.contraction.contractedLength, 2)} m`, `de ${format(result.contraction.properLength, 1)} m`],
  ];
  if (mode === 'blackHole') return [
    ['Raio de Schwarzschild', `${format(result.properties.schwarzschildRadius / 1000, 2)} km`, 'horizonte ideal não rotativo'],
    ['Fator do relógio', format(result.properties.timeFactor, 5), 'local/distante'],
    ['Período orbital', `${format(result.properties.orbitalPeriod * 1000, 2)} ms`, `${format(result.properties.orbitRadius / result.properties.schwarzschildRadius, 2)} rₛ`],
    ['Deflexão aproximada', `${format(result.deflection.angleDegrees, 3)}°`, `${format(result.deflection.angleArcseconds, 1)}″`],
  ];
  const i = result.interval;
  const labels = { timelike: 'Temporal', lightlike: 'Luminosa', spacelike: 'Espacial' };
  return [
    ['Classificação', labels[i.classification], i.causallyReachable ? 'conexão causal possível' : 'fora do cone'],
    ['Distância espacial', `${format(i.distance, 3)} m`, `cΔt = ${format(i.lightTravelDistance, 3)} m`],
    ['Intervalo s²', `${scientific(i.intervalSquared, 2)} m²`, 'assinatura + − − −'],
    ['Velocidade necessária', i.requiredSpeed <= C ? `${format(i.requiredSpeed / C, 3)} c` : `${format(i.requiredSpeed / C, 2)} c`, i.requiredSpeed <= C ? 'subluminal' : 'superluminal, não permitida'],
  ];
}

function graphSeries(mode, p) {
  if (mode === 'quantum') {
    const sigma = .65;
    return { label: 'Densidade de probabilidade do pacote', series: [{ color: '#9e85ff', points: Array.from({ length: 121 }, (_, i) => { const x = -4 + i / 15; return [x, gaussianWavePacket({ x, sigma, waveNumber: 5 }).probabilityDensity]; }) }] };
  }
  if (mode === 'darkMatter') {
    const luminous = [], total = [];
    for (let r = .4; r <= 30; r += .35) { const c = galaxyRotationCurve({ radiusKpc: r, diskMassSolar: p.diskMassBillion * 1e9, scaleLengthKpc: p.scaleLengthKpc, haloVelocityKmS: p.haloVelocityKmS, haloCoreKpc: p.haloCoreKpc }); luminous.push([r, c.luminousVelocity / 1000]); total.push([r, c.totalVelocity / 1000]); }
    return { label: 'Curva de rotação · luminosa e total', series: [{ color: '#ffc879', points: luminous }, { color: '#8a70ff', points: total }] };
  }
  if (mode === 'relativity') {
    return { label: 'Dilatação temporal em função de β', series: [{ color: '#69e3ff', points: Array.from({ length: 100 }, (_, i) => { const b = i * .0099; return [b, Math.sqrt(1 - b * b)]; }) }] };
  }
  if (mode === 'blackHole') {
    return { label: 'Ritmo do relógio × raio/rₛ', series: [{ color: '#ffb36b', points: Array.from({ length: 120 }, (_, i) => { const r = 1.02 + i * .12; return [r, gravitationalTimeDilation({ solarMasses: p.blackHoleMassSolar, radiusInRs: r }).factor]; }) }] };
  }
  const ct = C * p.deltaTimeNs * 1e-9;
  return { label: 'Cone de luz e posição do evento', series: [
    { color: '#67e5ff', points: [[-ct, 0], [0, p.deltaTimeNs], [ct, 0]] },
    { color: '#ff73d9', pointOnly: true, points: [[Math.hypot(p.deltaX, p.deltaY, p.deltaZ), p.deltaTimeNs]] },
  ] };
}

function drawGraph(canvas, graph) {
  const rect = canvas.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1); const w = Math.max(260, rect.width); const h = Math.max(140, rect.height);
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
  const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h); ctx.fillStyle = 'rgba(2,6,17,.86)'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(144,118,255,.12)'; ctx.lineWidth = 1; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(w * i / 6, 0); ctx.lineTo(w * i / 6, h); ctx.stroke(); } for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0, h * i / 4); ctx.lineTo(w, h * i / 4); ctx.stroke(); }
  const all = graph.series.flatMap(s => s.points); let minX = Math.min(...all.map(p => p[0])), maxX = Math.max(...all.map(p => p[0])), minY = Math.min(...all.map(p => p[1])), maxY = Math.max(...all.map(p => p[1]));
  if (maxX - minX < 1e-12) { minX -= 1; maxX += 1; } if (maxY - minY < 1e-12) { minY -= 1; maxY += 1; } const py = (maxY - minY) * .12 || 1; minY -= py; maxY += py;
  for (const s of graph.series) { ctx.strokeStyle = s.color; ctx.fillStyle = s.color; ctx.lineWidth = 2; if (s.pointOnly) { for (const [x, y] of s.points) { const px = (x - minX) / (maxX - minX) * w, yy = h - (y - minY) / (maxY - minY) * h; ctx.beginPath(); ctx.arc(px, yy, 5, 0, Math.PI * 2); ctx.fill(); } continue; } ctx.beginPath(); s.points.forEach(([x, y], i) => { const px = (x - minX) / (maxX - minX) * w, yy = h - (y - minY) / (maxY - minY) * h; i ? ctx.lineTo(px, yy) : ctx.moveTo(px, yy); }); ctx.stroke(); }
  ctx.fillStyle = 'rgba(236,246,255,.92)'; ctx.font = '12px system-ui'; ctx.fillText(graph.label, 10, 18);
}

function controlsMarkup(mode) {
  return CONTROL_GROUPS[mode].map(([key, label, min, max, step, unit]) => `<label><span>${label} <output data-output="${key}"></output></span><input data-param="${key}" type="range" min="${min}" max="${max}" step="${step}"><small>${unit}</small></label>`).join('');
}

export function renderAdvanced(root, { getSettings = () => ({ reduceMotion: false }) } = {}) {
  const saved = loadSaved() || {}; const params = { ...DEFAULTS, ...(saved.params || {}) }; let mode = ADVANCED_TOPICS[saved.mode] ? saved.mode : params.mode; let result = calculateAdvancedExperiment(mode, params); let controller = null; let disposed = false; let lastGraph = 0; let running = true;
  const section = document.createElement('section'); section.className = 'advanced-premium';
  section.innerHTML = `<header class="advanced-premium__head"><div><span class="badge badge--advanced">Fase Visual 12 · Física Avançada Premium</span><h1>Física Avançada 360</h1><p>Quântica, relatividade, gravitação, matéria escura e causalidade em observatórios 3D vinculados a modelos científicos declarados.</p></div><div class="advanced-premium__actions"><button data-advanced-save>Salvar</button><button data-advanced-export>Exportar evidência</button></div></header>
  <div class="advanced-premium__layout"><article class="advanced-stage" data-advanced-stage aria-label="Observatório 3D de Física Avançada"><div class="advanced-fallback"><div class="advanced-fallback__core"></div><div class="advanced-fallback__orbit"></div></div>
  <div class="advanced-toolbar">${Object.entries(ADVANCED_TOPICS).map(([key, t]) => `<button data-advanced-mode="${key}"><span>${t.icon}</span><small>${t.label}</small></button>`).join('')}</div>
  <div class="advanced-camera-controls"><button data-advanced-play aria-pressed="true">⏸ Pausar</button><button data-advanced-auto>⏸ Câmera</button><button data-advanced-reset>◎ Restaurar</button><button data-advanced-restart>↺ Reiniciar</button><button data-advanced-fullscreen>⛶ Imersivo</button></div><div class="advanced-engine-status" data-advanced-status>Preparando observatório…</div>
  <div class="advanced-objective"><span data-stage-kicker></span><strong data-stage-title></strong><p data-stage-objective></p></div><div class="advanced-readouts" data-readouts></div><canvas class="advanced-graph" data-advanced-graph></canvas></article>
  <aside class="advanced-controls"><article class="glass-card advanced-topic-card"><div class="advanced-topic-icon" data-topic-icon></div><div><small data-topic-level></small><h2 data-topic-title></h2></div><span class="advanced-confidence" data-topic-confidence></span><p data-topic-summary></p><div class="advanced-tags" data-topic-tags></div></article>
  <article class="glass-card"><h3>Parâmetros científicos</h3><div class="advanced-parameters" data-advanced-parameters></div><div class="advanced-visual-controls"><label>Intensidade visual <input data-advanced-intensity type="range" min="20" max="100" value="78"></label><label>Escala temporal <input data-advanced-speed type="range" min="0" max="200" value="100"></label><label class="switch"><input data-advanced-particles type="checkbox" checked><span>Partículas e rastros</span></label></div></article>
  <article class="glass-card"><h3>Relação matemática</h3><div class="formula" data-topic-formula></div><p class="note advanced-warning" data-topic-warning></p></article>
  <article class="glass-card advanced-practice"><h3>Registro da investigação</h3><p data-practice></p><textarea rows="4" data-conclusion placeholder="Registre sua hipótese, observações e conclusão."></textarea></article></aside></div>`;
  root.append(section);

  const els = {
    icon: section.querySelector('[data-topic-icon]'), level: section.querySelector('[data-topic-level]'), title: section.querySelector('[data-topic-title]'), confidence: section.querySelector('[data-topic-confidence]'), summary: section.querySelector('[data-topic-summary]'), tags: section.querySelector('[data-topic-tags]'), formula: section.querySelector('[data-topic-formula]'), warning: section.querySelector('[data-topic-warning]'), stageKicker: section.querySelector('[data-stage-kicker]'), stageTitle: section.querySelector('[data-stage-title]'), stageObjective: section.querySelector('[data-stage-objective]'), parameters: section.querySelector('[data-advanced-parameters]'), readouts: section.querySelector('[data-readouts]'), graph: section.querySelector('[data-advanced-graph]'), practice: section.querySelector('[data-practice]'), conclusion: section.querySelector('[data-conclusion]'), intensity: section.querySelector('[data-advanced-intensity]'), speed: section.querySelector('[data-advanced-speed]'), particles: section.querySelector('[data-advanced-particles]'),
  };
  els.conclusion.value = params.conclusion || ''; els.intensity.value = Math.round(params.intensity * 100); els.speed.value = Math.round(params.speed * 100); els.particles.checked = params.particles !== false;

  function syncReadings() { result = calculateAdvancedExperiment(mode, params); els.readouts.innerHTML = readingsFor(mode, result).map(([label, value, note]) => `<div><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`).join(''); drawGraph(els.graph, graphSeries(mode, params)); }
  function bindControls() { els.parameters.innerHTML = controlsMarkup(mode); els.parameters.querySelectorAll('[data-param]').forEach(input => { const key = input.dataset.param; input.value = params[key]; const output = els.parameters.querySelector(`[data-output="${key}"]`); const update = () => { params[key] = Number(input.value); output.textContent = format(params[key], Number(input.step) < .01 ? 4 : 2); syncReadings(); }; input.addEventListener('input', update); update(); }); }
  function setMode(next) { mode = ADVANCED_TOPICS[next] ? next : 'quantum'; params.mode = mode; const t = ADVANCED_TOPICS[mode]; els.icon.textContent = t.icon; els.level.textContent = t.level; els.title.textContent = t.title; els.confidence.textContent = t.confidence; els.summary.textContent = t.summary; els.formula.textContent = t.formula; els.warning.textContent = t.warning; els.stageKicker.textContent = t.label; els.stageTitle.textContent = t.title; els.stageObjective.textContent = t.objective; els.practice.textContent = t.objective; els.tags.replaceChildren(...t.topics.map(x => Object.assign(document.createElement('span'), { textContent: x }))); section.querySelectorAll('[data-advanced-mode]').forEach(b => b.classList.toggle('is-active', b.dataset.advancedMode === mode)); bindControls(); syncReadings(); controller?.setMode?.(mode); }
  section.querySelectorAll('[data-advanced-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.advancedMode)));
  els.intensity.addEventListener('input', () => { params.intensity = Number(els.intensity.value) / 100; }); els.speed.addEventListener('input', () => { params.speed = Number(els.speed.value) / 100; }); els.particles.addEventListener('change', () => { params.particles = els.particles.checked; }); els.conclusion.addEventListener('input', () => { params.conclusion = els.conclusion.value; });
  section.querySelector('[data-advanced-play]').addEventListener('click', (event) => { running = !running; event.currentTarget.setAttribute('aria-pressed', String(running)); event.currentTarget.textContent = running ? '⏸ Pausar' : '▶ Continuar'; });
  section.querySelector('[data-advanced-restart]').addEventListener('click', () => controller?.restart?.());
  section.querySelector('[data-advanced-save]').addEventListener('click', () => { localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, params })); });
  section.querySelector('[data-advanced-export]').addEventListener('click', () => { params.conclusion = els.conclusion.value; download(`fisica-avancada-${mode}-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify({ platform: 'Física Imersiva 360', version: '0.5.0', laboratory: 'Física Avançada Premium 360', mode, topic: ADVANCED_TOPICS[mode], params, result, generatedAt: new Date().toISOString() }, null, 2)); });
  const r4Guide = mountR4Guidance({ section, lab: 'advanced', controlsSelector: '.advanced-controls', modeSelector: '[data-advanced-mode]', getMode: () => mode, setMode, restart: () => controller?.restart?.(), refresh: syncReadings });
  setMode(mode);

  mountAdvanced3D({ container: section.querySelector('[data-advanced-stage]'), statusElement: section.querySelector('[data-advanced-status]'), getSettings, getExperimentState: () => ({ mode, params, result, intensity: params.intensity, speed: running ? params.speed : 0, particles: params.particles }) }).then(instance => { if (disposed) instance?.dispose?.(); else { controller = instance; controller?.setMode?.(mode); } }).catch(error => { if (disposed) return; section.querySelector('[data-advanced-status]').textContent = 'Modo 2D ativo · cena 3D indisponível.'; reportRuntimeIssue(error, { label: 'Física Avançada em modo 2D', source: 'advanced3d' }); });
  const graphLoop = () => { if (disposed) return; const now = performance.now(); if (now - lastGraph > 500) { drawGraph(els.graph, graphSeries(mode, params)); lastGraph = now; } requestAnimationFrame(graphLoop); }; requestAnimationFrame(graphLoop);
  return () => { disposed = true; r4Guide.dispose(); controller?.dispose?.(); };
}
