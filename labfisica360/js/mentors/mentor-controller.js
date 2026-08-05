import { MENTORS, ROUTE_LABELS, getMentor } from './mentor-catalog.js';
import { getMentorTrack } from './tracks/core-tracks.js';
import { MentorHighlightEngine } from './highlight-engine.js';
import { findStepTarget, stepMatchesEvent } from './step-validator.js';

const PROGRESS_KEY = 'fisica-imersiva-360.mentor-progress.v1';

function safeParse(raw, fallback) { try { return JSON.parse(raw || '') ?? fallback; } catch { return fallback; } }
function nowIso() { return new Date().toISOString(); }
function downloadJson(payload, name) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = Object.assign(document.createElement('a'), { href: url, download: name });
  anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function defaultProgress() { return { version: 1, createdAt: nowIso(), updatedAt: nowIso(), mentors: {} }; }
function normalizeProgress(raw) {
  const value = raw && typeof raw === 'object' ? raw : defaultProgress();
  return { version: 1, createdAt: value.createdAt || nowIso(), updatedAt: value.updatedAt || nowIso(), mentors: value.mentors || {} };
}
function routeProgress(progress, mentorId, route) {
  progress.mentors[mentorId] ||= { routes: {}, startedAt: nowIso(), updatedAt: nowIso() };
  progress.mentors[mentorId].routes[route] ||= { currentStep: 0, completed: {}, startedAt: nowIso(), updatedAt: nowIso(), completedAt: null, hintsUsed: 0 };
  return progress.mentors[mentorId].routes[route];
}
function completedCount(routeState, track) { return track.steps.filter((step) => routeState.completed[step.id]).length; }

export class MentorController {
  constructor({ getSettings = () => ({}), updateSettings = () => {}, navigate = () => {}, session = null } = {}) {
    this.getSettings = getSettings;
    this.updateSettings = updateSettings;
    this.navigate = navigate;
    this.session = session;
    this.currentRoute = null;
    this.currentRoot = null;
    this.track = null;
    this.routeState = null;
    this.listeners = [];
    this.progress = normalizeProgress(safeParse(localStorage.getItem(PROGRESS_KEY), null));
    this.highlight = new MentorHighlightEngine({ reduceMotion: this.getSettings().reduceMotion });
    this.buildUI();
  }

