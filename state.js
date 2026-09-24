import { BALL_THEMES, CONFIG } from './config.js';

const defaultProfile = {
  currentLevel: 1,
  highestLevel: 1,
  xp: 0,
  levelsCompleted: 0,
  keysCollected: 0,
  totalMoves: 0,
  motionLevels: 0,
  fastLevels: 0,
  fastestTime: null,
  bestMoves: null,
  totalWallBumps: 0,
  falls: 0,
  achievements: [],
  hasSeenTutorial: false,
  comfortMode: 'standard',
  dailyBestDate: '',
  dailyBestTime: null,
  dailyCompletions: 0,
  motionEnabled: false,
  motionSensitivity: CONFIG.physics.tiltSensitivity,
  invertMotion: false,
  haptics: true,
  theme: 'neon',
  ballTheme: 'nova',
  cameraFollow: 1,
  minimapZoom: 1,
  indicatorLabels: true,
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  leftHanded: false,
  colorblindSafe: false,
  sfxEnabled: true,
  musicEnabled: false,
  sfxVolume: 0.62,
  musicVolume: 0.14,
  ambientTrack: 'void',
  spaceFxEnabled: true
};

let profile = loadProfile();

function cloneDefaultProfile() {
  return { ...defaultProfile, achievements: [] };
}

function getStorage() {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function loadProfile() {
  const storage = getStorage();
  if (!storage) return cloneDefaultProfile();

  try {
    const stored = JSON.parse(storage.getItem(CONFIG.persistenceKey) || 'null');
    if (!stored || typeof stored !== 'object') return cloneDefaultProfile();
    const merged = { ...cloneDefaultProfile(), ...stored };
    merged.achievements = Array.isArray(stored.achievements) ? stored.achievements : [];
    merged.currentLevel = Math.max(1, Math.floor(Number(merged.currentLevel) || 1));
    merged.highestLevel = Math.max(1, Math.floor(Number(merged.highestLevel) || 1));
    merged.xp = Math.max(0, Math.floor(Number(merged.xp) || 0));
    merged.falls = Math.max(0, Math.floor(Number(merged.falls) || 0));
    merged.totalWallBumps = Math.max(0, Math.floor(Number(merged.totalWallBumps) || 0));
    merged.motionSensitivity = Math.min(2.5, Math.max(0.5, Number(merged.motionSensitivity) || CONFIG.physics.tiltSensitivity));
    merged.comfortMode = CONFIG.comfortModes[merged.comfortMode] ? merged.comfortMode : 'standard';
    merged.ballTheme = BALL_THEMES[merged.ballTheme] ? merged.ballTheme : 'nova';
    merged.cameraFollow = Math.min(1, Math.max(0.55, Number(merged.cameraFollow) || 1));
    merged.minimapZoom = Math.min(1.8, Math.max(0.8, Number(merged.minimapZoom) || 1));
    merged.sfxVolume = Math.min(1, Math.max(0, Number(merged.sfxVolume) || 0.62));
    merged.musicVolume = Math.min(1, Math.max(0, Number(merged.musicVolume) || 0.14));
    merged.ambientTrack = ['void', 'crystal', 'ember', 'forest', 'aurora'].includes(merged.ambientTrack) ? merged.ambientTrack : 'void';
    merged.spaceFxEnabled = merged.spaceFxEnabled !== false;
    return merged;
  } catch {
    return cloneDefaultProfile();
  }
}

export function getProfile() {
  return profile;
}

export function saveProfile() {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(CONFIG.persistenceKey, JSON.stringify(profile));
  } catch (error) {
    console.warn('Labyrinthia profile could not be saved', error);
  }
}

export function updateProfile(changes) {
  profile = { ...profile, ...changes };
  saveProfile();
  return profile;
}

export function resetRun() {
  profile = {
    ...profile,
    currentLevel: 1,
    highestLevel: Math.max(1, profile.highestLevel)
  };
  saveProfile();
  return profile;
}

export function resetAllProgress() {
  profile = cloneDefaultProfile();
  saveProfile();
  return profile;
}

