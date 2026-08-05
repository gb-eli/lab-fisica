const STORAGE_KEY = 'fisica-imersiva-360.usage-validation.v1';

export const QUALITY_PROFILES = ['economic', 'medium', 'high', 'ultra'];
export const VALIDATION_ROUTES = ['coulomb', 'ohm', 'magnetism', 'energy', 'mechanics', 'waves', 'thermal', 'advanced'];
export const VALIDATION_CRITERIA = ['visual360', 'touch', 'readability', 'accessibility', 'performance', 'scientificCoherence'];

const LABELS = {
  routes: {
    coulomb: 'Eletrostática', ohm: 'Eletricidade', magnetism: 'Eletromagnetismo', energy: 'Energia',
    mechanics: 'Mecânica', waves: 'Ondas e Óptica', thermal: 'Termofluidos', advanced: 'Física Avançada',
  },
  profiles: { economic: 'Econômico', medium: 'Médio', high: 'Alto', ultra: 'Ultra' },
  criteria: {
    visual360: 'Cena 3D/360°', touch: 'Toque e câmera', readability: 'Legibilidade',
    accessibility: 'Acessibilidade', performance: 'Desempenho', scientificCoherence: 'Coerência científica',
  },
  states: { pending: 'Pendente', pass: 'Aprovado', warning: 'Ressalva', fail: 'Falhou' },
};

function safeParse(raw, fallback) {
  try { return JSON.parse(raw); } catch { return fallback; }
}

export function createUsageValidationEntry({ route = 'coulomb', profile = 'medium', device = '', criteria = {}, notes = '' } = {}) {
  return {
    id: `${route}:${profile}`,
    route: VALIDATION_ROUTES.includes(route) ? route : 'coulomb',
    profile: QUALITY_PROFILES.includes(profile) ? profile : 'medium',
    device: String(device).slice(0, 100),
    criteria: Object.fromEntries(VALIDATION_CRITERIA.map((key) => [key, ['pending', 'pass', 'warning', 'fail'].includes(criteria[key]) ? criteria[key] : 'pending'])),
    notes: String(notes).slice(0, 2000),
    updatedAt: new Date().toISOString(),
  };
}

export function loadUsageValidationMatrix() {
  if (typeof localStorage === 'undefined') return [];
  const value = safeParse(localStorage.getItem(STORAGE_KEY) || '[]', []);
  return Array.isArray(value) ? value.map((item) => createUsageValidationEntry(item)) : [];
}

export function saveUsageValidationEntry(entry) {
  const normalized = createUsageValidationEntry(entry);
  const matrix = loadUsageValidationMatrix().filter((item) => item.id !== normalized.id);
  matrix.push(normalized);
  matrix.sort((a, b) => VALIDATION_ROUTES.indexOf(a.route) - VALIDATION_ROUTES.indexOf(b.route) || QUALITY_PROFILES.indexOf(a.profile) - QUALITY_PROFILES.indexOf(b.profile));
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(matrix));
  return normalized;
}

export function summarizeUsageValidation(matrix = []) {
  const entries = matrix.map((item) => createUsageValidationEntry(item));
  const total = VALIDATION_ROUTES.length * QUALITY_PROFILES.length;
  const completed = entries.filter((item) => VALIDATION_CRITERIA.every((key) => item.criteria[key] !== 'pending')).length;
  const failures = entries.filter((item) => Object.values(item.criteria).includes('fail')).length;
  const warnings = entries.filter((item) => !Object.values(item.criteria).includes('fail') && Object.values(item.criteria).includes('warning')).length;
  const passes = entries.filter((item) => Object.values(item.criteria).every((state) => state === 'pass')).length;
  return { total, completed, pending: Math.max(0, total - completed), failures, warnings, passes, percentage: Math.round((completed / total) * 100) };
}

function download(content, type, filename) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = Object.assign(document.createElement('a'), { href: url, download: filename });
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportUsageValidationJSON() {
  const matrix = loadUsageValidationMatrix();
  download(JSON.stringify({ platform: 'Física Imersiva 360', version: '0.5.0', exportedAt: new Date().toISOString(), summary: summarizeUsageValidation(matrix), matrix }, null, 2), 'application/json', `fisica-imersiva-validacao-uso-${new Date().toISOString().slice(0, 10)}.json`);
}

export function exportUsageValidationCSV() {
  const matrix = loadUsageValidationMatrix();
  const header = ['laboratorio', 'perfil', 'aparelho', ...VALIDATION_CRITERIA, 'observacoes', 'atualizado_em'];
  const rows = matrix.map((item) => [LABELS.routes[item.route], LABELS.profiles[item.profile], item.device, ...VALIDATION_CRITERIA.map((key) => item.criteria[key]), item.notes, item.updatedAt]);
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  download(csv, 'text/csv;charset=utf-8', `fisica-imersiva-validacao-uso-${new Date().toISOString().slice(0, 10)}.csv`);
}

function optionMarkup(values, labels) {
  return values.map((value) => `<option value="${value}">${labels[value]}</option>`).join('');
}

