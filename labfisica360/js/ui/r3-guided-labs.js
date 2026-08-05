const PRESETS = Object.freeze({
  magnetism: [
    { id: 'magnets-attract', mode: 'magnets', title: 'Atração entre polos', question: 'Como a distância altera a intensidade do campo entre polos opostos?', observe: 'Compare o campo na sonda antes e depois de aproximar os ímãs.', steps: ['Aplique o cenário', 'Mude somente a separação', 'Compare campo e direção'], values: { polarity: 'attract', separation: 2.9, probeX: 0, probeZ: 1.2, lines: true, particles: true, filings: true } },
    { id: 'magnets-repel', mode: 'magnets', title: 'Repulsão entre polos', question: 'Como o sentido do campo muda quando polos iguais ficam frente a frente?', observe: 'Observe a orientação da limalha e o vetor na sonda central.', steps: ['Aplique a repulsão', 'Mova a sonda pelo centro', 'Compare Bx e Bz'], values: { polarity: 'repel', separation: 2.45, probeX: 0, probeZ: 0.4, lines: true, particles: false, filings: true } },
    { id: 'solenoid-air', mode: 'solenoid', title: 'Solenoide com núcleo de ar', question: 'Como corrente e espiras modificam o campo de um solenoide?', observe: 'Dobre a corrente mantendo as demais variáveis fixas.', steps: ['Use núcleo de ar', 'Altere a corrente', 'Compare campo e potência'], values: { current: 1.2, turns: 180, solenoidLength: 0.4, coreMu: 1, lines: true, particles: true } },
    { id: 'solenoid-ferrite', mode: 'solenoid', title: 'Eletroímã com ferrite', question: 'Qual é o efeito do material do núcleo sobre o campo?', observe: 'Compare com o cenário de núcleo de ar sem alterar corrente ou espiras.', steps: ['Aplique ferrite', 'Mantenha corrente', 'Compare campo e aquecimento'], values: { current: 1.2, turns: 180, solenoidLength: 0.4, coreMu: 80, lines: true, particles: true } },
    { id: 'induction-slow', mode: 'induction', title: 'Indução lenta', question: 'Como a velocidade do ímã altera a fem induzida?', observe: 'Use este cenário como referência e depois aplique o rápido.', steps: ['Observe o movimento', 'Leia fluxo e fem', 'Registre o sinal'], values: { speed: 0.7, turns: 220, magnetStrength: 0.4, lines: true, particles: true } },
    { id: 'induction-fast', mode: 'induction', title: 'Indução rápida', question: 'Por que a fem aumenta quando o fluxo varia mais rapidamente?', observe: 'Compare amplitude e inversão de sinal com o cenário lento.', steps: ['Aumente a velocidade', 'Compare a fem', 'Explique Faraday–Lenz'], values: { speed: 2.2, turns: 420, magnetStrength: 0.65, lines: true, particles: true } },
    { id: 'motor-safe', mode: 'motor', title: 'Motor em operação segura', question: 'Como corrente e campo controlam o torque do motor?', observe: 'Aumente uma variável por vez e acompanhe torque, potência e perdas.', steps: ['Inicie moderado', 'Altere corrente ou campo', 'Compare eficiência'], values: { current: 1.4, turns: 180, speed: 1, magnetStrength: 0.45, lines: true, particles: true } },
    { id: 'generator-reference', mode: 'generator', title: 'Gerador de referência', question: 'Como a rotação modifica a tensão gerada?', observe: 'Compare 900 rpm com 1800 rpm sem alterar a carga.', steps: ['Leia a tensão eficaz', 'Dobre a rotação', 'Compare potência e perdas'], values: { turns: 240, magnetStrength: 0.5, rpm: 900, loadResistance: 24, lines: true, particles: true } },
    { id: 'transformer-stepdown', mode: 'transformer', title: 'Transformador abaixador', question: 'Como a relação de espiras determina tensão e corrente?', observe: 'Compare as grandezas do primário e do secundário.', steps: ['Aplique a relação', 'Leia tensão de saída', 'Compare potência e eficiência'], values: { primaryTurns: 500, secondaryTurns: 220, primaryVoltage: 127, current: 1.2, efficiency: 0.92, lines: true, particles: true } },
    { id: 'transformer-stepup', mode: 'transformer', title: 'Transformador elevador', question: 'O que muda quando o secundário possui mais espiras?', observe: 'Compare tensão e corrente com o cenário abaixador.', steps: ['Aplique o elevador', 'Leia o secundário', 'Explique a conservação de potência'], values: { primaryTurns: 300, secondaryTurns: 720, primaryVoltage: 24, current: 1.5, efficiency: 0.9, lines: true, particles: true } },
  ],
  energy: [
    { id: 'house-essential', mode: 'house', title: 'Consumo essencial', question: 'Quais cargas dominam o consumo cotidiano?', observe: 'Ligue uma carga por vez e compare potência, corrente e custo.', steps: ['Comece com cargas leves', 'Ligue uma carga potente', 'Compare consumo mensal'], values: { voltage: 127, tariff: 0.92, ambient: 27, leakageMa: 4 }, enabled: ['lighting','fridge','computer'] },
    { id: 'house-peak', mode: 'house', title: 'Pico residencial', question: 'O que acontece quando cargas de alta potência funcionam juntas?', observe: 'Compare corrente e proteção com o cenário essencial.', steps: ['Aplique o pico', 'Observe os ramos', 'Identifique o circuito crítico'], values: { voltage: 127, tariff: 0.92, ambient: 32, leakageMa: 8 }, enabled: ['lighting','fridge','microwave','computer','washer','aircon','shower'] },
    { id: 'protection-leak', mode: 'protection', title: 'Fuga e atuação do DR', question: 'Por que o DR atua mesmo sem sobrecarga térmica?', observe: 'Compare 12 mA e 38 mA de fuga.', steps: ['Aplique fuga segura', 'Eleve para 38 mA', 'Diferencie DR e disjuntor'], values: { voltage: 127, ambient: 27, leakageMa: 38 }, enabled: ['lighting','fridge','computer'] },
    { id: 'protection-overload', mode: 'protection', title: 'Sobrecarga sem fuga', question: 'Como corrente elevada aquece o condutor e aciona o disjuntor?', observe: 'Mantenha fuga baixa e observe temperatura e estado dos ramos.', steps: ['Zere a fuga', 'Ligue cargas pesadas', 'Identifique o ramo sobrecarregado'], values: { voltage: 127, ambient: 38, leakageMa: 2 }, enabled: ['microwave','washer','aircon','shower'] },
    { id: 'microgrid-import', mode: 'microgrid', title: 'Casa importando energia', question: 'Quando a geração local não atende à demanda?', observe: 'Acompanhe a direção das partículas e a potência da rede.', steps: ['Reduza a irradiância', 'Observe a bateria', 'Leia a importação'], values: { voltage: 127, solarRatedKw: 3.2, irradiance: 320, cellTemperature: 48, shading: 0.28, windSpeed: 3, batteryPower: 0, batterySoc: 0.45 }, enabled: ['lighting','fridge','computer','aircon'] },
    { id: 'microgrid-export', mode: 'microgrid', title: 'Excedente renovável', question: 'Quando a residência passa a exportar energia?', observe: 'Compare geração, demanda, bateria e sentido do fluxo.', steps: ['Aumente a irradiância', 'Reduza o sombreamento', 'Confirme a exportação'], values: { voltage: 127, solarRatedKw: 7.5, irradiance: 1050, cellTemperature: 39, shading: 0.02, windSpeed: 9, batteryPower: -1.2, batterySoc: 0.72 }, enabled: ['lighting','fridge','computer'] },
    { id: 'network-short', mode: 'network', title: 'Rede curta e eficiente', question: 'Como comprimento e resistência influenciam a tensão entregue?', observe: 'Use este cenário como referência antes da rede longa.', steps: ['Leia tensão entregue', 'Observe perdas', 'Registre a referência'], values: { voltage: 220, communityLoad: 32, communityGeneration: 8, lineLength: 0.25, lineResistance: 0.16, transformerEfficiency: 0.98 } },
    { id: 'network-long', mode: 'network', title: 'Rede longa com perdas', question: 'Por que a queda de tensão aumenta em linhas longas?', observe: 'Compare corrente, tensão entregue e perdas totais.', steps: ['Aumente o comprimento', 'Observe o transformador', 'Compare com a rede curta'], values: { voltage: 220, communityLoad: 75, communityGeneration: 5, lineLength: 3.2, lineResistance: 0.55, transformerEfficiency: 0.9 } },
  ],
  mechanics: [
    { id: 'dynamics-static', mode: 'dynamics', title: 'Equilíbrio na rampa', question: 'Quando o atrito estático consegue impedir o movimento?', observe: 'Aumente lentamente o ângulo até o estado mudar.', steps: ['Aplique o equilíbrio', 'Aumente o ângulo', 'Identifique o limiar'], values: { mass: 2, rampAngle: 16, muStatic: 0.42, muKinetic: 0.28, appliedForce: 0, gravity: 9.81 } },
    { id: 'dynamics-moving', mode: 'dynamics', title: 'Deslizamento na rampa', question: 'Como o atrito cinético altera a aceleração?', observe: 'Compare a força resultante com o cenário de equilíbrio.', steps: ['Aplique o movimento', 'Mude o atrito cinético', 'Compare aceleração'], values: { mass: 2, rampAngle: 38, muStatic: 0.3, muKinetic: 0.16, appliedForce: 0, gravity: 9.81 } },
    { id: 'projectile-ideal', mode: 'projectile', title: 'Lançamento ideal a 45°', question: 'Por que 45° maximiza o alcance no modelo ideal?', observe: 'Compare 30°, 45° e 60° mantendo a velocidade.', steps: ['Aplique 45°', 'Mude apenas o ângulo', 'Compare alcance e altura'], values: { mass: 1, launchSpeed: 20, launchAngle: 45, launchHeight: 0, dragCoefficient: 0, gravity: 9.81 } },
    { id: 'projectile-drag', mode: 'projectile', title: 'Lançamento com arrasto', question: 'Como a resistência do ar altera trajetória e impacto?', observe: 'Compare alcance e velocidade de impacto com o modelo ideal.', steps: ['Aplique o arrasto', 'Observe a trajetória', 'Compare os resultados'], values: { mass: 1, launchSpeed: 20, launchAngle: 45, launchHeight: 0, dragCoefficient: 0.18, gravity: 9.81 } },
    { id: 'collision-elastic', mode: 'collision', title: 'Colisão elástica', question: 'Como o momento é redistribuído sem perda relevante de energia?', observe: 'Compare momento antes/depois e energia retida.', steps: ['Aplique e = 1', 'Observe as velocidades', 'Confirme o momento'], values: { mass1: 2, velocity1: 4, mass2: 1, velocity2: -1, restitution: 1 } },
    { id: 'collision-inelastic', mode: 'collision', title: 'Colisão inelástica', question: 'Para onde vai a energia mecânica que não permanece no movimento?', observe: 'Compare energia retida e velocidades finais.', steps: ['Aplique e = 0', 'Observe os carrinhos', 'Compare momento e energia'], values: { mass1: 2, velocity1: 4, mass2: 1, velocity2: -1, restitution: 0 } },
    { id: 'oscillator-pendulum', mode: 'oscillators', title: 'Pêndulo de referência', question: 'Qual variável altera principalmente o período do pêndulo?', observe: 'Mude comprimento sem alterar a massa.', steps: ['Aplique o pêndulo', 'Mude o comprimento', 'Compare o período'], values: { oscillator: 'pendulum', massOsc: 1.2, pendulumLength: 2, pendulumAngle: 20, springConstant: 18, amplitude: 0.8, damping: 0.12, gravity: 9.81 } },
    { id: 'oscillator-spring', mode: 'oscillators', title: 'Massa-mola', question: 'Como massa e constante elástica alteram a frequência?', observe: 'Dobre a massa e depois a constante, uma variável por vez.', steps: ['Aplique a mola', 'Mude massa ou k', 'Compare período e energia'], values: { oscillator: 'spring', massOsc: 1.2, pendulumLength: 2, pendulumAngle: 20, springConstant: 18, amplitude: 0.8, damping: 0.12, gravity: 9.81 } },
    { id: 'gravity-earth', mode: 'gravity', title: 'Queda e órbita na Terra', question: 'Como gravidade e altura determinam queda e órbita?', observe: 'Use esta referência antes de trocar o corpo celeste.', steps: ['Aplique Terra', 'Leia tempo de queda', 'Observe a órbita'], values: { celestialBody: 'earth', dropHeight: 50, initialVelocity: 0, orbitAltitude: 400, gravity: 9.81 } },
    { id: 'gravity-moon', mode: 'gravity', title: 'Comparação com a Lua', question: 'Por que a queda é mais lenta e a órbita diferente na Lua?', observe: 'Mantenha altura e compare tempo, impacto e velocidade orbital.', steps: ['Aplique Lua', 'Compare a queda', 'Compare a órbita'], values: { celestialBody: 'moon', dropHeight: 50, initialVelocity: 0, orbitAltitude: 100, gravity: 1.62 } },
  ],
});