export function getRank(xp = profile.xp) {
  const rank = Math.min(CONFIG.maxRank, Math.max(1, 1 + Math.floor(xp / 100)));
  const currentFloor = (rank - 1) * 100;
  const nextFloor = rank >= CONFIG.maxRank ? currentFloor : rank * 100;
  const progress = rank >= CONFIG.maxRank ? 1 : Math.min(1, Math.max(0, (xp - currentFloor) / (nextFloor - currentFloor)));
  return {
    rank,
    progress,
    currentXp: xp,
    nextXp: nextFloor,
    title: getRankTitle(rank)
  };
}

function getRankTitle(rank) {
  if (rank >= 1000) return 'Eternal Labyrinthian';
  if (rank >= 900) return 'Maze Sovereign';
  if (rank >= 750) return 'Infinite Cartographer';
  if (rank >= 500) return 'Abyss Walker';
  if (rank >= 250) return 'Master Pathfinder';
  if (rank >= 100) return 'Maze Runner';
  if (rank >= 50) return 'Wayfinder';
  if (rank >= 10) return 'Pathfinder';
  return 'Newcomer';
}

export function getAchievementCatalog() {
  const catalog = [];

  const levelTitles = ['Gate Runner', 'Threshold Walker', 'Maze Voyager', 'Route Architect', 'Depth Seeker'];
  const levelDescriptions = [
    'Complete level {level} and read one more layer of the maze.',
    'Bring a level-{level} route safely to the exit.',
    'Cross the {level}th threshold of your expedition.',
    'Turn level {level} into a clean line through the unknown.',
    'Prove that level {level} cannot keep you turned around.'
  ];
  const keyTitles = ['Key Seeker', 'Brass Collector', 'Lock Listener', 'Golden Thread', 'Vault Caller'];
  const keyDescriptions = [
    'Collect {threshold} keys across your expeditions.',
    'Carry {threshold} keys out of the dark.',
    'Find {threshold} locks worth opening.',
    'Add key number {threshold} to your expedition log.',
    'Let {threshold} golden signals guide you forward.'
  ];
  const moveTitles = ['Trailblazer', 'Footfall Archivist', 'Corridor Dancer', 'Turning Point', 'Long Walker'];
  const moveDescriptions = [
    'Make {threshold} valid moves.',
    'Leave {threshold} deliberate footsteps in the maze.',
    'Navigate {threshold} cells without giving up the route.',
    'Turn momentum into {threshold} clean moves.',
    'Keep exploring until the counter reaches {threshold}.'
  ];

  for (let level = 1; level <= 500; level += 1) {
    const variant = (level - 1) % levelTitles.length;
    catalog.push({
      id: `level-${level}`,
      number: catalog.length + 1,
      category: 'Levels',
      title: level === 1 ? 'First Steps' : `${levelTitles[variant]} ${String(level).padStart(3, '0')}`,
      description: (levelDescriptions[variant] || levelDescriptions[0]).replace('{level}', level.toLocaleString()),
      stat: 'levelsCompleted',
      threshold: level
    });
  }

  for (let step = 1; step <= 150; step += 1) {
    const threshold = step * 5;
    const variant = (step - 1) % keyTitles.length;
    catalog.push({
      id: `keys-${threshold}`,
      number: catalog.length + 1,
      category: 'Keys',
      title: `${keyTitles[variant]} ${String(step).padStart(3, '0')}`,
      description: (keyDescriptions[variant] || keyDescriptions[0]).replace('{threshold}', threshold.toLocaleString()),
      stat: 'keysCollected',
      threshold
    });
  }

  for (let step = 1; step <= 150; step += 1) {
    const threshold = step * 100;
    const variant = (step - 1) % moveTitles.length;
    catalog.push({
      id: `moves-${threshold}`,
      number: catalog.length + 1,
      category: 'Moves',
      title: `${moveTitles[variant]} ${String(step).padStart(3, '0')}`,
      description: (moveDescriptions[variant] || moveDescriptions[0]).replace('{threshold}', threshold.toLocaleString()),
      stat: 'totalMoves',
      threshold
    });
  }

  for (let step = 1; step <= 100; step += 1) {
    catalog.push({
      id: `speed-${step}`,
      number: catalog.length + 1,
      category: 'Speed',
      title: `Timebreaker ${String(step).padStart(3, '0')}`,
      description: `Finish ${step} level${step === 1 ? '' : 's'} in under 30 seconds.`,
      stat: 'fastLevels',
      threshold: step
    });
  }

  for (let step = 1; step <= 50; step += 1) {
    const titles = ['Rolling Soul', 'Tilt Cartographer', 'Gravity Listener', 'Motion Thread', 'Lean Into It'];
    const descriptions = [
      'Complete {step} level{plural} with device motion controls.',
      'Let the accelerometer guide {step} successful escape{plural}.',
      'Use real tilt momentum for {step} finished route{plural}.',
      'Keep your hands light across {step} motion-controlled level{plural}.',
      'Build physical roll speed through {step} completed expedition{plural}.'
    ];
    const variant = (step - 1) % titles.length;
    const plural = step === 1 ? '' : 's';
    catalog.push({
      id: `motion-${step}`,
      number: catalog.length + 1,
      category: 'Motion',
      title: `${titles[variant]} ${String(step).padStart(3, '0')}`,
      description: (descriptions[variant] || descriptions[0]).replace('{step}', step).replace('{plural}', plural),
      stat: 'motionLevels',
      threshold: step
    });
  }

  const fallTitles = ['Soft Landing', 'Gravity Tax', 'Wrong Pocket', 'Trapdoor Tourist', 'Abyss Note'];
  const fallDescriptions = [
    'Fall into {threshold} marked hole{plural}. The maze remembers.',
    'Record {threshold} fall{plural} and return to a savepoint each time.',
    'Let gravity interrupt {threshold} route attempt{plural}.',
    'Visit {threshold} trapdoor{plural}; the next run can be cleaner.',
    'Survive the lesson of {threshold} hole{plural}.'
  ];
  for (let step = 1; step <= 30; step += 1) {
    const variant = (step - 1) % fallTitles.length;
    const plural = step === 1 ? '' : 's';
    catalog.push({
      id: `falls-${step}`,
      number: catalog.length + 1,
      category: 'Hazards',
      title: `${fallTitles[variant]} ${String(step).padStart(3, '0')}`,
      description: (fallDescriptions[variant] || fallDescriptions[0]).replace('{threshold}', step).replace('{plural}', plural),
      stat: 'falls',
      threshold: step,
      negative: true
    });
  }

  const bumpTitles = ['Wall Whisperer', 'Corner Collector', 'Rebound Ritual', 'Boundary Check', 'Bump Log'];
  const bumpDescriptions = [
    'Touch {threshold} walls while learning their rhythm.',
    'Register {threshold} blocked moves and keep your route alive.',
    'Bounce off {threshold} boundaries before finding a passage.',
    'Test {threshold} closed doors with patient persistence.',
    'Make {threshold} wall contacts part of the expedition story.'
  ];
  for (let step = 1; step <= 20; step += 1) {
    const threshold = step * 5;
    const variant = (step - 1) % bumpTitles.length;
    catalog.push({
      id: `bumps-${threshold}`,
      number: catalog.length + 1,
      category: 'Hazards',
      title: `${bumpTitles[variant]} ${String(step).padStart(3, '0')}`,
      description: (bumpDescriptions[variant] || bumpDescriptions[0]).replace('{threshold}', threshold.toLocaleString()),
      stat: 'totalWallBumps',
      threshold,
      negative: true
    });
  }

  return catalog;
}

