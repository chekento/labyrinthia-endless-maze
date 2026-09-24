const AMBIENT_TRACKS = {
  void: {
    label: 'Void Whispers',
    root: 55,
    drones: [55, 82.41, 110],
    notes: [0, 7, 5, 3, 10],
    stepMs: 3200,
    wave: 'sine',
    filter: 620
  },
  crystal: {
    label: 'Crystal Drift',
    root: 146.83,
    drones: [146.83, 220, 293.66],
    notes: [0, 4, 7, 11, 14, 7],
    stepMs: 1840,
    wave: 'triangle',
    filter: 1800
  },
  ember: {
    label: 'Ember Pulse',
    root: 73.42,
    drones: [73.42, 110, 146.83, 164.81],
    notes: [0, 3, 5, 7, 10, 5],
    stepMs: 2260,
    wave: 'sawtooth',
    filter: 760
  },
  forest: {
    label: 'Forest Canopy',
    root: 65.41,
    drones: [65.41, 98, 130.81],
    notes: [0, 5, 7, 12, 10, 7],
    stepMs: 2760,
    wave: 'sine',
    filter: 1100
  },
  aurora: {
    label: 'Aurora Passage',
    root: 123.47,
    drones: [123.47, 185, 246.94],
    notes: [0, 2, 7, 9, 14, 9],
    stepMs: 2140,
    wave: 'triangle',
    filter: 1450
  }
};

const VALID_TRACKS = Object.keys(AMBIENT_TRACKS);

