import { getLab } from '../labs/lab-catalog.js';

const PROFILE_KEY = 'fisica-imersiva-360.student-profile.v1';
const SESSION_KEY = 'fisica-imersiva-360.student-session.v1';
const HISTORY_KEY = 'fisica-imersiva-360.student-session-history.v1';
const MAX_HISTORY = 12;
const MAX_EVENTS = 420;
const MAX_ACTIONS = 260;

function safeParse(value, fallback) {
  try { return JSON.parse(value || '') ?? fallback; } catch { return fallback; }
}
function read(key, fallback = null) {
  try { return safeParse(localStorage.getItem(key), fallback); } catch { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
function remove(key) {
  try { localStorage.removeItem(key); } catch { /* armazenamento indisponível */ }
}
function cleanText(value, max = 80) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}
function isoNow() { return new Date().toISOString(); }
function hashPin(value = '') {
  const pin = String(value || '').trim();
  let hash = 2166136261;
  for (let index = 0; index < pin.length; index += 1) {
    hash ^= pin.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
function cleanAction(value, max = 90) {
  return cleanText(value, max).replace(/[<>]/g, '');
}
function sessionId() {
  return `fis-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
function download(name, contents, type) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function createSession(profile) {
  return {
    id: sessionId(),
    version: 1,
    startedAt: isoNow(),
    updatedAt: isoNow(),
    endedAt: null,
    profile: { ...profile },
    activeRoute: null,
    activeSince: null,
    routes: {},
    learning: { mode: 'free', mentorId: null, trackId: null, mentorSteps: [] },
    events: [{ type: 'session-start', at: isoNow() }],
    actions: [],
  };
}

export class StudentSessionManager {
  constructor() {
    this.profile = read(PROFILE_KEY, null);
    this.session = read(SESSION_KEY, null);
    if (this.session?.endedAt) this.session = null;
    if (this.profile && !this.session) this.session = createSession(this.profile);
    this.listeners = new Set();
    this.lastTick = performance.now();
    this.lastUiNotify = this.lastTick;
    this.visible = !document.hidden;
    this.boundVisibility = () => this.handleVisibility();
    this.boundBeforeUnload = () => this.persist();
    document.addEventListener('visibilitychange', this.boundVisibility);
    window.addEventListener('pagehide', this.boundBeforeUnload);
    this.timer = window.setInterval(() => this.tick(), 1000);
    this.persist();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  notify() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
    window.dispatchEvent(new CustomEvent('fisica:student-session-change', { detail: snapshot }));
  }

  login({ name, className, shift, pin }) {
    const profile = {
      name: cleanText(name, 70),
      className: cleanText(className, 40),
      shift: ['manha', 'tarde', 'noite'].includes(shift) ? shift : 'manha',
      createdAt: isoNow(),
      pinHash: hashPin(pin),
    };
    if (!profile.name || !profile.className) throw new Error('Informe o nome e a turma.');
    if (!/^\d{4,12}$/.test(String(pin || '').trim())) throw new Error('Informe um PIN numérico de 4 a 12 dígitos.');
    if (this.session && !this.session.endedAt) this.finalize('student-switch');
    this.profile = profile;
    this.session = createSession(profile);
    write(PROFILE_KEY, profile);
    this.persist();
    this.notify();
    return this.getSnapshot();
  }

  tick() {
    const now = performance.now();
    const delta = Math.max(0, Math.min(5, (now - this.lastTick) / 1000));
    this.lastTick = now;
    if (!this.session || !this.visible || !this.session.activeRoute) return;
    const route = this.session.routes[this.session.activeRoute];
    if (!route) return;
    route.activeSeconds = Number((route.activeSeconds + delta).toFixed(2));
    this.session.updatedAt = isoNow();
    if (now - this.lastUiNotify >= 5000) {
      this.lastUiNotify = now;
      this.persist();
      this.notify();
    }
  }

  handleVisibility() {
    this.tick();
    this.visible = !document.hidden;
    this.lastTick = performance.now();
    if (this.session) {
      this.session.events.push({ type: this.visible ? 'resume' : 'pause', at: isoNow(), route: this.session.activeRoute });
      this.session.events = this.session.events.slice(-120);
      this.persist();
    }
  }

  enterRoute(routeName, meta = {}) {
    this.tick();
    if (!this.session && this.profile) this.session = createSession(this.profile);
    if (!this.session) return;
    if (this.session.activeRoute && this.session.activeRoute !== routeName) this.leaveRoute(this.session.activeRoute, { reason: 'route-change' });
    const lab = getLab(routeName);
    const current = this.session.routes[routeName] || {
      route: routeName,
      title: meta.title || lab.shortTitle || lab.title || routeName,
      kind: meta.kind || 'page',
      visits: 0,
      activeSeconds: 0,
      firstOpenedAt: isoNow(),
      lastOpenedAt: null,
      lastClosedAt: null,
    };
    current.visits += 1;
    current.lastOpenedAt = isoNow();
    current.kind = meta.kind || current.kind;
    this.session.routes[routeName] = current;
    this.session.activeRoute = routeName;
    this.session.activeSince = isoNow();
    this.session.events.push({ type: 'route-open', at: isoNow(), route: routeName, kind: current.kind });
    this.session.events = this.session.events.slice(-120);
    this.persist();
    this.notify();
  }

  leaveRoute(routeName, { reason = 'close' } = {}) {
    this.tick();
    if (!this.session) return;
    const route = this.session.routes[routeName];
    if (route) route.lastClosedAt = isoNow();
    this.session.events.push({ type: 'route-close', at: isoNow(), route: routeName, reason });
    this.session.events = this.session.events.slice(-120);
    if (this.session.activeRoute === routeName) {
      this.session.activeRoute = null;
      this.session.activeSince = null;
    }
    this.persist();
    this.notify();
  }

  recordLearningMode({ mode = 'free', mentorId = null, trackId = null } = {}) {
    if (!this.session) return;
    this.session.learning ||= { mode: 'free', mentorId: null, trackId: null, mentorSteps: [] };
    this.session.learning.mode = mode === 'mentor' ? 'mentor' : 'free';
    this.session.learning.mentorId = mentorId || null;
    this.session.learning.trackId = trackId || null;
    this.session.events.push({ type: 'learning-mode', at: isoNow(), mode: this.session.learning.mode, mentorId: this.session.learning.mentorId, trackId: this.session.learning.trackId });
    this.session.events = this.session.events.slice(-180);
    this.persist(); this.notify();
  }

  recordMentorStep({ mentorId, route, stepId, status, source = null } = {}) {
    if (!this.session) return;
    this.session.learning ||= { mode: 'mentor', mentorId: mentorId || null, trackId: null, mentorSteps: [] };
    this.session.learning.mentorSteps ||= [];
    const item = { at: isoNow(), mentorId: mentorId || null, route: route || null, stepId: stepId || null, status: status || 'event', source };
    this.session.learning.mentorSteps.push(item);
    this.session.learning.mentorSteps = this.session.learning.mentorSteps.slice(-240);
    this.session.events.push({ type: 'mentor-step', ...item });
    this.session.events = this.session.events.slice(-180);
    this.persist(); this.notify();
  }

  recordAction({ route = null, action = 'interaction', target = null, label = null, inputType = null } = {}) {
    if (!this.session) return false;
    const activeRoute = route || this.session.activeRoute;
    if (!activeRoute) return false;
    const item = {
      type: 'lab-action', at: isoNow(), route: activeRoute,
      action: cleanAction(action, 40), target: cleanAction(target, 80) || null,
      label: cleanAction(label, 90) || null, inputType: cleanAction(inputType, 30) || null,
    };
    this.session.actions ||= [];
    this.session.actions.push(item);
    this.session.actions = this.session.actions.slice(-MAX_ACTIONS);
    this.session.events.push(item);
    this.session.events = this.session.events.slice(-MAX_EVENTS);
    const routeState = this.session.routes[activeRoute];
    if (routeState) routeState.actions = (routeState.actions || 0) + 1;
    this.session.updatedAt = item.at;
    this.persist();
    return true;
  }

  finalize(reason = 'logout') {
    this.tick();
    if (!this.session) return null;
    if (this.session.activeRoute) this.leaveRoute(this.session.activeRoute, { reason });
    this.session.endedAt = isoNow();
    this.session.events.push({ type: 'session-end', at: this.session.endedAt, reason });
    const finished = structuredClone(this.session);
    const history = read(HISTORY_KEY, []);
    history.unshift(finished);
    write(HISTORY_KEY, history.slice(0, MAX_HISTORY));
    remove(SESSION_KEY);
    this.session = null;
    return finished;
  }

  logout() {
    const finished = this.finalize('logout');
    this.profile = null;
    remove(PROFILE_KEY);
    this.notify();
    return finished;
  }

  switchStudent() {
    const finished = this.finalize('student-switch');
    this.profile = null;
    remove(PROFILE_KEY);
    this.notify();
    return finished;
  }

  persist() {
    if (this.profile) write(PROFILE_KEY, this.profile);
    if (this.session) write(SESSION_KEY, this.session);
  }

  getSnapshot() {
    const session = this.session ? structuredClone(this.session) : null;
    if (session?.profile) delete session.profile.pinHash;
    const routes = session ? Object.values(session.routes).sort((a, b) => b.activeSeconds - a.activeSeconds) : [];
    const labs = routes.filter((route) => route.kind === 'lab');
    return {
      loggedIn: Boolean(this.profile),
      profile: this.profile ? { ...this.profile, pinHash: undefined } : null,
      session,
      routes,
      labs,
      totalActiveSeconds: routes.reduce((sum, route) => sum + route.activeSeconds, 0),
      labActiveSeconds: labs.reduce((sum, route) => sum + route.activeSeconds, 0),
      historyCount: read(HISTORY_KEY, []).length,
    };
  }

  exportJSON({ includeHistory = false } = {}) {
    this.tick();
    const snapshot = this.getSnapshot();
    const payload = {
      platform: 'Física Imersiva 360',
      version: '0.5.0',
      generatedAt: isoNow(),
      current: snapshot,
      history: includeHistory ? read(HISTORY_KEY, []) : undefined,
    };
    const label = cleanText(snapshot.profile?.name || 'visitante', 30).replace(/[^a-zA-Z0-9À-ÿ_-]+/g, '-');
    download(`sessao-fisica-${label}.json`, JSON.stringify(payload, null, 2), 'application/json');
    return payload;
  }

  exportCSV() {
    this.tick();
    const snapshot = this.getSnapshot();
    const header = ['Estudante', 'Turma', 'Turno', 'Modo', 'Mentor', 'Laboratório', 'Tipo', 'Acessos', 'Ações', 'Tempo ativo (s)', 'Etapas guiadas', 'Primeiro acesso', 'Último acesso'];
    const rows = snapshot.routes.map((route) => [
      snapshot.profile?.name || 'Visitante', snapshot.profile?.className || '', snapshot.profile?.shift || '',
      snapshot.session?.learning?.mode || 'free', snapshot.session?.learning?.mentorId || '', route.title, route.kind, route.visits, route.actions || 0, Math.round(route.activeSeconds),
      (snapshot.session?.learning?.mentorSteps || []).filter((item) => item.route === route.route && item.status === 'completed').length, route.firstOpenedAt, route.lastOpenedAt,
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(';')).join('\n');
    const label = cleanText(snapshot.profile?.name || 'visitante', 30).replace(/[^a-zA-Z0-9À-ÿ_-]+/g, '-');
    download(`sessao-fisica-${label}.csv`, `\uFEFF${csv}`, 'text/csv;charset=utf-8');
    return csv;
  }

  dispose() {
    this.tick();
    this.persist();
    clearInterval(this.timer);
    document.removeEventListener('visibilitychange', this.boundVisibility);
    window.removeEventListener('pagehide', this.boundBeforeUnload);
    this.listeners.clear();
  }
}

export function formatDuration(seconds = 0) {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours) return `${hours}h ${minutes}min`;
  if (minutes) return `${minutes}min ${secs}s`;
  return `${secs}s`;
}

export function shiftLabel(value) {
  return ({ manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' })[value] || 'Não informado';
}