const achievementCatalog = getAchievementCatalog();
const achievementIds = new Set(achievementCatalog.map((achievement) => achievement.id));

export function getAchievementProgress(achievement, stats = profile) {
  return Number(stats[achievement.stat] || 0);
}

export function getUnlockedAchievements() {
  return new Set(profile.achievements.filter((id) => achievementIds.has(id)));
}

export function evaluateAchievements(extraStats = {}) {
  const stats = { ...profile, ...extraStats };
  const unlocked = getUnlockedAchievements();
  const newlyUnlocked = [];

  for (const achievement of achievementCatalog) {
    if (!unlocked.has(achievement.id) && getAchievementProgress(achievement, stats) >= achievement.threshold) {
      unlocked.add(achievement.id);
      newlyUnlocked.push(achievement);
    }
  }

  if (newlyUnlocked.length > 0) {
    profile.achievements = [...unlocked];
    saveProfile();
  }
  return newlyUnlocked;
}

export function getAchievementStats() {
  return { unlocked: getUnlockedAchievements().size, total: achievementCatalog.length };
}

export function getAchievements() {
  return achievementCatalog;
}

export function recordMove() {
  profile.totalMoves += 1;
  saveProfile();
}

export function recordWallBump() {
  profile.totalWallBumps += 1;
  saveProfile();
  return evaluateAchievements();
}

