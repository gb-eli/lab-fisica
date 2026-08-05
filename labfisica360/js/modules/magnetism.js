import { mountMagnetism3D } from './magnetism3d.js';
import { icon } from '../ui/icons.js';
import { reportRuntimeIssue } from '../stability.js';
import { mountR3Guidance } from '../ui/r3-guided-labs.js';

const STORAGE_KEY = 'fisica360:magnetism:v1';

const MODES = {
  magnets: {
    label: 'Ímãs e campo', icon: 'magnet', badge: 'Campo magnético',
    description: 'Aproxime ímãs, altere polos, mova a sonda e observe bússolas e limalha virtual orientadas pelo campo de dipolos.',
    practice: 'Compare atração e repulsão. Posicione a sonda no centro e depois nas laterais dos ímãs.',
  },
  solenoid: {
    label: 'Eletroímã', icon: 'coil', badge: 'Campo de solenoide',
    description: 'Controle corrente, espiras, comprimento e núcleo do solenoide. O campo, a energia e o aquecimento são calculados em tempo real.',
    practice: 'Dobre a corrente e confirme o efeito sobre o campo. Depois compare núcleo de ar e núcleo ferromagnético.',
  },
  induction: {
    label: 'Indução', icon: 'induction', badge: 'Faraday–Lenz',
    description: 'Movimente um ímã por uma bobina e observe fluxo, fem induzida, polaridade e corrente alternando conforme o movimento.',
    practice: 'Aumente a velocidade do ímã e observe a amplitude da fem. Inverta o sentido do movimento e compare o sinal.',
  },
  motor: {
    label: 'Motor', icon: 'motor', badge: 'Energia elétrica → mecânica',
    description: 'Inspecione estator, rotor, bobina, eixo e comutador. Corrente, campo e número de espiras controlam torque, potência e perdas.',
    practice: 'Mantenha a corrente e aumente o campo. Compare torque, velocidade visual e aquecimento da bobina.',
  },
  generator: {
    label: 'Gerador', icon: 'generator', badge: 'Energia mecânica → elétrica',
    description: 'Gire o rotor entre polos magnéticos. A rotação produz tensão alternada, corrente na carga e perdas mecânicas e elétricas.',
    practice: 'Dobre a rotação e verifique a tensão de pico. Altere a carga e compare corrente e potência.',
  },
  transformer: {
    label: 'Transformador', icon: 'transformer', badge: 'Indução mútua',
    description: 'Ajuste espiras do primário e secundário, tensão, corrente e eficiência. O núcleo mostra fluxo e perdas.',
    practice: 'Monte uma configuração elevadora e outra abaixadora. Compare as relações de tensão e corrente.',
  },
};

function format(value, digits = 3) {
  if (!Number.isFinite(value)) return '—';
  const absolute = Math.abs(value);
  if (absolute !== 0 && (absolute < 0.001 || absolute >= 10000)) return value.toExponential(2);
  return value.toLocaleString('pt-BR', { maximumFractionDigits: digits });
}

function download(filename, content, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function readSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
}

function renderModeButtons() {
  return Object.entries(MODES).map(([key, mode]) => `<button class="mag-mode" data-mag-mode="${key}" data-icon="${mode.icon}"><span class="icon-slot"></span><span><b>${mode.label}</b><small>${mode.badge}</small></span></button>`).join('');
}

function renderReadouts() {
  return `
    <div class="mag-readout" data-r3-priority="true"><span data-mag-readout-label="primary">Campo na sonda</span><strong data-readout-primary>—</strong><small data-readout-primary-unit></small></div>
    <div class="mag-readout"><span data-mag-readout-label="secondary">Componentes do campo</span><strong data-readout-secondary>—</strong><small data-readout-secondary-unit></small></div>
    <div class="mag-readout"><span data-mag-readout-label="power">Energia / potência</span><strong data-readout-power>—</strong><small data-readout-power-unit></small></div>
    <div class="mag-readout"><span data-mag-readout-label="state">Estado observado</span><strong data-readout-state>—</strong><small data-readout-state-unit></small></div>`;
}

