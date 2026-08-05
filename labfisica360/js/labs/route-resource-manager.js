import { getRuntimeSnapshot } from '../render/runtime-registry.js';
import { reportRuntimeIssue } from '../stability.js';

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

function memorySnapshot() {
  const memory = performance?.memory;
  return memory ? {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
  } : null;
}

export class RouteResourceManager {
  constructor({ session } = {}) {
    this.session = session;
    this.activeRoute = null;
    this.styles = new Map();
    this.report = [];
  }

  renderLoader(root, definition) {
    const shell = document.createElement('section');
    shell.className = 'demand-loader';
    shell.innerHTML = `
      <div class="demand-loader__visual" aria-hidden="true"><span></span><span></span><span></span></div>
      <div><span class="badge">Carregamento sob demanda</span><h1>Abrindo ${definition.title}</h1>
      <p data-demand-message>Preparando somente os arquivos necessários para este laboratório…</p>
      <div class="progress"><span data-demand-progress></span></div>
      <small>Nenhum outro ambiente 3D está sendo carregado.</small></div>`;
    root.replaceChildren(shell);
    return {
      set(progress, message) {
        const bar = shell.querySelector('[data-demand-progress]');
        const copy = shell.querySelector('[data-demand-message]');
        if (bar) bar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
        if (copy && message) copy.textContent = message;
      },
      dispose() { shell.remove(); },
    };
  }

  async loadStyle(href) {
    if (this.styles.has(href)) {
      const entry = this.styles.get(href);
      entry.references += 1;
      return entry.link;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.routeStyle = href;
    const loaded = new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve(link), 3500);
      link.addEventListener('load', () => { clearTimeout(timer); resolve(link); }, { once: true });
      link.addEventListener('error', () => { clearTimeout(timer); reject(new Error(`Falha ao carregar estilo: ${href}`)); }, { once: true });
    });
    this.styles.set(href, { link, references: 1 });
    document.head.append(link);
    await loaded;
    return link;
  }

  releaseStyle(href) {
    const entry = this.styles.get(href);
    if (!entry) return;
    entry.references -= 1;
    if (entry.references > 0) return;
    entry.link.remove();
    this.styles.delete(href);
  }

  async open(definition, root, context = {}) {
    const started = performance.now();
    const memoryBefore = memorySnapshot();
    const loader = this.renderLoader(root, definition);
    const loadedStyles = [];
    let moduleCleanup = null;
    let routeClosed = false;

    this.activeRoute = definition.route;
    this.session?.enterRoute(definition.route, { kind: definition.kind, title: definition.title });
    document.body.dataset.routeLoading = definition.route;
    window.dispatchEvent(new CustomEvent('fisica:route-load-start', { detail: { route: definition.route, kind: definition.kind } }));

    try {
      const styles = [...new Set(definition.styles || [])];
      for (let index = 0; index < styles.length; index += 1) {
        loader.set(10 + Math.round((index / Math.max(1, styles.length)) * 35), `Carregando interface de ${definition.title}…`);
        await this.loadStyle(styles[index]);
        loadedStyles.push(styles[index]);
      }
      loader.set(55, 'Carregando lógica científica do laboratório…');
      const module = await definition.load();
      const renderer = module[definition.render];
      if (typeof renderer !== 'function') throw new Error(`Exportação ${definition.render} não encontrada.`);
      loader.set(78, 'Montando controles e cenário…');
      root.replaceChildren();
      const result = renderer(root, context);
      moduleCleanup = result && typeof result.then === 'function' ? await result : result;
      loader.set(100, 'Laboratório pronto.');
      const durationMs = Math.round(performance.now() - started);
      const entry = {
        route: definition.route,
        kind: definition.kind,
        loadedAt: new Date().toISOString(),
        durationMs,
        styles: loadedStyles.length,
        runtimeCount: getRuntimeSnapshot().activeCount,
        memoryBefore,
        memoryAfter: memorySnapshot(),
      };
      this.report.push(entry);
      window.dispatchEvent(new CustomEvent('fisica:route-load-complete', { detail: entry }));
    } catch (error) {
      loadedStyles.reverse().forEach((href) => this.releaseStyle(href));
      this.session?.leaveRoute(definition.route, { reason: 'load-error' });
      reportRuntimeIssue(error, { label: 'Falha no carregamento sob demanda', source: definition.route });
      throw error;
    } finally {
      delete document.body.dataset.routeLoading;
      loader.dispose();
    }

    return async () => {
      if (routeClosed) return;
      routeClosed = true;
      const cleanupStarted = performance.now();
      document.body.dataset.routeUnloading = definition.route;
      try {
        if (typeof moduleCleanup === 'function') await moduleCleanup();
      } catch (error) {
        reportRuntimeIssue(error, { label: 'Falha ao liberar laboratório', source: definition.route });
      }
      this.session?.leaveRoute(definition.route, { reason: 'navigation' });
      window.dispatchEvent(new CustomEvent('fisica:lab-unload', { detail: { route: definition.route } }));
      root.replaceChildren();
      loadedStyles.reverse().forEach((href) => this.releaseStyle(href));
      await nextFrame();
      const runtimeSnapshot = getRuntimeSnapshot();
      const report = {
        route: definition.route,
        unloadedAt: new Date().toISOString(),
        cleanupMs: Math.round(performance.now() - cleanupStarted),
        activeRuntimes: runtimeSnapshot.activeCount,
        stylesRemaining: this.styles.size,
        memoryAfterCleanup: memorySnapshot(),
      };
      this.report.push(report);
      if (runtimeSnapshot.activeCount > 0) {
        reportRuntimeIssue(new Error(`${runtimeSnapshot.activeCount} runtime(s) ainda ativo(s).`), {
          label: 'Laboratório não liberou toda a renderização', source: definition.route,
        });
      }
      if (this.activeRoute === definition.route) this.activeRoute = null;
      delete document.body.dataset.routeUnloading;
      window.dispatchEvent(new CustomEvent('fisica:route-resources-released', { detail: report }));
    };
  }

  getReport() {
    return { activeRoute: this.activeRoute, loadedStyles: [...this.styles.keys()], entries: [...this.report] };
  }
}
