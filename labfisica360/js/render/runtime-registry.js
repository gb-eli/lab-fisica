const runtimes = new Map();
let sequence = 0;

export function registerRuntime(metadata = {}) {
  const id = `runtime-${++sequence}`;
  runtimes.set(id, { id, metadata, report: null, adaptive: null, startedAt: new Date().toISOString() });
  return id;
}

export function updateRuntime(id, patch = {}) {
  const current = runtimes.get(id);
  if (!current) return;
  runtimes.set(id, { ...current, ...patch });
}

export function unregisterRuntime(id) { runtimes.delete(id); }

export function getRuntimeSnapshot() {
  const entries = [...runtimes.values()];
  return {
    activeCount: entries.length,
    runtimes: entries.map((entry) => ({ ...entry })),
    latest: entries.map((entry) => entry.report).filter(Boolean).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)))[0] || null,
  };
}
