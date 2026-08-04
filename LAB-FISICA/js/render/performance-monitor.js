export function percentile(values, ratio) {
  if (!values?.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(ratio * sorted.length) - 1));
  return sorted[index];
}

export function classifyPerformance({ fps = 0, fpsLow = 0, frameTimeP95 = 0 }, targetFps = 52) {
  const targetFrame = 1000 / Math.max(1, targetFps);
  if (fps >= targetFps * 0.9 && fpsLow >= targetFps * 0.68 && frameTimeP95 <= targetFrame * 1.5) return 'stable';
  if (fps >= targetFps * 0.68 && frameTimeP95 <= targetFrame * 2.4) return 'constrained';
  return 'critical';
}

export class PerformanceMonitor {
  constructor({ renderer, targetFps = 52, onScaleChange, onReport, reportInterval = 1000 }) {
    this.renderer = renderer;
    this.targetFps = targetFps;
    this.onScaleChange = onScaleChange;
    this.onReport = onReport;
    this.reportInterval = reportInterval;
    this.frameTimes = [];
    this.lastReport = performance.now();
    this.cooldownUntil = 0;
    this.dynamicScale = 1;
    this.pressureScore = 0;
    this.lastReportValue = null;
  }

  reset() {
    this.frameTimes.length = 0;
    this.pressureScore = 0;
    this.lastReport = performance.now();
    this.lastReportValue = null;
  }

  frame(delta, now = performance.now()) {
    if (delta > 0 && delta < 0.25) this.frameTimes.push(delta * 1000);
    if (this.frameTimes.length > 240) this.frameTimes.shift();
    if (now - this.lastReport < this.reportInterval) return;

    const frameAverage = this.frameTimes.length
      ? this.frameTimes.reduce((sum, value) => sum + value, 0) / this.frameTimes.length
      : 0;
    const frameTimeP95 = percentile(this.frameTimes, 0.95);
    const fps = frameAverage > 0 ? 1000 / frameAverage : 0;
    const fpsLow = frameTimeP95 > 0 ? 1000 / frameTimeP95 : 0;
    const info = this.renderer.info;
    const budgetStatus = classifyPerformance({ fps, fpsLow, frameTimeP95 }, this.targetFps);

    if (budgetStatus === 'critical') this.pressureScore = Math.min(10, this.pressureScore + 2);
    else if (budgetStatus === 'constrained') this.pressureScore = Math.min(10, this.pressureScore + 1);
    else this.pressureScore = Math.max(0, this.pressureScore - 1);

    const adaptiveTier = this.pressureScore >= 7
      ? 'minimal'
      : this.pressureScore >= 4
        ? 'reduced'
        : this.pressureScore >= 2
          ? 'balanced'
          : 'full';

    const report = {
      fps,
      fpsLow,
      frameTimeAverage: frameAverage,
      frameTimeP95,
      targetFps: this.targetFps,
      budgetStatus,
      adaptiveTier,
      pressureScore: this.pressureScore,
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      points: info.render.points,
      lines: info.render.lines,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      programs: Array.isArray(info.programs) ? info.programs.length : 0,
      dynamicScale: this.dynamicScale,
      timestamp: new Date().toISOString(),
    };

    this.lastReportValue = report;
    this.onReport?.(report);

    if (now >= this.cooldownUntil) {
      let next = this.dynamicScale;
      if (budgetStatus === 'critical') next = Math.max(0.55, this.dynamicScale - 0.12);
      else if (budgetStatus === 'constrained') next = Math.max(0.65, this.dynamicScale - 0.06);
      else if (fps > this.targetFps * 1.08) next = Math.min(1, this.dynamicScale + 0.04);
      if (Math.abs(next - this.dynamicScale) > 0.001) {
        this.dynamicScale = next;
        this.cooldownUntil = now + (next < 1 ? 2600 : 1800);
        report.dynamicScale = next;
        this.onScaleChange?.(next, report);
      }
    }

    this.lastReport = now;
  }
}
