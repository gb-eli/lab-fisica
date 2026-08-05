const KEY = 'fisica-imersiva-360.settings.v12';
const EXPERIMENT_PREFIX = 'fisica-imersiva-360.experiment.';

export const defaults = {
  quality: 'auto',
  reduceMotion: false,
  highContrast: false,
  sound: true,
  density: 'comfortable',
  uiScale: 100,
  lowTransparency: false,
  dynamicResolution: true,
  postProcessing: true,
  showPerformance: false,
  adaptiveQuality: true,
  pauseHiddenScenes: true,
  webglRecovery: true,
  surfaceDetail: true,
  inspectionLighting: true,
  cameraAssist: true,
  force2d: false,
  safe3d: false,
  allowRemoteThree: true,
  firstFrameTimeout: 7000,
  tutorialAutoStart: false,
  simplifiedInstructions: false,
  largeTouchTargets: false,
  strongFocus: true,
  persistentLabels: false,
  experienceMode: 'guided',
  learningMode: 'free',
  mentorId: null,
};

function reportStorageIssue(error, action) {
  try {
    window.dispatchEvent(new CustomEvent('fisica:runtimeerror', {
      detail: { error, label: 'Falha de armazenamento', source: `storage:${action}` },
    }));
  } catch { /* Ambiente de teste sem window. */ }
}

function safeGet(key) {
  try { return localStorage.getItem(key); } catch (error) { reportStorageIssue(error, 'read'); return null; }
}

function safeSet(key, value) {
  try { localStorage.setItem(key, value); return true; } catch (error) { reportStorageIssue(error, 'write'); return false; }
}

export function loadSettings() {
  try {
    const merged = { ...defaults };
    for (let version = 1; version <= 12; version += 1) {
      const parsed = JSON.parse(safeGet(`fisica-imersiva-360.settings.v${version}`) || '{}');
      Object.assign(merged, parsed);
    }
    return merged;
  } catch (error) {
    reportStorageIssue(error, 'parse-settings');
    return { ...defaults };
  }
}

export function saveSettings(settings) {
  return safeSet(KEY, JSON.stringify({ ...defaults, ...settings }));
}

export function saveExperiment(name, data) {
  return safeSet(`${EXPERIMENT_PREFIX}${name}`, JSON.stringify({
    version: 1,
    savedAt: new Date().toISOString(),
    data,
  }));
}

export function loadExperiment(name) {
  try { return JSON.parse(safeGet(`${EXPERIMENT_PREFIX}${name}`) || 'null'); }
  catch (error) { reportStorageIssue(error, `parse-experiment:${name}`); return null; }
}

export function clearLocalData() {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('fisica-imersiva-360'))
      .forEach((key) => localStorage.removeItem(key));
    return true;
  } catch (error) {
    reportStorageIssue(error, 'clear');
    return false;
  }
}