export function renderMagnetism(root, { getSettings = () => ({}) } = {}) {
  const saved = readSaved();
  const section = document.createElement('section');
  section.className = 'magnetism-lab';
  section.innerHTML = `
    <header class="magnetism-head">
      <div><span class="badge badge--violet">Fase Visual 8 · Eletromagnetismo Premium</span><h1>Eletromagnetismo e Máquinas 360</h1><p>Laboratório tridimensional de campos magnéticos, eletroímãs, indução, motores, geradores e transformadores.</p></div>
      <div class="magnetism-head__actions">
        <button data-mag-save data-icon="save"><span class="icon-slot"></span><span>Salvar</span></button>
        <button data-mag-export data-icon="export"><span class="icon-slot"></span><span>Exportar evidência</span></button>
      </div>
    </header>

    <div class="magnetism-layout">
      <main class="magnetism-stage" data-mag-stage aria-label="Laboratório de eletromagnetismo tridimensional">
        <div class="magnetism-fallback">
          <div class="magnetism-fallback__coil"></div><div class="magnetism-fallback__field"></div>
          <strong>Visualização 2D de compatibilidade</strong><span>Os cálculos e controles continuam disponíveis.</span>
        </div>
        <div class="magnetism-objective"><span data-mag-badge>Campo magnético</span><strong data-mag-title>Ímãs e campo</strong><p data-mag-description></p></div>
        <div class="magnetism-stage__controls">
          <button data-mag-play data-icon="play" aria-pressed="true"><span class="icon-slot"></span><span>Pausar</span></button>
          <button data-mag-auto data-icon="camera" aria-pressed="true"><span class="icon-slot"></span><span>Câmera automática</span></button>
          <button data-mag-reset-camera data-icon="reset"><span class="icon-slot"></span><span>Recentrar</span></button>
          <button data-mag-restart data-icon="undo"><span class="icon-slot"></span><span>Reiniciar</span></button>
          <button data-mag-fullscreen data-icon="fullscreen"><span class="icon-slot"></span><span>Tela cheia</span></button>
        </div>
        <div class="magnetism-status" data-mag-status role="status">Preparando laboratório 3D…</div>
        <aside class="magnetism-readouts" aria-live="polite">${renderReadouts()}</aside>
      </main>

      <aside class="magnetism-controls">
        <section class="glass-card mag-mode-panel"><h2>Experimentos</h2><div class="mag-mode-list">${renderModeButtons()}</div></section>

        <section class="glass-card mag-parameters">
          <div class="panel-title"><div><span>Parâmetros científicos</span><h2 data-parameters-title>Ímãs e campo</h2></div><span class="status ready" data-model-status>Modelo ativo</span></div>

          <div class="mag-control-group" data-control-modes="magnets">
            <label>Configuração dos polos<select data-param="polarity"><option value="attract">Polos opostos</option><option value="repel">Polos iguais</option></select></label>
            <label>Separação <output data-output="separation">2,90 m</output><input data-param="separation" type="range" min="1.6" max="5.2" value="2.9" step="0.05"></label>
            <label>Sonda X <output data-output="probeX">0,00 m</output><input data-param="probeX" type="range" min="-4" max="4" value="0" step="0.05"></label>
            <label>Sonda Z <output data-output="probeZ">2,10 m</output><input data-param="probeZ" type="range" min="-3.5" max="3.5" value="2.1" step="0.05"></label>
          </div>

          <div class="mag-control-group" data-control-modes="solenoid motor">
            <label>Corrente <output data-output="current">1,80 A</output><input data-param="current" type="range" min="-4" max="4" value="1.8" step="0.05"></label>
          </div>
          <div class="mag-control-group" data-control-modes="solenoid induction motor generator">
            <label>Espiras <output data-output="turns">180</output><input data-param="turns" type="range" min="20" max="900" value="180" step="10"></label>
          </div>
          <div class="mag-control-group" data-control-modes="solenoid">
            <label>Comprimento do solenoide <output data-output="solenoidLength">0,34 m</output><input data-param="solenoidLength" type="range" min="0.15" max="0.8" value="0.34" step="0.01"></label>
            <label>Núcleo<select data-param="coreMu"><option value="1">Ar · μr 1</option><option value="80">Ferrite · μr 80</option><option value="240">Ferro didático · μr 240</option></select></label>
          </div>
          <div class="mag-control-group" data-control-modes="induction motor">
            <label>Velocidade <output data-output="speed">1,00×</output><input data-param="speed" type="range" min="0.1" max="3" value="1" step="0.05"></label>
          </div>
          <div class="mag-control-group" data-control-modes="induction motor generator">
            <label>Intensidade magnética <output data-output="magnetStrength">0,48 T</output><input data-param="magnetStrength" type="range" min="0.05" max="1.2" value="0.48" step="0.01"></label>
          </div>
          <div class="mag-control-group" data-control-modes="generator">
            <label>Rotação <output data-output="rpm">900 rpm</output><input data-param="rpm" type="range" min="60" max="2400" value="900" step="10"></label>
            <label>Resistência da carga <output data-output="loadResistance">24 Ω</output><input data-param="loadResistance" type="range" min="2" max="100" value="24" step="1"></label>
          </div>
          <div class="mag-control-group" data-control-modes="transformer">
            <label>Espiras do primário <output data-output="primaryTurns">500</output><input data-param="primaryTurns" type="range" min="100" max="1200" value="500" step="10"></label>
            <label>Espiras do secundário <output data-output="secondaryTurns">220</output><input data-param="secondaryTurns" type="range" min="50" max="1400" value="220" step="10"></label>
            <label>Tensão do primário <output data-output="primaryVoltage">127 V</output><input data-param="primaryVoltage" type="range" min="12" max="240" value="127" step="1"></label>
            <label>Corrente do primário <output data-output="current">1,80 A</output><input data-param="current" type="range" min="0.1" max="5" value="1.8" step="0.05"></label>
            <label>Eficiência <output data-output="efficiency">92%</output><input data-param="efficiency" type="range" min="0.55" max="0.99" value="0.92" step="0.01"></label>
          </div>
          <div class="mag-toggles">
            <label class="switch"><input data-param="lines" type="checkbox" checked><span>Linhas de campo</span></label>
            <label class="switch"><input data-param="particles" type="checkbox" checked><span>Partículas de energia</span></label>
            <label class="switch" data-control-modes="magnets"><input data-param="filings" type="checkbox" checked><span>Limalha virtual</span></label>
          </div>
        </section>

        <section class="glass-card mag-practice">
          <div class="panel-title"><div><span>Investigação guiada</span><h2>Objetivo atual</h2></div><span class="status prototype">Prática</span></div>
          <p data-mag-practice></p>
          <div class="mag-practice__checklist">
            <label><input type="checkbox" data-practice-check> Alterei pelo menos dois parâmetros.</label>
            <label><input type="checkbox" data-practice-check> Comparei as leituras e a visualização 3D.</label>
            <label><input type="checkbox" data-practice-check> Registrei uma conclusão.</label>
          </div>
          <label>Conclusão<textarea data-mag-notes rows="3" placeholder="Registre o que mudou e explique a relação física observada."></textarea></label>
        </section>

        <details class="glass-card mag-model-info"><summary>Modelo científico e limitações</summary><p data-mag-model-info></p></details>
      </aside>
    </div>`;

  root.append(section);

  const controls = [...section.querySelectorAll('[data-param]')];
  const modeButtons = [...section.querySelectorAll('[data-mag-mode]')];
  const modeGroups = [...section.querySelectorAll('[data-control-modes]')];
  const notes = section.querySelector('[data-mag-notes]');
  const checks = [...section.querySelectorAll('[data-practice-check]')];
  let mode = saved?.mode && MODES[saved.mode] ? saved.mode : 'magnets';
  let latestState = {};
  let controller = null;
  let disposed = false;
  let lastDomUpdate = 0;

  function applySaved() {
    if (!saved?.params) return;
    controls.forEach((control) => {
      if (!(control.dataset.param in saved.params)) return;
      if (control.type === 'checkbox') control.checked = Boolean(saved.params[control.dataset.param]);
      else control.value = String(saved.params[control.dataset.param]);
    });
    notes.value = saved.notes || '';
    checks.forEach((check, index) => { check.checked = Boolean(saved.checks?.[index]); });
  }
  applySaved();

  function getValue(name, fallback = 0) {
    const matching = controls.filter((control) => control.dataset.param === name && !control.closest('[hidden]'));
    const control = matching[0] || controls.find((item) => item.dataset.param === name);
    if (!control) return fallback;
    if (control.type === 'checkbox') return control.checked;
    if (control.tagName === 'SELECT' && name === 'polarity') return control.value;
    return Number(control.value);
  }

  function params() {
    return {
      polarity: getValue('polarity', 'attract'), separation: getValue('separation', 2.9), probeX: getValue('probeX'), probeZ: getValue('probeZ', 2.1),
      current: getValue('current', 1.8), turns: getValue('turns', 180), solenoidLength: getValue('solenoidLength', 0.34), coreMu: getValue('coreMu', 1),
      speed: getValue('speed', 1), magnetStrength: getValue('magnetStrength', 0.48), rpm: getValue('rpm', 900), loadResistance: getValue('loadResistance', 24),
      primaryTurns: getValue('primaryTurns', 500), secondaryTurns: getValue('secondaryTurns', 220), primaryVoltage: getValue('primaryVoltage', 127), efficiency: getValue('efficiency', 0.92),
      lines: getValue('lines', true), particles: getValue('particles', true), filings: getValue('filings', true),
    };
  }

  function updateOutputs() {
    const values = params();
    const formatters = {
      separation: (v) => `${format(v, 2)} m`, probeX: (v) => `${format(v, 2)} m`, probeZ: (v) => `${format(v, 2)} m`, current: (v) => `${format(v, 2)} A`,
      turns: (v) => `${Math.round(v)}`, solenoidLength: (v) => `${format(v, 2)} m`, speed: (v) => `${format(v, 2)}×`, magnetStrength: (v) => `${format(v, 2)} T`,
      rpm: (v) => `${Math.round(v)} rpm`, loadResistance: (v) => `${Math.round(v)} Ω`, primaryTurns: (v) => `${Math.round(v)}`, secondaryTurns: (v) => `${Math.round(v)}`,
      primaryVoltage: (v) => `${Math.round(v)} V`, efficiency: (v) => `${Math.round(v * 100)}%`,
    };
    section.querySelectorAll('[data-output]').forEach((output) => {
      const name = output.dataset.output;
      output.textContent = formatters[name]?.(values[name]) ?? format(values[name]);
    });
  }

  function setReadout(name, value, unit = '') {
    section.querySelector(`[data-readout-${name}]`).textContent = value;
    section.querySelector(`[data-readout-${name}-unit]`).textContent = unit;
  }

  function updateReadouts(state) {
    if (mode === 'magnets') {
      setReadout('primary', `${format((state.field || 0) * 1e6, 2)}`, 'µT na sonda');
      setReadout('secondary', `${format(state.fieldVector?.x * 1e6 || 0, 2)} / ${format(state.fieldVector?.z * 1e6 || 0, 2)}`, 'Bx / Bz em µT');
      setReadout('power', params().polarity === 'attract' ? 'Atração' : 'Repulsão', 'configuração dos polos');
      setReadout('state', params().filings ? 'Limalha ativa' : 'Limalha oculta', 'orientação local do campo');
    } else if (mode === 'solenoid') {
      const model = state.solenoid || {};
      setReadout('primary', format(model.field, 4), 'T no modelo ideal');
      setReadout('secondary', format(model.inductance, 4), 'H de indutância');
      setReadout('power', format(model.power, 2), 'W dissipados');
      setReadout('state', format(model.temperature, 1), '°C estimados');
    } else if (mode === 'induction') {
      const model = state.induction || {};
      setReadout('primary', format(model.emf, 2), 'V de fem induzida');
      setReadout('secondary', format(model.flux, 4), 'Wb de fluxo');
      setReadout('power', format(model.velocity, 2), 'm/s do ímã');
      setReadout('state', model.emf >= 0 ? 'Sentido positivo' : 'Sentido negativo', 'Lei de Lenz');
    } else if (mode === 'motor') {
      const model = state.motor || {};
      setReadout('primary', format(model.torque, 2), 'N·m de torque');
      setReadout('secondary', format(model.mechanicalPower, 2), 'W mecânicos');
      setReadout('power', format(model.copperLoss, 2), 'W em perdas Joule');
      setReadout('state', `${format((model.efficiency || 0) * 100, 1)}`, '% de eficiência calculada');
    } else if (mode === 'generator') {
      const model = state.generator || {};
      setReadout('primary', format(model.rmsVoltage, 2), 'V eficazes');
      setReadout('secondary', format(model.current, 2), 'A na carga');
      setReadout('power', format(model.electricalPower, 2), 'W elétricos');
      setReadout('state', format(model.losses, 2), 'W em perdas');
    } else {
      const model = state.transformer || {};
      setReadout('primary', format(model.secondaryVoltage, 2), 'V no secundário');
      setReadout('secondary', format(model.secondaryCurrent, 2), 'A no secundário');
      setReadout('power', format(model.outputPower, 2), 'W de saída');
      setReadout('state', `${format((params().efficiency || 0) * 100, 1)}`, '% de eficiência');
    }
  }

  function updateMode(nextMode) {
    mode = MODES[nextMode] ? nextMode : 'magnets';
    const metadata = MODES[mode];
    modeButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.magMode === mode));
    modeGroups.forEach((group) => { group.hidden = !group.dataset.controlModes.split(' ').includes(mode); });
    section.querySelector('[data-mag-badge]').textContent = metadata.badge;
    section.querySelector('[data-mag-title]').textContent = metadata.label;
    section.querySelector('[data-mag-description]').textContent = metadata.description;
    section.querySelector('[data-mag-practice]').textContent = metadata.practice;
    section.querySelector('[data-parameters-title]').textContent = metadata.label;
    const labels = {
      magnets: ['Campo na sonda', 'Componentes Bx / Bz', 'Interação', 'Visualização'],
      solenoid: ['Campo interno', 'Indutância', 'Potência dissipada', 'Temperatura'],
      induction: ['Fem induzida', 'Fluxo magnético', 'Velocidade do ímã', 'Sentido da corrente'],
      motor: ['Torque', 'Potência mecânica', 'Perdas Joule', 'Eficiência'],
      generator: ['Tensão eficaz', 'Corrente na carga', 'Potência elétrica', 'Perdas'],
      transformer: ['Tensão secundária', 'Corrente secundária', 'Potência de saída', 'Eficiência'],
    }[mode];
    ['primary','secondary','power','state'].forEach((key, index) => { const node = section.querySelector(`[data-mag-readout-label="${key}"]`); if (node) node.textContent = labels[index]; });
    section.querySelector('[data-mag-model-info]').textContent = mode === 'magnets'
      ? 'As linhas e a limalha são visualizações amostradas do campo de dipolos magnéticos. Próximo às superfícies, o modelo é regularizado para estabilidade.'
      : mode === 'solenoid'
        ? 'O campo interno usa a aproximação de solenoide ideal. Bordas, saturação e histerese são simplificadas e explicitamente tratadas como aproximações didáticas.'
        : mode === 'induction'
          ? 'A fem segue a variação temporal do fluxo magnético. A animação do ímã é a entrada mecânica; o sinal da corrente acompanha a Lei de Lenz.'
          : mode === 'motor'
            ? 'O torque usa τ = N I A B senθ. Comutação, atrito e perdas mecânicas são representados de maneira educacional, não como projeto industrial.'
            : mode === 'generator'
              ? 'A tensão alternada usa ε = N B A ω sen(ωt). As perdas são aproximadas por uma eficiência configurada para o conjunto eletromecânico.'
              : 'O transformador usa relações ideais de espiras com eficiência configurável. Fluxo disperso, saturação e harmônicos são simplificados.';
    controller?.setMode(mode);
    updateOutputs();
  }

  controls.forEach((control) => control.addEventListener('input', updateOutputs));
  modeButtons.forEach((button) => button.addEventListener('click', () => updateMode(button.dataset.magMode)));
  const playButton = section.querySelector('[data-mag-play]');
  playButton.addEventListener('click', () => { const active = playButton.getAttribute('aria-pressed') !== 'true'; playButton.setAttribute('aria-pressed', String(active)); playButton.querySelector('span:last-child').textContent = active ? 'Pausar' : 'Continuar'; controller?.setPlaying?.(active); });
  section.querySelector('[data-mag-reset-camera]').addEventListener('click', () => controller?.resetCamera());
  section.querySelector('[data-mag-restart]').addEventListener('click', () => controller?.restart?.());
  section.querySelector('[data-mag-fullscreen]').addEventListener('click', () => controller?.fullscreen());
  section.querySelector('[data-mag-auto]').addEventListener('click', (event) => {
    const button = event.currentTarget;
    const active = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(active));
    button.classList.toggle('is-active', active);
    button.querySelector('span:last-child').textContent = active ? 'Câmera automática' : 'Câmera manual';
    controller?.setAutoCamera(active);
  });

  function snapshot() {
    return { version: '0.5.0', timestamp: new Date().toISOString(), mode, params: params(), notes: notes.value, checks: checks.map((check) => check.checked), readings: latestState };
  }
  section.querySelector('[data-mag-save]').addEventListener('click', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()));
    const status = section.querySelector('[data-model-status]'); status.textContent = 'Experiência salva'; status.className = 'status ready';
  });
  section.querySelector('[data-mag-export]').addEventListener('click', () => download(`evidencia-eletromagnetismo-${mode}.json`, JSON.stringify(snapshot(), null, 2)));

  const r3Guide = mountR3Guidance({ section, lab: 'magnetism', paramAttribute: 'data-param', modeSelector: '[data-mag-mode]', getMode: () => mode, setMode: updateMode, restart: () => controller?.restart?.(), refresh: updateOutputs });
  updateMode(mode);
  mountMagnetism3D({
    container: section.querySelector('[data-mag-stage]'),
    statusElement: section.querySelector('[data-mag-status]'),
    getSettings,
    getParams: params,
    onModeChange: (activeMode) => { if (activeMode !== mode) mode = activeMode; },
    onState: (state) => {
      latestState = state;
      const now = performance.now();
      if (now - lastDomUpdate > 100) { updateReadouts(state); lastDomUpdate = now; }
    },
  }).then((api) => {
    if (disposed) api.dispose();
    else { controller = api; controller.setMode(mode); }
  }).catch((error) => {
    if (disposed) return;
    section.querySelector('[data-mag-status]').textContent = 'Modo 2D ativo · cena 3D indisponível.';
    reportRuntimeIssue(error, { label: 'Eletromagnetismo em modo 2D', source: 'magnetism3d' });
  });

  return () => { disposed = true; r3Guide.dispose(); controller?.dispose(); };
}