  buildUI() {
    this.dialog = document.createElement('dialog');
    this.dialog.className = 'modal mentor-selector';
    this.dialog.id = 'mentor-selector-dialog';
    this.dialog.innerHTML = `<form method="dialog" class="modal__card mentor-selector__card">
      <div class="modal__head"><div><small>Modo guiado histórico</small><h2>Escolha quem inspira sua trilha</h2></div><button aria-label="Fechar">×</button></div>
      <p class="mentor-selector__notice">As trilhas são inspiradas na obra e no contexto histórico dessas personalidades. Os textos não simulam falas reais.</p>
      <div class="mentor-mode-choice" role="group" aria-label="Escolher modo de aprendizagem">
        <button type="button" data-learning-mode="free"><strong>Modo Livre</strong><span>Explore ferramentas e laboratórios no seu ritmo.</span></button>
        <button type="button" data-learning-mode="mentor" class="is-active"><strong>Modo Guiado</strong><span>Siga etapas com controles destacados e checkpoints.</span></button>
      </div>
      <div class="mentor-grid"></div>
      <footer class="mentor-selector__footer"><button type="button" data-mentor-export>Exportar progresso guiado</button><button value="cancel">Fechar</button></footer>
    </form>`;
    document.body.append(this.dialog);

    const grid = this.dialog.querySelector('.mentor-grid');
    MENTORS.forEach((mentor) => {
      const card = document.createElement('article');
      card.className = 'mentor-card';
      card.style.setProperty('--mentor-accent', mentor.accent);
      card.dataset.mentorCard = mentor.id;
      card.innerHTML = `<div class="mentor-card__portrait" aria-hidden="true"><span>${mentor.initials}</span><i>${mentor.icon}</i></div>
        <div class="mentor-card__identity"><small>${mentor.years}</small><h3>${mentor.name}</h3><strong>${mentor.field}</strong></div>
        <p>${mentor.description}</p>
        <ol>${mentor.routeOrder.map((route) => `<li>${ROUTE_LABELS[route] || route}</li>`).join('')}</ol>
        <div class="mentor-card__progress"><i><b data-mentor-card-bar></b></i><small data-mentor-card-progress>0% concluído</small></div>
        <div class="mentor-card__meta"><span>≈ ${mentor.estimatedMinutes} min</span><span>${mentor.routeOrder.length} laboratórios</span></div>
        <button type="button" data-select-mentor="${mentor.id}">Começar trilha</button>`;
      grid.append(card);
    });

    this.hud = document.createElement('aside');
    this.hud.className = 'mentor-hud';
    this.hud.hidden = true;
    this.hud.innerHTML = `<div class="mentor-hud__identity"><span data-mentor-avatar>AE</span><div><small>TRILHA INSPIRADA EM</small><strong data-mentor-name>Mentor</strong></div></div>
      <div class="mentor-hud__progress"><span data-mentor-counter>1/4</span><i><b data-mentor-bar></b></i></div>
      <div class="mentor-hud__instruction" id="mentor-guided-instruction"><small data-mentor-step-title>Próxima ação</small><p data-mentor-step-text></p><em data-mentor-observation></em></div>
      <div class="mentor-hud__actions"><button type="button" data-mentor-hint>Dica</button><button type="button" data-mentor-speak>Ler</button><button type="button" data-mentor-manual hidden>Concluir observação</button><button type="button" data-mentor-next hidden>Próximo laboratório</button><button type="button" data-mentor-open>Trilha</button><button type="button" data-mentor-free>Modo livre</button></div>`;
    document.querySelector('#app')?.append(this.hud);

    this.toast = document.createElement('div');
    this.toast.className = 'mentor-toast'; this.toast.hidden = true;
    document.body.append(this.toast);

    this.dialog.addEventListener('click', (event) => {
      const mode = event.target.closest('[data-learning-mode]')?.dataset.learningMode;
      if (mode === 'free') this.setFreeMode();
      if (mode === 'mentor') this.dialog.querySelector('.mentor-grid')?.scrollIntoView({ block: 'nearest' });
      const mentorId = event.target.closest('[data-select-mentor]')?.dataset.selectMentor;
      if (mentorId) this.selectMentor(mentorId, { start: true });
      if (event.target.closest('[data-mentor-export]')) this.exportProgress();
    });
    this.hud.querySelector('[data-mentor-open]').addEventListener('click', () => this.openSelector());
    this.hud.querySelector('[data-mentor-free]').addEventListener('click', () => this.setFreeMode());
    this.hud.querySelector('[data-mentor-manual]').addEventListener('click', () => this.completeCurrentStep('manual'));
    this.hud.querySelector('[data-mentor-next]').addEventListener('click', () => this.navigateNextRoute());
    this.hud.querySelector('[data-mentor-hint]').addEventListener('click', () => this.useHint());
    this.hud.querySelector('[data-mentor-speak]').addEventListener('click', () => this.speakCurrentStep());
  }

