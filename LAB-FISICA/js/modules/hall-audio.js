function setAudioParam(param, value, now, duration = 0.18) {
  if (!param) return;
  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  param.linearRampToValueAtTime(value, now + duration);
}

export function createHallAudio({ getSettings = () => ({ sound: true }) } = {}) {
  let context;
  let master;
  let ambience;
  let sectorGain;
  let sectorOscillator;
  let panner;
  let noiseSource;
  let active = false;
  let disposed = false;

  function createNoiseBuffer(audioContext) {
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      const envelope = 0.35 + 0.65 * Math.sin(index / data.length * Math.PI);
      data[index] = (Math.random() * 2 - 1) * envelope;
    }
    return buffer;
  }

  async function start() {
    if (disposed || getSettings().sound === false) return false;
    if (!context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return false;
      context = new AudioContextClass();
      master = context.createGain();
      master.gain.value = 0.035;
      master.connect(context.destination);

      const ambienceFilter = context.createBiquadFilter();
      ambienceFilter.type = 'lowpass';
      ambienceFilter.frequency.value = 180;
      ambience = context.createGain();
      ambience.gain.value = 0.16;
      ambience.connect(ambienceFilter).connect(master);

      const humA = context.createOscillator();
      humA.type = 'sine';
      humA.frequency.value = 48;
      const humB = context.createOscillator();
      humB.type = 'triangle';
      humB.frequency.value = 96;
      const humBGain = context.createGain();
      humBGain.gain.value = 0.04;
      humA.connect(ambience);
      humB.connect(humBGain).connect(ambience);
      humA.start();
      humB.start();

      noiseSource = context.createBufferSource();
      noiseSource.buffer = createNoiseBuffer(context);
      noiseSource.loop = true;
      const noiseFilter = context.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 420;
      noiseFilter.Q.value = 0.38;
      const noiseGain = context.createGain();
      noiseGain.gain.value = 0.018;
      noiseSource.connect(noiseFilter).connect(noiseGain).connect(master);
      noiseSource.start();

      sectorOscillator = context.createOscillator();
      sectorOscillator.type = 'sine';
      sectorOscillator.frequency.value = 220;
      sectorGain = context.createGain();
      sectorGain.gain.value = 0.001;
      panner = context.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 3;
      panner.maxDistance = 30;
      panner.rolloffFactor = 1.3;
      sectorOscillator.connect(sectorGain).connect(panner).connect(master);
      sectorOscillator.start();
    }
    if (context.state === 'suspended') await context.resume();
    setAudioParam(master.gain, 0.035, context.currentTime, 0.25);
    active = true;
    return true;
  }

  function stop() {
    if (!context || disposed) return;
    setAudioParam(master.gain, 0.0001, context.currentTime, 0.2);
    active = false;
  }

  async function toggle() {
    if (active) {
      stop();
      return false;
    }
    return start();
  }

  function setSector(position, index = 0) {
    if (!context || !panner || !sectorOscillator) return;
    const now = context.currentTime;
    const frequency = 174 + (index % 7) * 22;
    setAudioParam(sectorOscillator.frequency, frequency, now, 0.3);
    setAudioParam(sectorGain.gain, active ? 0.055 : 0.001, now, 0.35);
    const x = position?.x || 0;
    const y = position?.y || 1.6;
    const z = position?.z || 0;
    if (panner.positionX) {
      setAudioParam(panner.positionX, x, now, 0.18);
      setAudioParam(panner.positionY, y, now, 0.18);
      setAudioParam(panner.positionZ, z, now, 0.18);
    } else {
      panner.setPosition(x, y, z);
    }
  }

  function updateListener(camera) {
    if (!context || !camera) return;
    const listener = context.listener;
    const position = camera.position;
    const forward = camera.position.clone();
    camera.getWorldDirection(forward);
    const now = context.currentTime;
    if (listener.positionX) {
      listener.positionX.setValueAtTime(position.x, now);
      listener.positionY.setValueAtTime(position.y, now);
      listener.positionZ.setValueAtTime(position.z, now);
      listener.forwardX.setValueAtTime(forward.x, now);
      listener.forwardY.setValueAtTime(forward.y, now);
      listener.forwardZ.setValueAtTime(forward.z, now);
      listener.upX.setValueAtTime(0, now);
      listener.upY.setValueAtTime(1, now);
      listener.upZ.setValueAtTime(0, now);
    } else {
      listener.setPosition(position.x, position.y, position.z);
      listener.setOrientation(forward.x, forward.y, forward.z, 0, 1, 0);
    }
  }

  function dispose() {
    disposed = true;
    active = false;
    try { noiseSource?.stop(); } catch {}
    try { sectorOscillator?.stop(); } catch {}
    context?.close?.();
    context = null;
  }

  return {
    toggle,
    start,
    stop,
    setSector,
    updateListener,
    get active() { return active; },
    dispose,
  };
}
