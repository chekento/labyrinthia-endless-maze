import { CONFIG } from './config.js';

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
  achievements: [],
  motionEnabled: false,
  motionSensitivity: CONFIG.physics.tiltSensitivity,
  invertMotion: false,
  haptics: true,
  theme: 'neon'
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
    merged.motionSensitivity = Math.min(5, Math.max(0.5, Number(merged.motionSensitivity) || CONFIG.physics.tiltSensitivity));
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

  for (let level = 1; level <= 500; level += 1) {
    catalog.push({
      id: `level-${level}`,
      number: catalog.length + 1,
      category: 'Levels',
      title: level === 1 ? 'First Steps' : `Gate Runner ${String(level).padStart(3, '0')}`,
      description: `Complete level ${level}.`,
      stat: 'levelsCompleted',
      threshold: level
    });
  }

  for (let step = 1; step <= 200; step += 1) {
    const threshold = step * 5;
    catalog.push({
      id: `keys-${threshold}`,
      number: catalog.length + 1,
      category: 'Keys',
      title: `Key Seeker ${String(step).padStart(3, '0')}`,
      description: `Collect ${threshold} keys across your expeditions.`,
      stat: 'keysCollected',
      threshold
    });
  }

  for (let step = 1; step <= 150; step += 1) {
    const threshold = step * 100;
    catalog.push({
      id: `moves-${threshold}`,
      number: catalog.length + 1,
      category: 'Moves',
      title: `Trailblazer ${String(step).padStart(3, '0')}`,
      description: `Make ${threshold.toLocaleString()} valid moves.`,
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
    catalog.push({
      id: `motion-${step}`,
      number: catalog.length + 1,
      category: 'Motion',
      title: `Rolling Soul ${String(step).padStart(3, '0')}`,
      description: `Complete ${step} level${step === 1 ? '' : 's'} with device motion controls.`,
      stat: 'motionLevels',
      threshold: step
    });
  }

  return catalog;
}

const achievementCatalog = getAchievementCatalog();

export function getAchievementProgress(achievement, stats = profile) {
  return Number(stats[achievement.stat] || 0);
}

export function getUnlockedAchievements() {
  return new Set(profile.achievements);
}

export function evaluateAchievements(extraStats = {}) {
  const stats = { ...profile, ...extraStats };
  const unlocked = new Set(profile.achievements);
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
  return { unlocked: profile.achievements.length, total: achievementCatalog.length };
}

export function getAchievements() {
  return achievementCatalog;
}

export function recordMove() {
  profile.totalMoves += 1;
  saveProfile();
}

export function recordKey() {
  profile.keysCollected += 1;
  saveProfile();
  return evaluateAchievements();
}

export function recordLevelComplete({ level, durationMs, usedMotion }) {
  const durationSeconds = durationMs / 1000;
  profile.levelsCompleted += 1;
  profile.currentLevel = Math.max(profile.currentLevel, level + 1);
  profile.highestLevel = Math.max(profile.highestLevel, level + 1);
  profile.xp += 100 + Math.min(500, level * 5);
  if (profile.fastestTime === null || durationMs < profile.fastestTime) profile.fastestTime = durationMs;
  if (usedMotion) profile.motionLevels += 1;
  if (durationSeconds < 30) profile.fastLevels += 1;
  saveProfile();
  return evaluateAchievements();
}

export function setMotionPreferences({ enabled, sensitivity, invert }) {
  profile.motionEnabled = Boolean(enabled);
  if (sensitivity !== undefined) profile.motionSensitivity = Math.min(5, Math.max(0.5, Number(sensitivity) || CONFIG.physics.tiltSensitivity));
  if (invert !== undefined) profile.invertMotion = Boolean(invert);
  saveProfile();
  return profile;
}

export function setHaptics(enabled) {
  profile.haptics = Boolean(enabled);
  saveProfile();
  return profile;
}

export function hapticPulse(pattern = 12) {
  if (profile.haptics && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
}
