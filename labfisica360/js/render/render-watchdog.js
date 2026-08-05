export function createRenderWatchdog({ timeout = 7000, onTimeout = () => {}, onReady = () => {} } = {}) {
  let timer = 0;
  let startedAt = 0;
  let ready = false;
  function start() {
    if (ready || timer) return;
    startedAt = performance.now();
    timer = window.setTimeout(() => {
      timer = 0;
      if (!ready) onTimeout({ elapsedMs: Math.round(performance.now() - startedAt) });
    }, timeout);
  }
  function markReady(detail = {}) {
    if (ready) return;
    ready = true;
    clearTimeout(timer);
    timer = 0;
    onReady({ ...detail, firstFrameMs: Math.round(performance.now() - startedAt) });
  }
  function dispose() { clearTimeout(timer); timer = 0; }
  return { start, markReady, dispose, get ready() { return ready; } };
}
