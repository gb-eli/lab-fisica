export const labels = {
  auto: 'Auto',
  economic: 'Econômico',
  medium: 'Médio',
  high: 'Alto',
  ultra: 'Ultra',
  scientific: 'Científico',
};

export const qualityProfiles = {
  economic: {
    pixelRatio: 1, particles: 220, antialias: false, fieldStep: 68, potentialStep: 52,
    shadows: false, shadowMapSize: 512, architectureDetail: 0, postProcessing: false,
    textureTier: 'low', lodBias: 2, maxDynamicLights: 2, targetFps: 30,
    maxDrawCalls: 260, maxTriangles: 260000, powerPreference: 'low-power',
  },
  medium: {
    pixelRatio: 1.35, particles: 520, antialias: true, fieldStep: 52, potentialStep: 42,
    shadows: true, shadowMapSize: 1024, architectureDetail: 1, postProcessing: false,
    textureTier: 'medium', lodBias: 1, maxDynamicLights: 4, targetFps: 45,
    maxDrawCalls: 420, maxTriangles: 520000, powerPreference: 'high-performance',
  },
  high: {
    pixelRatio: 1.7, particles: 900, antialias: true, fieldStep: 44, potentialStep: 34,
    shadows: true, shadowMapSize: 1536, architectureDetail: 2, postProcessing: true,
    textureTier: 'high', lodBias: 0, maxDynamicLights: 6, targetFps: 50,
    maxDrawCalls: 620, maxTriangles: 900000, powerPreference: 'high-performance',
  },
  ultra: {
    pixelRatio: 2, particles: 1400, antialias: true, fieldStep: 38, potentialStep: 28,
    shadows: true, shadowMapSize: 2048, architectureDetail: 3, postProcessing: true,
    textureTier: 'ultra', lodBias: 0, maxDynamicLights: 8, targetFps: 58,
    maxDrawCalls: 850, maxTriangles: 1400000, powerPreference: 'high-performance',
  },
  scientific: {
    pixelRatio: 1.45, particles: 340, antialias: true, fieldStep: 40, potentialStep: 30,
    shadows: true, shadowMapSize: 1024, architectureDetail: 1, postProcessing: false,
    textureTier: 'medium', lodBias: 1, maxDynamicLights: 3, targetFps: 40,
    maxDrawCalls: 360, maxTriangles: 420000, powerPreference: 'high-performance',
  },
};

export function detectQuality() {
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const pixels = innerWidth * innerHeight * Math.min(devicePixelRatio || 1, 2);
  const coarse = matchMedia?.('(pointer: coarse)')?.matches === true;
  const saveData = navigator.connection?.saveData === true;
  if (saveData || cores <= 4 || memory <= 4 || pixels > 5_000_000 || (coarse && memory <= 6)) return 'economic';
  if (cores >= 8 && memory >= 8 && pixels < 4_000_000) return 'high';
  return 'medium';
}

export function getQualityProfile(name = document.documentElement.dataset.quality || 'medium') {
  return qualityProfiles[name] || qualityProfiles.medium;
}

export function getQualityBudget(name = document.documentElement.dataset.quality || 'medium') {
  const profile = getQualityProfile(name);
  return {
    targetFps: profile.targetFps,
    maxDrawCalls: profile.maxDrawCalls,
    maxTriangles: profile.maxTriangles,
    maxPixelRatio: profile.pixelRatio,
  };
}

export function applyQuality(requested) {
  const effective = requested === 'auto' ? detectQuality() : requested;
  document.body.className = document.body.className
    .split(' ')
    .filter((name) => !name.startsWith('quality-'))
    .join(' ');
  document.body.classList.add(`quality-${effective}`);
  document.documentElement.dataset.quality = effective;
  window.dispatchEvent(new CustomEvent('fisica:qualitychange', {
    detail: { requested, effective, profile: getQualityProfile(effective) },
  }));
  return effective;
}