export function recordFall() {
  profile.falls += 1;
  saveProfile();
  return evaluateAchievements();
}

export function recordKey() {
  profile.keysCollected += 1;
  saveProfile();
  return evaluateAchievements();
}

export function recordLevelComplete({ level, durationMs, usedMotion, moves = 0, wallBumps = 0, daily = false }) {
  const durationSeconds = durationMs / 1000;
  profile.levelsCompleted += 1;
  profile.currentLevel = Math.max(profile.currentLevel, level + 1);
  profile.highestLevel = Math.max(profile.highestLevel, level + 1);
  profile.xp += 100 + Math.min(500, level * 5);
  if (profile.fastestTime === null || durationMs < profile.fastestTime) profile.fastestTime = durationMs;
  if (profile.bestMoves === null || moves < profile.bestMoves) profile.bestMoves = moves;
  if (usedMotion) profile.motionLevels += 1;
  if (durationSeconds < 30) profile.fastLevels += 1;
  if (daily) {
    const dateKey = new Date().toISOString().slice(0, 10);
    profile.dailyCompletions += 1;
    if (profile.dailyBestDate !== dateKey || profile.dailyBestTime === null || durationMs < profile.dailyBestTime) {
      profile.dailyBestDate = dateKey;
      profile.dailyBestTime = durationMs;
    }
  }
  saveProfile();
  return evaluateAchievements();
}

export function setMotionPreferences({ enabled, sensitivity, invert }) {
  profile.motionEnabled = Boolean(enabled);
  if (sensitivity !== undefined) profile.motionSensitivity = Math.min(2.5, Math.max(0.5, Number(sensitivity) || CONFIG.physics.tiltSensitivity));
  if (invert !== undefined) profile.invertMotion = Boolean(invert);
  saveProfile();
  return profile;
}

export function setHaptics(enabled) {
  profile.haptics = Boolean(enabled);
  saveProfile();
  return profile;
}

export function setTutorialSeen(value = true) {
  profile.hasSeenTutorial = Boolean(value);
  saveProfile();
  return profile;
}

export function setComfortMode(mode) {
  profile.comfortMode = CONFIG.comfortModes[mode] ? mode : 'standard';
  saveProfile();
  return profile;
}

export function setBallTheme(themeId) {
  profile.ballTheme = BALL_THEMES[themeId] ? themeId : 'nova';
  saveProfile();
  return profile;
}

export function setCameraPreferences({ follow, minimapZoom, indicatorLabels }) {
  if (follow !== undefined) profile.cameraFollow = Math.min(1, Math.max(0.55, Number(follow) || 1));
  if (minimapZoom !== undefined) profile.minimapZoom = Math.min(1.8, Math.max(0.8, Number(minimapZoom) || 1));
  if (indicatorLabels !== undefined) profile.indicatorLabels = Boolean(indicatorLabels);
  saveProfile();
  return profile;
}