  save() {
    this.progress.updatedAt = nowIso();
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.progress));
    window.dispatchEvent(new CustomEvent('fisica:mentor-progress', { detail: this.getSummary() }));
  }

  getSummary() {
    const settings = this.getSettings();
    const mentor = getMentor(settings.mentorId);
    const routes = mentor.routeOrder.map((route) => {
      const track = getMentorTrack(mentor.id, route);
      const state = routeProgress(this.progress, mentor.id, route);
      return { route, title: track?.title || route, completed: track ? completedCount(state, track) : 0, total: track?.steps.length || 0, completedAt: state.completedAt };
    });
    const completed = routes.reduce((sum, route) => sum + route.completed, 0);
    const total = routes.reduce((sum, route) => sum + route.total, 0);
    return { learningMode: settings.learningMode || 'free', mentor, routes, completed, total, percentage: total ? Math.round(completed / total * 100) : 0 };
  }

  openSelector() {
    const settings = this.getSettings();
    this.dialog.querySelectorAll('[data-learning-mode]').forEach((button) => button.classList.toggle('is-active', button.dataset.learningMode === (settings.learningMode || 'free')));
    this.dialog.querySelectorAll('[data-mentor-card]').forEach((card) => {
      const mentorId = card.dataset.mentorCard;
      card.classList.toggle('is-selected', mentorId === settings.mentorId);
      const mentor = getMentor(mentorId);
      let completed = 0; let total = 0;
      mentor.routeOrder.forEach((route) => { const track = getMentorTrack(mentorId, route); const state = routeProgress(this.progress, mentorId, route); completed += completedCount(state, track); total += track.steps.length; });
      const percentage = total ? Math.round(completed / total * 100) : 0;
      card.querySelector('[data-mentor-card-bar]').style.width = `${percentage}%`;
      card.querySelector('[data-mentor-card-progress]').textContent = `${percentage}% concluído`;
    });
    if (!this.dialog.open) this.dialog.showModal();
  }

  selectMentor(mentorId, { start = false } = {}) {
    const mentor = getMentor(mentorId);
    this.updateSettings({ learningMode: 'mentor', mentorId: mentor.id });
    this.session?.recordLearningMode?.({ mode: 'mentor', mentorId: mentor.id, trackId: `${mentor.id}-expanded-r9-2` });
    this.dialog.close();
    this.showToast(`Trilha de ${mentor.name} ativada.`);
    if (start) this.navigate(mentor.routeOrder[0]);
    else if (this.currentRoute) this.attachRoute(this.currentRoute, this.currentRoot);
  }

  setFreeMode() {
    this.updateSettings({ learningMode: 'free', mentorId: null });
    this.session?.recordLearningMode?.({ mode: 'free', mentorId: null, trackId: null });
    this.detachRoute();
    this.dialog.close();
    this.showToast('Modo Livre ativado. Explore sem sequência obrigatória.');
  }

  attachRoute(route, root) {
    this.detachRoute();
    const settings = this.getSettings();
    if (settings.learningMode !== 'mentor' || !settings.mentorId || !root) return;
    const mentor = getMentor(settings.mentorId);
    const track = getMentorTrack(mentor.id, route);
    if (!track) return;
    this.currentRoute = route;
    this.currentRoot = root;
    this.track = track;
    this.routeState = routeProgress(this.progress, mentor.id, route);
    this.routeState.updatedAt = nowIso();
    this.session?.recordLearningMode?.({ mode: 'mentor', mentorId: mentor.id, trackId: `${mentor.id}-expanded-r9-2` });
    this.session?.recordMentorStep?.({ mentorId: mentor.id, route, stepId: this.currentStep()?.id || null, status: 'route-open' });
    const handler = (event) => {
      const step = this.currentStep();
      if (stepMatchesEvent(step, event, event.target)) this.completeCurrentStep(event.type);
    };
    ['click', 'input', 'change'].forEach((type) => {
      root.addEventListener(type, handler, true);
      this.listeners.push(() => root.removeEventListener(type, handler, true));
    });
    this.hud.hidden = false;
    this.render();
    this.save();
  }

  detachRoute() {
    this.listeners.splice(0).forEach((remove) => remove());
    this.highlight.clear();
    this.hud.hidden = true;
    this.currentRoute = null; this.currentRoot = null; this.track = null; this.routeState = null;
  }

  currentStep() {
    if (!this.track || !this.routeState) return null;
    const firstIncomplete = this.track.steps.findIndex((step) => !this.routeState.completed[step.id]);
    const index = firstIncomplete < 0 ? this.track.steps.length : firstIncomplete;
    this.routeState.currentStep = index;
    return this.track.steps[index] || null;
  }

  completeCurrentStep(source = 'interaction') {
    const step = this.currentStep();
    if (!step || !this.routeState) return;
    const mentorId = this.getSettings().mentorId;
    this.routeState.completed[step.id] = { at: nowIso(), source };
    this.routeState.updatedAt = nowIso();
    this.session?.recordMentorStep?.({ mentorId, route: this.currentRoute, stepId: step.id, status: 'completed', source });
    const complete = completedCount(this.routeState, this.track) === this.track.steps.length;
    if (complete) this.routeState.completedAt = this.routeState.completedAt || nowIso();
    this.save();
    this.showToast(complete ? 'Laboratório concluído na trilha.' : `Etapa concluída: ${step.title}`);
    this.render();
  }

  useHint() {
    const step = this.currentStep();
    if (!step || !this.routeState) return;
    this.routeState.hintsUsed += 1;
    this.session?.recordMentorStep?.({ mentorId: this.getSettings().mentorId, route: this.currentRoute, stepId: step.id, status: 'hint' });
    this.showToast(step.observation || step.instruction);
    this.save();
  }

  render() {
    if (!this.track || !this.routeState) return;
    const mentor = getMentor(this.getSettings().mentorId);
    const step = this.currentStep();
    const done = completedCount(this.routeState, this.track);
    this.hud.style.setProperty('--mentor-accent', mentor.accent);
    this.hud.querySelector('[data-mentor-avatar]').textContent = mentor.initials;
    this.hud.querySelector('[data-mentor-name]').textContent = mentor.name;
    this.hud.querySelector('[data-mentor-counter]').textContent = `${Math.min(done + 1, this.track.steps.length)}/${this.track.steps.length}`;
    this.hud.querySelector('[data-mentor-bar]').style.width = `${Math.round(done / this.track.steps.length * 100)}%`;
    const manual = this.hud.querySelector('[data-mentor-manual]');
    const nextButton = this.hud.querySelector('[data-mentor-next]');
    this.highlight.clear();
    this.hud.classList.toggle('mentor-hud--complete', !step);
    if (!step) {
      this.hud.classList.remove('mentor-hud--top');
      this.hud.querySelector('[data-mentor-step-title]').textContent = 'Experiência concluída';
      this.hud.querySelector('[data-mentor-step-text]').textContent = this.track.question;
      this.hud.querySelector('[data-mentor-observation]').textContent = 'Abra a trilha para escolher o próximo laboratório.';
      manual.hidden = true; nextButton.hidden = false;
      return;
    }
    this.hud.querySelector('[data-mentor-step-title]').textContent = step.title;
    this.hud.querySelector('[data-mentor-step-text]').textContent = step.instruction;
    this.hud.querySelector('[data-mentor-observation]').textContent = step.observation || '';
    manual.hidden = step.event !== 'manual'; nextButton.hidden = true;
    const target = findStepTarget(this.currentRoot, step);
    if (target) {
      this.highlight.focus(target, step.title);
      setTimeout(() => {
        const rect = target.getBoundingClientRect();
        this.hud.classList.toggle('mentor-hud--top', rect.top > window.innerHeight * 0.44);
      }, this.getSettings().reduceMotion ? 0 : 380);
    }
    else {
      this.hud.querySelector('[data-mentor-observation]').textContent = 'A ferramenta desta etapa ainda está sendo preparada. Use Dica ou reabra o laboratório.';
    }
  }

  speakCurrentStep() {
    const step = this.currentStep();
    if (!step || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') { this.showToast('Leitura por voz indisponível neste navegador.'); return; }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${step.title}. ${step.instruction}. ${step.observation || ''}`);
    utterance.lang = 'pt-BR'; utterance.rate = 0.95; speechSynthesis.speak(utterance);
  }

  navigateNextRoute() {
    const mentor = getMentor(this.getSettings().mentorId);
    const currentIndex = mentor.routeOrder.indexOf(this.currentRoute);
    const ordered = [...mentor.routeOrder.slice(currentIndex + 1), ...mentor.routeOrder.slice(0, Math.max(0, currentIndex))];
    const next = ordered.find((route) => { const track = getMentorTrack(mentor.id, route); const state = routeProgress(this.progress, mentor.id, route); return completedCount(state, track) < track.steps.length; }) || mentor.routeOrder[(currentIndex + 1) % mentor.routeOrder.length];
    if (next) this.navigate(next);
  }

  showToast(message) {
    this.toast.textContent = message;
    this.toast.hidden = false;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toast.hidden = true; }, 3200);
  }

  exportProgress() {
    const payload = {
      platform: 'Física Imersiva 360', version: '0.5.0', generatedAt: nowIso(),
      settings: { learningMode: this.getSettings().learningMode, mentorId: this.getSettings().mentorId },
      summary: this.getSummary(), progress: this.progress,
      disclaimer: 'Trilhas inspiradas na obra e no contexto histórico. Não representam falas literais das personalidades.',
    };
    downloadJson(payload, `fisica-mentores-${this.getSettings().mentorId || 'livre'}-${new Date().toISOString().slice(0, 10)}.json`);
    return payload;
  }

  dispose() {
    this.detachRoute();
    this.highlight.dispose();
    clearTimeout(this.toastTimer);
    this.dialog.remove(); this.hud.remove(); this.toast.remove();
  }
}