function text(value) { return String(value ?? '').replace(/\s+/g, ' ').trim(); }
function modeFromButton(button) { return Object.entries(button.dataset).find(([key]) => /Mode$/.test(key))?.[1] || ''; }

function assignValue(section, attribute, name, value) {
  const selector = `[${attribute}="${name}"]`;
  const nodes = [...section.querySelectorAll(selector)];
  nodes.forEach((node) => {
    if (node.type === 'checkbox') node.checked = Boolean(value);
    else node.value = String(value);
    node.dispatchEvent(new Event(node.type === 'checkbox' || node.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
}

function assignLoads(section, enabled = []) {
  const selected = new Set(enabled);
  section.querySelectorAll('[data-load]').forEach((node) => {
    node.checked = selected.has(node.dataset.load);
    node.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

export function mountR3Guidance({
  section, lab, paramAttribute, modeSelector, getMode, setMode, restart, refresh,
}) {
  const presets = PRESETS[lab] || [];
  const controlsRoot = section.querySelector(`.${lab === 'magnetism' ? 'magnetism' : lab}-controls`);
  const modePanel = controlsRoot?.querySelector(':scope > .glass-card');
  if (!controlsRoot || !modePanel || !presets.length) return { dispose() {} };
  const panel = document.createElement('section');
  panel.className = 'glass-card r3-guided-card';
  panel.dataset.r3Lab = lab;
  panel.innerHTML = `
    <div class="r3-guided-card__head"><div><span>Roteiro rápido</span><h2>Cenário recomendado</h2></div><b data-r3-step-counter>1/3</b></div>
    <label class="r3-guided-card__select">Comparação<select data-r3-preset></select></label>
    <div class="r3-guided-card__question"><span>Pergunta</span><strong data-r3-question></strong></div>
    <ol data-r3-steps></ol>
    <p class="r3-guided-card__observe"><b>Observe:</b> <span data-r3-observe></span></p>
    <div class="r3-guided-card__actions">
      <button type="button" data-r3-apply>Aplicar cenário</button>
      <button type="button" data-r3-next>Próxima etapa</button>
      <button type="button" data-r3-restart>Reiniciar</button>
    </div>
    <small data-r3-status>Escolha um cenário e aplique os valores de referência.</small>`;
  modePanel.insertAdjacentElement('afterend', panel);
  const select = panel.querySelector('[data-r3-preset]');
  const modeButtons = [...section.querySelectorAll(modeSelector)];
  let step = 0;

  const currentPresets = () => {
    const mode = getMode();
    return presets.filter((preset) => preset.mode === mode);
  };
  const selectedPreset = () => presets.find((preset) => preset.id === select.value) || currentPresets()[0] || presets[0];
  const render = (preferId = '') => {
    const available = currentPresets();
    select.innerHTML = available.map((preset) => `<option value="${preset.id}">${preset.title}</option>`).join('');
    if (preferId && available.some((preset) => preset.id === preferId)) select.value = preferId;
    const preset = selectedPreset();
    step = Math.min(step, 2);
    panel.querySelector('[data-r3-question]').textContent = preset.question;
    panel.querySelector('[data-r3-observe]').textContent = preset.observe;
    panel.querySelector('[data-r3-steps]').innerHTML = preset.steps.map((item, index) => `<li class="${index === step ? 'is-current' : index < step ? 'is-complete' : ''}">${item}</li>`).join('');
    panel.querySelector('[data-r3-step-counter]').textContent = `${step + 1}/3`;
  };
  const apply = (preset = selectedPreset(), message = 'Cenário aplicado. Altere uma variável por vez.') => {
    if (getMode() !== preset.mode) setMode(preset.mode);
    Object.entries(preset.values || {}).forEach(([name, value]) => assignValue(section, paramAttribute, name, value));
    if (preset.enabled) assignLoads(section, preset.enabled);
    step = 0;
    refresh?.();
    restart?.();
    render(preset.id);
    panel.querySelector('[data-r3-status]').textContent = message;
  };
  const onMode = () => { step = 0; queueMicrotask(() => render()); };
  const onSelect = () => { step = 0; render(select.value); };
  const onApply = () => apply();
  const onNext = () => { step = (step + 1) % 3; render(select.value); panel.querySelector('[data-r3-status]').textContent = step ? 'Continue a comparação e observe a leitura destacada.' : 'Roteiro reiniciado na primeira etapa.'; };
  const onRestart = () => apply(selectedPreset(), 'Cenário restaurado aos valores de referência.');
  select.addEventListener('change', onSelect);
  panel.querySelector('[data-r3-apply]').addEventListener('click', onApply);
  panel.querySelector('[data-r3-next]').addEventListener('click', onNext);
  panel.querySelector('[data-r3-restart]').addEventListener('click', onRestart);
  modeButtons.forEach((button) => button.addEventListener('click', onMode));
  render();
  return { applyCurrent: onRestart, dispose() {
    select.removeEventListener('change', onSelect);
    panel.querySelector('[data-r3-apply]').removeEventListener('click', onApply);
    panel.querySelector('[data-r3-next]').removeEventListener('click', onNext);
    panel.querySelector('[data-r3-restart]').removeEventListener('click', onRestart);
    modeButtons.forEach((button) => button.removeEventListener('click', onMode));
    panel.remove();
  } };
}

export const R3_PRESETS = PRESETS;