export function setAccessibilityPreferences({ highContrast, reducedMotion, largeText, leftHanded, colorblindSafe }) {
  profile = {
    ...profile,
    ...(highContrast === undefined ? {} : { highContrast: Boolean(highContrast) }),
    ...(reducedMotion === undefined ? {} : { reducedMotion: Boolean(reducedMotion) }),
    ...(largeText === undefined ? {} : { largeText: Boolean(largeText) }),
    ...(leftHanded === undefined ? {} : { leftHanded: Boolean(leftHanded) }),
    ...(colorblindSafe === undefined ? {} : { colorblindSafe: Boolean(colorblindSafe) })
  };
  saveProfile();
  return profile;
}

export function setAudioPreferences({ sfxEnabled, musicEnabled, sfxVolume, musicVolume, ambientTrack, spaceFxEnabled }) {
  profile = {
    ...profile,
    ...(sfxEnabled === undefined ? {} : { sfxEnabled: Boolean(sfxEnabled) }),
    ...(musicEnabled === undefined ? {} : { musicEnabled: Boolean(musicEnabled) }),
    ...(sfxVolume === undefined ? {} : { sfxVolume: Math.min(1, Math.max(0, Number(sfxVolume) || 0)) }),
    ...(musicVolume === undefined ? {} : { musicVolume: Math.min(1, Math.max(0, Number(musicVolume) || 0)) }),
    ...(ambientTrack === undefined ? {} : { ambientTrack: ['void', 'crystal', 'ember', 'forest', 'aurora'].includes(ambientTrack) ? ambientTrack : 'void' }),
    ...(spaceFxEnabled === undefined ? {} : { spaceFxEnabled: Boolean(spaceFxEnabled) })
  };
  saveProfile();
  return profile;
}

export function getAchievementCollections() {
  const unlocked = getUnlockedAchievements();
  return ['Levels', 'Keys', 'Moves', 'Speed', 'Motion', 'Hazards'].map((category) => {
    const items = achievementCatalog.filter((achievement) => achievement.category === category);
    return {
      category,
      total: items.length,
      unlocked: items.filter((achievement) => unlocked.has(achievement.id)).length,
      next: items.find((achievement) => !unlocked.has(achievement.id)) || null
    };
  });
}

export function exportProfile() {
  return JSON.parse(JSON.stringify(profile));
}

export function importProfile(incoming) {
  const candidate = incoming?.profile && typeof incoming.profile === 'object' ? incoming.profile : incoming;
  if (!candidate || typeof candidate !== 'object') throw new Error('Ungültiger Labyrinthia-Export');
  const merged = { ...cloneDefaultProfile(), ...candidate };
  merged.achievements = Array.isArray(merged.achievements) ? merged.achievements.filter((id) => achievementCatalog.some((item) => item.id === id)) : [];
  merged.currentLevel = Math.max(1, Math.floor(Number(merged.currentLevel) || 1));
  merged.highestLevel = Math.max(1, Math.floor(Number(merged.highestLevel) || 1));
  merged.xp = Math.max(0, Math.floor(Number(merged.xp) || 0));
  merged.falls = Math.max(0, Math.floor(Number(merged.falls) || 0));
  merged.totalWallBumps = Math.max(0, Math.floor(Number(merged.totalWallBumps) || 0));
  merged.motionSensitivity = Math.min(2.5, Math.max(0.5, Number(merged.motionSensitivity) || CONFIG.physics.tiltSensitivity));
  merged.comfortMode = CONFIG.comfortModes[merged.comfortMode] ? merged.comfortMode : 'standard';
  merged.ballTheme = BALL_THEMES[merged.ballTheme] ? merged.ballTheme : 'nova';
  merged.cameraFollow = Math.min(1, Math.max(0.55, Number(merged.cameraFollow) || 1));
  merged.minimapZoom = Math.min(1.8, Math.max(0.8, Number(merged.minimapZoom) || 1));
  merged.ambientTrack = ['void', 'crystal', 'ember', 'forest', 'aurora'].includes(merged.ambientTrack) ? merged.ambientTrack : 'void';
  merged.spaceFxEnabled = merged.spaceFxEnabled !== false;
  profile = merged;
  saveProfile();
  return profile;
}

export function hapticPulse(pattern = 12) {
  if (profile.haptics && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
}