export function createAudioFeedback() {
  let context = null;
  let sfxEnabled = true;
  let musicEnabled = false;
  let spaceFxEnabled = true;
  let sfxVolume = 0.62;
  let musicVolume = 0.14;
  let ambientTrack = 'void';
  let sfxBus = null;
  let musicBus = null;
  let musicMaster = null;
  let musicTimer = null;
  let musicStep = 0;
  let musicSources = [];
  let echoWet = null;
  let reverbWet = null;

  function createImpulseResponse(audioContext, duration = 1.25, decay = 2.8) {
    const length = Math.floor(audioContext.sampleRate * duration);
    const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
    for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let index = 0; index < length; index += 1) {
        const fade = Math.pow(1 - index / length, decay);
        data[index] = (Math.random() * 2 - 1) * fade;
      }
    }
    return impulse;
  }

  function buildRouting() {
    if (!context || sfxBus) return;
    sfxBus = context.createGain();
    musicBus = context.createGain();
    sfxBus.connect(context.destination);
    musicBus.connect(context.destination);

    const echo = context.createDelay(1.5);
    echo.delayTime.value = 0.23;
    const feedback = context.createGain();
    feedback.gain.value = 0.22;
    echoWet = context.createGain();
    echoWet.gain.value = spaceFxEnabled ? 0.18 : 0;
    const echoInput = context.createGain();
    echoInput.gain.value = 0.75;
    sfxBus.connect(echoInput);
    musicBus.connect(echoInput);
    echoInput.connect(echo);
    echo.connect(feedback).connect(echo);
    echo.connect(echoWet).connect(context.destination);

    const reverb = context.createConvolver();
    reverb.buffer = createImpulseResponse(context);
    reverbWet = context.createGain();
    reverbWet.gain.value = spaceFxEnabled ? 0.16 : 0;
    const reverbInput = context.createGain();
    reverbInput.gain.value = 0.42;
    sfxBus.connect(reverbInput);
    musicBus.connect(reverbInput);
    reverbInput.connect(reverb).connect(reverbWet).connect(context.destination);
  }

  function ensureContext() {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!context) {
      context = new AudioContextClass();
      buildRouting();
    }
    if (context.state === 'suspended') context.resume().catch(() => {});
    return context;
  }

  function updateSpaceMix() {
    const enabled = spaceFxEnabled ? 1 : 0;
    if (echoWet && context) echoWet.gain.setTargetAtTime(enabled * 0.18, context.currentTime, 0.05);
    if (reverbWet && context) reverbWet.gain.setTargetAtTime(enabled * 0.16, context.currentTime, 0.05);
  }

  function tone(frequency, duration = 0.08, type = 'sine', gain = 0.18, offset = 0) {
    const audioContext = ensureContext();
    if (!audioContext || !sfxEnabled || !sfxBus) return;
    const oscillator = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    const start = audioContext.currentTime + offset;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain * sfxVolume), start + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(envelope).connect(sfxBus);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  function noiseBurst(duration = 0.08, gain = 0.08, offset = 0) {
    const audioContext = ensureContext();
    if (!audioContext || !sfxEnabled || !sfxBus) return;
    const length = Math.max(1, Math.floor(audioContext.sampleRate * duration));
    const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1;
    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const envelope = audioContext.createGain();
    const start = audioContext.currentTime + offset;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, start);
    filter.Q.value = 1.2;
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain * sfxVolume), start + 0.006);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.buffer = buffer;
    source.connect(filter).connect(envelope).connect(sfxBus);
    source.start(start);
    source.stop(start + duration + 0.02);
  }

  function play(eventName) {
    if (!sfxEnabled) return;
    const patterns = {
      click: [[420, 0.05, 'square', 0.07, 0]],
      move: [[220, 0.045, 'triangle', 0.055, 0], [278, 0.035, 'sine', 0.025, 0.018]],
      wall: [[105, 0.085, 'sine', 0.075, 0], [78, 0.11, 'triangle', 0.05, 0.035]],
      fall: [[260, 0.1, 'sine', 0.09, 0], [150, 0.17, 'sine', 0.11, 0.09], [82, 0.25, 'triangle', 0.13, 0.22]],
      key: [[520, 0.12, 'triangle', 0.14, 0], [780, 0.15, 'triangle', 0.12, 0.08], [1040, 0.22, 'sine', 0.1, 0.19]],
      achievement: [[520, 0.1, 'triangle', 0.11, 0], [690, 0.1, 'triangle', 0.12, 0.1], [920, 0.19, 'triangle', 0.14, 0.2]],
      complete: [[392, 0.13, 'sine', 0.11, 0], [523, 0.16, 'sine', 0.12, 0.12], [784, 0.3, 'sine', 0.15, 0.25]],
      rank: [[330, 0.1, 'square', 0.08, 0], [660, 0.15, 'square', 0.08, 0.12]]
    };
    (patterns[eventName] || patterns.click).forEach(([frequency, duration, type, gain, offset]) => tone(frequency, duration, type, gain, offset));
    if (eventName === 'wall') noiseBurst(0.045, 0.035, 0.01);
    if (eventName === 'fall') noiseBurst(0.18, 0.06, 0.12);
    if (eventName === 'move') noiseBurst(0.024, 0.018, 0.01);
  }

  function ambientNote(frequency, track) {
    const audioContext = ensureContext();
    if (!audioContext || !musicEnabled || !musicMaster) return;
    const oscillator = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    const start = audioContext.currentTime + 0.03;
    const duration = Math.min(3.8, track.stepMs / 1000 * 1.45);
    oscillator.type = track.wave;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.detune.value = musicStep % 2 === 0 ? -4 : 5;
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(Math.max(0.0001, musicVolume * 0.11), start + 0.55);
    envelope.gain.setTargetAtTime(0.0001, start + duration * 0.55, duration * 0.34);
    oscillator.connect(envelope).connect(musicMaster);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.25);
  }

  function scheduleAmbientStep() {
    if (!musicEnabled) return;
    const track = AMBIENT_TRACKS[ambientTrack] || AMBIENT_TRACKS.void;
    const note = track.notes[musicStep % track.notes.length];
    ambientNote(track.root * Math.pow(2, note / 12), track);
    musicStep += 1;
    musicTimer = window.setTimeout(scheduleAmbientStep, track.stepMs);
  }

  function stopMusic() {
    if (musicTimer) window.clearTimeout(musicTimer);
    musicTimer = null;
    const stopAt = context ? context.currentTime + 0.36 : 0;
    if (musicMaster && context) {
      musicMaster.gain.cancelScheduledValues(context.currentTime);
      musicMaster.gain.setTargetAtTime(0.0001, context.currentTime, 0.1);
    }
    musicSources.forEach((source) => {
      try { source.stop(stopAt); } catch { /* already stopped */ }
    });
    musicSources = [];
    musicMaster = null;
  }

  function startMusic() {
    const audioContext = ensureContext();
    if (!audioContext || !musicEnabled || musicMaster) return;
    const track = AMBIENT_TRACKS[ambientTrack] || AMBIENT_TRACKS.void;
    const master = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    master.gain.setValueAtTime(0.0001, audioContext.currentTime);
    master.gain.exponentialRampToValueAtTime(Math.max(0.0001, musicVolume * 0.24), audioContext.currentTime + 1.4);
    filter.type = 'lowpass';
    filter.frequency.value = track.filter;
    master.connect(filter).connect(musicBus);
    musicMaster = master;
    musicStep = 0;

    track.drones.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const envelope = audioContext.createGain();
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();
      oscillator.type = index === 0 ? track.wave : 'sine';
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index * 3 - 3;
      envelope.gain.value = 0.055 / (index + 1);
      lfo.frequency.value = 0.025 + index * 0.011;
      lfoGain.gain.value = 4 + index * 2;
      lfo.connect(lfoGain).connect(oscillator.detune);
      oscillator.connect(envelope).connect(master);
      oscillator.start();
      lfo.start();
      musicSources.push(oscillator, lfo);
    });
    scheduleAmbientStep();
  }

  return {
    unlock: ensureContext,
    play,
    setSfxEnabled(value) { sfxEnabled = Boolean(value); },
    setMusicEnabled(value) {
      musicEnabled = Boolean(value);
      if (musicEnabled) startMusic();
      else stopMusic();
    },
    setSfxVolume(value) { sfxVolume = Math.min(1, Math.max(0, Number(value) || 0)); },
    setMusicVolume(value) {
      musicVolume = Math.min(1, Math.max(0, Number(value) || 0));
      if (musicMaster && context) musicMaster.gain.setTargetAtTime(musicVolume * 0.24, context.currentTime, 0.08);
    },
    setAmbientTrack(value) {
      ambientTrack = VALID_TRACKS.includes(value) ? value : 'void';
      if (musicEnabled) {
        stopMusic();
        startMusic();
      }
    },
    setSpaceFxEnabled(value) {
      spaceFxEnabled = Boolean(value);
      ensureContext();
      updateSpaceMix();
    },
    isMusicEnabled: () => musicEnabled,
    getAmbientTracks: () => VALID_TRACKS.map((id) => ({ id, label: AMBIENT_TRACKS[id].label }))
  };
}