export function renderUsageValidation(container, { currentRoute = 'coulomb' } = {}) {
  if (!container) return { setRoute() {}, refresh() {} };
  container.innerHTML = `
    <div class="usage-validation__head">
      <div><small>Teste orientado por laboratório</small><h3>Perfis gráficos e acessibilidade</h3></div>
      <span class="status" data-usage-summary>Pendente</span>
    </div>
    <p class="usage-validation__intro">Execute cada laboratório nos perfis Econômico, Médio, Alto e Ultra. Registre o que realmente foi observado no aparelho; não marque como aprovado sem testar.</p>
    <div class="usage-validation__selectors">
      <label>Laboratório<select data-usage-route>${optionMarkup(VALIDATION_ROUTES, LABELS.routes)}</select></label>
      <label>Perfil<select data-usage-profile>${optionMarkup(QUALITY_PROFILES, LABELS.profiles)}</select></label>
      <label>Aparelho<input data-usage-device maxlength="100" placeholder="Ex.: Chromebook · Chrome · paisagem"></label>
    </div>
    <div class="usage-validation__criteria">
      ${VALIDATION_CRITERIA.map((key) => `<label>${LABELS.criteria[key]}<select data-usage-criterion="${key}">${optionMarkup(['pending', 'pass', 'warning', 'fail'], LABELS.states)}</select></label>`).join('')}
    </div>
    <label>Observações<textarea data-usage-notes placeholder="Descreva sobreposição, dificuldade de toque, queda de FPS, problema de contraste ou divergência entre cálculo e animação."></textarea></label>
    <div class="usage-validation__actions">
      <button type="button" data-usage-save>Salvar teste</button>
      <button type="button" data-usage-json>Exportar JSON</button>
      <button type="button" data-usage-csv>Exportar CSV</button>
    </div>
    <output data-usage-feedback aria-live="polite"></output>
    <div class="usage-validation__matrix" data-usage-matrix></div>`;

  const routeSelect = container.querySelector('[data-usage-route]');
  const profileSelect = container.querySelector('[data-usage-profile]');
  const deviceInput = container.querySelector('[data-usage-device]');
  const notes = container.querySelector('[data-usage-notes]');
  const criteriaSelects = [...container.querySelectorAll('[data-usage-criterion]')];
  const feedback = container.querySelector('[data-usage-feedback]');
  const summaryBadge = container.querySelector('[data-usage-summary]');
  const matrixRoot = container.querySelector('[data-usage-matrix]');

  function findEntry() {
    return loadUsageValidationMatrix().find((item) => item.route === routeSelect.value && item.profile === profileSelect.value) || createUsageValidationEntry({ route: routeSelect.value, profile: profileSelect.value });
  }

  function loadForm() {
    const entry = findEntry();
    deviceInput.value = entry.device;
    notes.value = entry.notes;
    criteriaSelects.forEach((select) => { select.value = entry.criteria[select.dataset.usageCriterion]; });
  }

  function renderMatrix() {
    const matrix = loadUsageValidationMatrix();
    const summary = summarizeUsageValidation(matrix);
    summaryBadge.textContent = `${summary.completed}/${summary.total}`;
    summaryBadge.dataset.state = summary.failures ? 'reprovado' : summary.warnings ? 'com-ressalvas' : summary.completed === summary.total ? 'aprovado' : 'pendente';
    matrixRoot.replaceChildren(...VALIDATION_ROUTES.map((route) => {
      const row = document.createElement('div'); row.className = 'usage-validation__row';
      const name = document.createElement('strong'); name.textContent = LABELS.routes[route]; row.append(name);
      QUALITY_PROFILES.forEach((profile) => {
        const entry = matrix.find((item) => item.route === route && item.profile === profile);
        const cell = document.createElement('span');
        const states = entry ? Object.values(entry.criteria) : ['pending'];
        cell.dataset.state = states.includes('fail') ? 'fail' : states.includes('warning') ? 'warning' : states.every((state) => state === 'pass') ? 'pass' : 'pending';
        cell.textContent = LABELS.profiles[profile];
        cell.title = entry ? `${LABELS.routes[route]} · ${LABELS.profiles[profile]} · ${cell.dataset.state}` : 'Ainda não testado';
        row.append(cell);
      });
      return row;
    }));
  }

  function save() {
    const criteria = Object.fromEntries(criteriaSelects.map((select) => [select.dataset.usageCriterion, select.value]));
    const entry = saveUsageValidationEntry({ route: routeSelect.value, profile: profileSelect.value, device: deviceInput.value, criteria, notes: notes.value });
    feedback.textContent = `Teste salvo para ${LABELS.routes[entry.route]} no perfil ${LABELS.profiles[entry.profile]}.`;
    renderMatrix();
  }

  routeSelect.value = VALIDATION_ROUTES.includes(currentRoute) ? currentRoute : 'coulomb';
  profileSelect.value = 'medium';
  routeSelect.addEventListener('change', loadForm);
  profileSelect.addEventListener('change', loadForm);
  container.querySelector('[data-usage-save]').addEventListener('click', save);
  container.querySelector('[data-usage-json]').addEventListener('click', exportUsageValidationJSON);
  container.querySelector('[data-usage-csv]').addEventListener('click', exportUsageValidationCSV);
  loadForm(); renderMatrix();

  return {
    setRoute(route) { if (VALIDATION_ROUTES.includes(route)) { routeSelect.value = route; loadForm(); } },
    refresh: renderMatrix,
  };
}
