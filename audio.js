export function createAudioFeedback() {
  let context = null;
  let sfxEnabled = true;
  let musicEnabled = false;
  let sfxVolume = 0.62;
  let musicVolume = 0.14;
  let musicNodes = [];
  let musicMaster = null;

  function ensureContext() {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!context) context = new AudioContextClass();
    if (context.state === 'suspended') context.resume().catch(() => {});
    return context;
  }

  function tone(frequency, duration = 0.08, type = 'sine', gain = 0.18, offset = 0) {
    const audioContext = ensureContext();
    if (!audioContext || !sfxEnabled) return;
    const oscillator = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    const start = audioContext.currentTime + offset;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain * sfxVolume), start + 0.008);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(envelope).connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function play(eventName) {
    if (!sfxEnabled) return;
    const patterns = {
      click: [[420, 0.045, 'square', 0.08, 0]],
      move: [[220, 0.035, 'triangle', 0.05, 0]],
      wall: [[110, 0.07, 'sine', 0.07, 0]],
      fall: [[260, 0.09, 'sine', 0.09, 0], [150, 0.16, 'sine', 0.11, 0.09], [82, 0.22, 'triangle', 0.12, 0.22]],
      key: [[520, 0.11, 'triangle', 0.14, 0], [780, 0.14, 'triangle', 0.11, 0.08]],
      achievement: [[520, 0.1, 'triangle', 0.11, 0], [690, 0.1, 'triangle', 0.12, 0.1], [920, 0.18, 'triangle', 0.14, 0.2]],
      complete: [[392, 0.13, 'sine', 0.11, 0], [523, 0.16, 'sine', 0.12, 0.12], [784, 0.28, 'sine', 0.15, 0.25]],
      rank: [[330, 0.1, 'square', 0.08, 0], [660, 0.15, 'square', 0.08, 0.12]]
    };
    (patterns[eventName] || patterns.click).forEach(([frequency, duration, type, gain, offset]) => tone(frequency, duration, type, gain, offset));
  }

  function stopMusic() {
    musicNodes.forEach((node) => {
      try { node.stop(); } catch { /* already stopped */ }
    });
    musicNodes = [];
    musicMaster = null;
  }

  function startMusic() {
    const audioContext = ensureContext();
    if (!audioContext || !musicEnabled || musicNodes.length > 0) return;
    const master = audioContext.createGain();
    master.gain.value = musicVolume * 0.18;
    master.connect(audioContext.destination);
    musicMaster = master;
    [110, 164.81].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = index === 0 ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      oscillator.connect(master);
      oscillator.start();
      musicNodes.push(oscillator);
    });
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
      if (musicMaster) musicMaster.gain.value = musicVolume * 0.18;
    },
    isMusicEnabled: () => musicEnabled
  };
}
