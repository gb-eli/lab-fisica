import { reportRuntimeIssue } from './stability.js';

export class Router {
  constructor(view, routes, { afterNavigate, fallbackRoute = 'home' } = {}) {
    this.view = view;
    this.routes = routes;
    this.afterNavigate = afterNavigate;
    this.fallbackRoute = routes[fallbackRoute] ? fallbackRoute : Object.keys(routes)[0];
    this.cleanup = null;
    this.currentRoute = null;
    this.navigationId = 0;
    this.onHashChange = () => {
      const route = location.hash.slice(1);
      this.navigate(route, { fromHistory: true, replace: true });
    };
    window.addEventListener('hashchange', this.onHashChange);
  }

  async runCleanup() {
    const cleanup = this.cleanup;
    this.cleanup = null;
    if (typeof cleanup !== 'function') return;
    try { await cleanup(); }
    catch (error) { reportRuntimeIssue(error, { label: 'Falha ao fechar laboratório', source: this.currentRoute || 'router' }); }
  }

  renderError(error, routeName) {
    reportRuntimeIssue(error, { label: 'Falha ao abrir laboratório', source: routeName });
    const card = document.createElement('section');
    card.className = 'route-error';
    card.innerHTML = `
      <span class="badge">Recuperação segura</span>
      <h1>Este laboratório não conseguiu iniciar.</h1>
      <p>Você pode tentar novamente, abrir a lista de laboratórios ou continuar no modo estável 2D.</p>
      <div class="route-error__actions">
        <button class="primary" data-route-retry>Tentar novamente</button>
        <button data-route-safe>Usar modo 2D</button>
        <button data-route-labs>Laboratórios</button>
      </div>`;
    card.querySelector('[data-route-retry]').addEventListener('click', () => this.navigate(routeName, { reload: true }));
    card.querySelector('[data-route-safe]').addEventListener('click', () => window.dispatchEvent(new CustomEvent('fisica:requestsafe2d', { detail: { route: routeName } })));
    card.querySelector('[data-route-labs]').addEventListener('click', () => this.navigate('roadmap'));
    this.view.append(card);
  }

  async navigate(name, options = {}) {
    const routeName = this.routes[name] ? name : this.fallbackRoute;
    if (routeName === this.currentRoute && !options.reload && !options.fromHistory) return;
    const navigationId = ++this.navigationId;
    await this.runCleanup();
    if (navigationId !== this.navigationId) return;

    this.currentRoute = routeName;
    this.view.setAttribute('aria-busy', 'true');
    this.view.replaceChildren();
    const route = this.routes[routeName];

    try {
      const result = route(this.view, options);
      const cleanup = result && typeof result.then === 'function' ? await result : result;
      if (navigationId !== this.navigationId) {
        if (typeof cleanup === 'function') await cleanup();
        return;
      }
      this.cleanup = typeof cleanup === 'function' ? cleanup : null;
    } catch (error) {
      if (navigationId !== this.navigationId) return;
      this.renderError(error, routeName);
    }

    document.querySelectorAll('[data-route]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.route === routeName);
      if (button.dataset.route === routeName) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });

    const hash = `#${routeName}`;
    if (location.hash !== hash) {
      if (options.replace || options.fromHistory) history.replaceState(null, '', hash);
      else history.pushState(null, '', hash);
    }
    try {
      window.scrollTo(0, 0);
      this.view.scrollTop = 0;
      this.afterNavigate?.(routeName, this.view);
    } catch (error) {
      reportRuntimeIssue(error, { label: 'Falha ao organizar a interface', source: routeName });
    } finally {
      this.view.removeAttribute('aria-busy');
      this.view.focus({ preventScroll: true });
      window.dispatchEvent(new CustomEvent('fisica:route-ready', { detail: { route: routeName } }));
    }
  }

  dispose() {
    window.removeEventListener('hashchange', this.onHashChange);
    return this.runCleanup();
  }
}
