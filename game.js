import { BALL_THEMES, CONFIG } from './config.js';
import {
  canMove,
  chooseKey,
  createSeed,
  createDailySeed,
  generateMaze,
  applyLevelHazards,
  getLevelDifficulty,
  initMaze,
  solveMaze
} from './maze-utils.js';
import { initMotionControls } from './motion-controls.js';
import { createAudioFeedback } from './audio.js';
import {
  evaluateAchievements,
  exportProfile,
  getAchievementCollections,
  getAchievementProgress,
  getAchievements,
  getAchievementStats,
  getProfile,
  getRank,
  getUnlockedAchievements,
  hapticPulse,
  importProfile,
  recordFall,
  recordKey,
  recordLevelComplete,
  recordMove,
  recordWallBump,
  resetAllProgress,
  resetRun,
  saveProfile,
  setAccessibilityPreferences,
  setAudioPreferences,
  setBallTheme,
  setCameraPreferences,
  setComfortMode,
  setHaptics,
  setMotionPreferences,
  setTutorialSeen,
  updateProfile
} from './state.js';

const palettes = {
  neon: {
    background: '#070918',
    floor: '#0f1530',
    floorAlt: '#111a3b',
    wall: '#746bff',
    wallGlow: '#36e0c5',
    player: '#ff6b8a',
    playerBright: '#ffd2dc',
    key: '#ffc857',
    exit: '#36e0c5',
    hole: '#050611',
    holeGlow: '#ff6b8a'
  },
  ember: {
    background: '#180b12',
    floor: '#2b111a',
    floorAlt: '#35151f',
    wall: '#ff715b',
    wallGlow: '#ffc857',
    player: '#ffd166',
    playerBright: '#fff1bd',
    key: '#ffc857',
    exit: '#62e6c4',
    hole: '#12070d',
    holeGlow: '#ff715b'
  },
  forest: {
    background: '#071711',
    floor: '#0d251c',
    floorAlt: '#123024',
    wall: '#67d391',
    wallGlow: '#b5f36d',
    player: '#ff9f68',
    playerBright: '#ffe2c9',
    key: '#ffd166',
    exit: '#b5f36d',
    hole: '#030e0a',
    holeGlow: '#ff9f68'
  },
  ice: {
    background: '#071621',
    floor: '#10283b',
    floorAlt: '#15334a',
    wall: '#8ed8ff',
    wallGlow: '#d3f4ff',
    player: '#ff8fc8',
    playerBright: '#ffe1f1',
    key: '#ffe08a',
    exit: '#8ff2e1',
    hole: '#050d17',
    holeGlow: '#ff8fc8'
  }
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const now = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

export function initGame() {
  const elements = {
    mainMenu: document.getElementById('mainMenu'),
    gameScreen: document.getElementById('gameScreen'),
    canvas: document.getElementById('mazeCanvas'),
    canvasViewport: document.getElementById('canvasViewport'),
    miniMap: document.getElementById('miniMapCanvas'),
    currentLevel: document.getElementById('currentLevel'),
    objectiveText: document.getElementById('objectiveText'),
    keyStatus: document.getElementById('keyStatus'),
    motionStatus: document.getElementById('motionStatus'),
    difficultyStatus: document.getElementById('difficultyStatus'),
    savepointStatus: document.getElementById('savepointStatus'),
    motionTelemetry: document.getElementById('motionTelemetry'),
    timer: document.getElementById('levelTimer'),
    hudRank: document.getElementById('hudRank'),
    hudXp: document.getElementById('hudXp'),
    hudXpFill: document.getElementById('hudXpFill'),
    menuRank: document.getElementById('menuRank'),
    menuRankTitle: document.getElementById('menuRankTitle'),
    menuLevel: document.getElementById('menuLevel'),
    menuAchievements: document.getElementById('menuAchievements'),
    dailyDate: document.getElementById('dailyDate'),
    dailyStatus: document.getElementById('dailyStatus'),
    dailyChallengeBtn: document.getElementById('dailyChallengeBtn'),
    tutorialMenuBtn: document.getElementById('tutorialMenuBtn'),
    continueBtn: document.getElementById('continueBtn'),
    newRunBtn: document.getElementById('newRunBtn'),
    levelInput: document.getElementById('levelInput'),
    levelStartBtn: document.getElementById('levelStartBtn'),
    levelModal: document.getElementById('levelModal'),
    settingsModal: document.getElementById('settingsModal'),
    achievementsModal: document.getElementById('achievementsModal'),
    pauseModal: document.getElementById('pauseModal'),
    completionModal: document.getElementById('completionModal'),
    tutorialModal: document.getElementById('tutorialModal'),
    tutorialVisual: document.getElementById('tutorialVisual'),
    tutorialTitle: document.getElementById('tutorialTitle'),
    tutorialCopy: document.getElementById('tutorialCopy'),
    tutorialProgress: document.getElementById('tutorialProgress'),
    tutorialPrevBtn: document.getElementById('tutorialPrevBtn'),
    tutorialNextBtn: document.getElementById('tutorialNextBtn'),
    tutorialSkipBtn: document.getElementById('tutorialSkipBtn'),
    toastStack: document.getElementById('toastStack'),
    achievementsGrid: document.getElementById('achievementsGrid'),
    achievementProgress: document.getElementById('achievementProgress'),
    achievementCollections: document.getElementById('achievementCollections'),
    nextAchievementHint: document.getElementById('nextAchievementHint'),
    motionToggle: document.getElementById('motionToggle'),
    motionSensitivity: document.getElementById('motionSensitivity'),
    motionSensitivityValue: document.getElementById('motionSensitivityValue'),
    invertMotion: document.getElementById('invertMotion'),
    hapticsToggle: document.getElementById('hapticsToggle'),
    themeSelect: document.getElementById('themeSelect'),
    comfortMode: document.getElementById('comfortMode'),
    comfortModeDescription: document.getElementById('comfortModeDescription'),
    cameraFollow: document.getElementById('cameraFollow'),
    cameraFollowValue: document.getElementById('cameraFollowValue'),
    minimapZoom: document.getElementById('minimapZoom'),
    minimapZoomValue: document.getElementById('minimapZoomValue'),
    indicatorLabels: document.getElementById('indicatorLabels'),
    highContrast: document.getElementById('highContrast'),
    reducedMotion: document.getElementById('reducedMotion'),
    largeText: document.getElementById('largeText'),
    leftHanded: document.getElementById('leftHanded'),
    colorblindSafe: document.getElementById('colorblindSafe'),
    ballTheme: document.getElementById('ballTheme'),
    ballThemeDescription: document.getElementById('ballThemeDescription'),
    ballThemePreview: document.getElementById('ballThemePreview'),
    sfxToggle: document.getElementById('sfxToggle'),
    sfxVolume: document.getElementById('sfxVolume'),
    musicToggle: document.getElementById('musicToggle'),
    musicVolume: document.getElementById('musicVolume'),
    ambientTrack: document.getElementById('ambientTrack'),
    spaceFxToggle: document.getElementById('spaceFxToggle'),
    backupCode: document.getElementById('backupCode'),
    backupExportBtn: document.getElementById('backupExportBtn'),
    backupCopyBtn: document.getElementById('backupCopyBtn'),
    backupImportBtn: document.getElementById('backupImportBtn'),
    lastInput: document.getElementById('lastInput'),
    completionTitle: document.getElementById('completionTitle'),
    completionSummary: document.getElementById('completionSummary'),
    completionXp: document.getElementById('completionXp'),
    completionRecap: document.getElementById('completionRecap'),
    completionNextBtn: document.getElementById('completionNextBtn'),
    togglePanelsBtn: document.getElementById('togglePanelsBtn')
  };

  const ctx = elements.canvas.getContext('2d');
  const miniCtx = elements.miniMap.getContext('2d');
  const game = {
    active: false,
    paused: false,
    completed: false,
    level: 1,
    seed: 0,
    maze: [],
    cols: 0,
    rows: 0,
    player: { x: 1, y: 1 },
    key: { x: 1, y: 2 },
    exit: { x: 3, y: 3 },
    difficulty: getLevelDifficulty(1),
    hazards: { holes: [] },
    savepoint: { x: 1, y: 1, hasKey: false, label: 'Start' },
    hasKey: false,
    motionUsed: false,
    levelStart: 0,
    movesThisLevel: 0,
    wallBumpsThisLevel: 0,
    keyMoves: null,
    daily: false,
    inputShieldUntil: 0,
    lastInput: 'Bereit',
    cellSize: CONFIG.cellSize,
    viewport: { width: 0, height: 0 },
    dpr: 1,
    pointerStart: null,
    lastMove: 0,
    levelTimer: null,
    achievementFilter: 'all',
    tutorialStep: 0,
    routeHint: [],
    playerTween: null,
    rolling: { dx: 0, dy: 0, intensity: 0, angle: 0 },
    motionPosition: { x: 1.5, y: 1.5 },
    motionLastCell: { x: 1, y: 1 },
    motionTrail: [],
    motionFrameAt: 0,
    lastMotionMoveAt: 0,
    fallFlashUntil: 0,
    manualHold: null,
    manualHoldTimer: null,
    motionTelemetry: { intensity: 0, x: 0, y: 0, speed: 0, velocityX: 0, velocityY: 0, received: false, source: 'none' }
  };

  let animationFrame = null;
  const audio = createAudioFeedback();
  const motionControls = initMotionControls((movement) => {
    if (movement?.received) game.motionUsed = true;
  }, (movement) => {
    game.motionTelemetry = movement;
    updateMotionTelemetry();
  });

  function palette() {
    const colors = { ...(palettes[getProfile().theme] || palettes.neon) };
    if (getProfile().colorblindSafe) {
      colors.player = '#ff4f8b';
      colors.playerBright = '#ffe5f0';
      colors.key = '#ff9f1c';
      colors.exit = '#00d4ff';
    }
    return colors;
  }

  function ballTheme() {
    return BALL_THEMES[getProfile().ballTheme] || BALL_THEMES.nova;
  }

  function syncBallThemePreview() {
    const profile = getProfile();
    const theme = ballTheme();
    if (elements.ballThemeDescription) elements.ballThemeDescription.textContent = `${theme.name} · ${theme.description}`;
    if (elements.ballThemePreview) {
      elements.ballThemePreview.style.setProperty('--ball-base', theme.base);
      elements.ballThemePreview.style.setProperty('--ball-highlight', theme.highlight);
      elements.ballThemePreview.style.setProperty('--ball-shadow', theme.shadow);
      elements.ballThemePreview.style.setProperty('--ball-accent', theme.accent);
      elements.ballThemePreview.dataset.pattern = theme.pattern;
      elements.ballThemePreview.textContent = theme.pattern === 'pizza' ? '🍕' : '✦';
      elements.ballThemePreview.setAttribute('aria-label', `Kugelvorschau ${theme.name}`);
    }
    if (elements.ballTheme && elements.ballTheme.value !== profile.ballTheme) elements.ballTheme.value = profile.ballTheme;
  }

  function comfortPreset() {
    return CONFIG.comfortModes[getProfile().comfortMode] || CONFIG.comfortModes.standard;
  }

  function dailyDateKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function dailyLabel() {
    return new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(new Date());
  }

  function dailySeedToken() {
    return createDailySeed().toString(16).toUpperCase().padStart(8, '0').slice(-8);
  }

  function markInput(label, tone = 'info') {
    game.lastInput = label;
    elements.lastInput.textContent = label;
    elements.lastInput.classList.toggle('muted', tone === 'info');
  }

  function applyAccessibility() {
    const profile = getProfile();
    document.body.classList.toggle('a11y-high-contrast', profile.highContrast);
    document.body.classList.toggle('a11y-reduced-motion', profile.reducedMotion);
    document.body.classList.toggle('a11y-large-text', profile.largeText);
    document.body.classList.toggle('a11y-left-handed', profile.leftHanded);
    document.body.classList.toggle('a11y-colorblind', profile.colorblindSafe);
    audio.setSfxEnabled(profile.sfxEnabled);
    audio.setSfxVolume(profile.sfxVolume);
    audio.setMusicVolume(profile.musicVolume);
    audio.setAmbientTrack(profile.ambientTrack);
    audio.setSpaceFxEnabled(profile.spaceFxEnabled);
    audio.setMusicEnabled(profile.musicEnabled);
  }

  function backupEnvelope() {
    return { app: 'Labyrinthia', version: CONFIG.appVersion, exportedAt: new Date().toISOString(), profile: exportProfile() };
  }

  function writeBackupCode() {
    elements.backupCode.value = JSON.stringify(backupEnvelope(), null, 2);
    announce('Backup-Code erzeugt · lokal kopieren und sicher aufbewahren', 'success');
  }

  async function copyBackupCode() {
    if (!elements.backupCode.value.trim()) writeBackupCode();
    try {
      await navigator.clipboard.writeText(elements.backupCode.value);
      announce('Backup-Code in die Zwischenablage kopiert', 'success');
    } catch {
      elements.backupCode.focus();
      elements.backupCode.select();
      document.execCommand('copy');
      announce('Backup-Code markiert · bitte kopieren', 'info');
    }
  }

  function importBackupCode() {
    try {
      const payload = JSON.parse(elements.backupCode.value);
      if (payload.app !== 'Labyrinthia') throw new Error('falsche App');
      importProfile(payload);
      syncSettings();
      applyAccessibility();
      updateMenuStats();
      announce('Spielstand importiert · willkommen zurück', 'success');
      audio.play('rank');
    } catch {
      announce('Backup-Code ist ungültig oder beschädigt.', 'warning');
    }
  }

  const tutorialSlides = [
    { icon: '◎', title: 'Dein Ziel: raus aus dem Raum', copy: 'Finde zuerst den goldenen Schlüssel. Erst dann öffnet sich der türkisfarbene Ausgang. KEY und EXIT zeigen dir die Richtung, auch wenn das Ziel gerade außerhalb der Kamera liegt.' },
    { icon: '⌁', title: 'Drei Wege, eine Kugel', copy: 'Wische in eine Richtung und halte fest: Die Kugel rollt Schritt für Schritt weiter, bis du loslässt, eine Wand erreichst oder in ein Fallloch gerätst. Alternativ hältst du die D-Pad-Taste oder eine Pfeiltaste.' },
    { icon: '◌', title: 'Neigung wird zu Tempo', copy: 'Aktiviere die Sensorsteuerung und halte das Gerät kurz waagerecht. Je stärker du neigst, desto mehr physikalische Rollgeschwindigkeit baut die Kugel auf; Reibung bremst sie wieder ab.' },
    { icon: '◍', title: 'Falllöcher sind riskant, aber fair', copy: 'Die ersten Level haben sicheren Boden. Danach kommen kleine und später größere Falllöcher. Jede Route bleibt lösbar: Neben einer Falle bleibt ein begehbarer Weg, und ein Sturz bringt dich zum letzten Savepoint zurück.' },
    { icon: '▦', title: 'Karte, Fokus und Kontrolle', copy: 'Die Minimap zeigt deine Expedition. Jede Karte und jedes HUD-Element hat ein −/+ zum Minimieren und Maximieren. Mit ⤢ blendest du die Seitenkarten für einen großen Spielfeld-Fokus aus.' },
    { icon: '✦', title: 'Deine Geschichte wird vielseitig', copy: 'Sammle XP, Ränge und viele unterschiedliche Achievements: schnelle Runs, Sensor-Meisterschaft, Schlüssel und auch Warnabzeichen für Falllöcher oder Wandkontakte. Spätere Level können bewegliche Teile, mehrere Schlüssel und Savepoint-Türen bringen.' }
  ];

  function renderTutorial() {
    const slide = tutorialSlides[game.tutorialStep];
    elements.tutorialVisual.textContent = slide.icon;
    elements.tutorialTitle.textContent = slide.title;
    elements.tutorialCopy.textContent = slide.copy;
    elements.tutorialPrevBtn.disabled = game.tutorialStep === 0;
    elements.tutorialNextBtn.textContent = game.tutorialStep === tutorialSlides.length - 1 ? 'Expedition starten' : 'Weiter';
    elements.tutorialProgress.innerHTML = tutorialSlides.map((_, index) => `<span class="tutorial-dot ${index === game.tutorialStep ? 'is-active' : ''}" aria-hidden="true"></span>`).join('');
  }

  function openTutorial() {
    game.tutorialStep = 0;
    renderTutorial();
    openModal(elements.tutorialModal);
    audio.play('click');
  }

  function finishTutorial() {
    setTutorialSeen(true);
    closeModal(elements.tutorialModal);
    announce('Tutorial abgeschlossen · deine Expedition wartet', 'success');
  }

  function advanceTutorial(direction = 1) {
    const nextStep = game.tutorialStep + direction;
    if (nextStep >= tutorialSlides.length) {
      finishTutorial();
      return;
    }
    game.tutorialStep = Math.max(0, nextStep);
    renderTutorial();
    audio.play('click');
  }

  function showScreen(screen) {
    elements.mainMenu.classList.toggle('is-active', screen === 'menu');
    elements.gameScreen.classList.toggle('is-active', screen === 'game');
    if (screen === 'menu') {
      updateMenuStats();
      closeModal(elements.pauseModal);
      closeModal(elements.completionModal);
      closeModal(elements.tutorialModal);
    }
    if (screen === 'game') {
      requestAnimationFrame(() => {
        resizeCanvas();
        draw();
      });
    }
  }

  function openModal(modal) {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function closeAllModals() {
    [elements.levelModal, elements.settingsModal, elements.achievementsModal, elements.pauseModal, elements.completionModal, elements.tutorialModal]
      .forEach(closeModal);
  }

  function announce(message, tone = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tone}`;
    toast.textContent = message;
    elements.toastStack.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => toast.remove(), 260);
    }, 3200);
  }

  function announceAchievements(achievements) {
    achievements.slice(0, 4).forEach((achievement, index) => {
      setTimeout(() => {
        announce(`${achievement.negative ? '⚠' : '🏆'} ${achievement.title} · Achievement ${achievement.number}/1000`, achievement.negative ? 'warning' : 'achievement');
        audio.play(achievement.negative ? 'wall' : 'achievement');
      }, index * 360);
    });
    if (achievements.length > 4) {
      setTimeout(() => announce(`+${achievements.length - 4} weitere Achievements freigeschaltet`, 'achievement'), 1500);
    }
    updateMenuStats();
  }

  function updateMenuStats() {
    const profile = getProfile();
    const rank = getRank(profile.xp);
    const stats = getAchievementStats();
    elements.menuRank.textContent = `Rang ${rank.rank}`;
    elements.menuRankTitle.textContent = rank.title;
    elements.menuLevel.textContent = `Level ${profile.currentLevel}`;
    elements.menuAchievements.textContent = `${stats.unlocked} / ${stats.total}`;
    elements.continueBtn.textContent = profile.currentLevel > 1 ? `Expedition fortsetzen · Level ${profile.currentLevel}` : 'Expedition beginnen';
    elements.dailyDate.textContent = `${dailyLabel()} · Tagesroute`;
    if (profile.dailyBestDate === dailyDateKey() && profile.dailyBestTime !== null) {
      elements.dailyStatus.textContent = `Seed ${dailySeedToken()} · Bestzeit ${formatTime(profile.dailyBestTime)}.`;
    } else {
      elements.dailyStatus.textContent = `Seed ${dailySeedToken()} · optional und offline spielbar.`;
    }
  }

  function updateMotionTelemetry() {
    if (!elements.motionTelemetry) return;
    const intensity = Math.round(clamp(Number(game.motionTelemetry?.intensity) || 0, 0, 1) * 100);
    if (!motionControls.isEnabled()) {
      elements.motionTelemetry.textContent = 'Sensor wartet · aktiviere die Kugelbrett-Steuerung';
      return;
    }
    if (!game.motionTelemetry.received) {
      elements.motionTelemetry.textContent = 'Sensor aktiviert · warte auf Android-Messwerte …';
      return;
    }
    const speed = Math.max(0, Number(game.motionTelemetry.speed) || 0);
    elements.motionTelemetry.textContent = intensity > 0
      ? `Neigung ${intensity}% · stufenlos ${speed.toFixed(2)} Zellen/s · ${game.motionTelemetry.source}`
      : `Waagerecht · bereit zum Rollen · ${game.motionTelemetry.source}`;
  }

  function updateHud() {
    const profile = getProfile();
    const rank = getRank(profile.xp);
    const elapsed = Math.max(0, now() - game.levelStart);
    elements.currentLevel.textContent = game.level.toLocaleString();
    elements.hudRank.textContent = `Rang ${rank.rank.toLocaleString()}`;
    elements.hudXp.textContent = `${profile.xp.toLocaleString()} XP`;
    elements.hudXpFill.style.width = `${Math.round(rank.progress * 100)}%`;
    elements.keyStatus.textContent = game.hasKey ? 'Schlüssel gesichert' : 'Schlüssel fehlt';
    elements.keyStatus.classList.toggle('is-complete', game.hasKey);
    elements.objectiveText.textContent = game.hasKey ? 'Finde den Ausgang' : 'Finde den Schlüssel';
    elements.timer.textContent = formatTime(elapsed);
    elements.motionStatus.textContent = !motionControls.isEnabled()
      ? 'Touch / Pfeile'
      : game.motionTelemetry.received ? 'Sensor · stufenlos' : 'Sensor wartet …';
    elements.motionStatus.classList.toggle('is-active', motionControls.isEnabled());
    if (elements.difficultyStatus) {
      elements.difficultyStatus.textContent = game.difficulty?.label || 'Warm-up';
    }
    if (elements.savepointStatus) {
      elements.savepointStatus.textContent = `Savepoint: ${game.savepoint?.label || 'Start'}`;
    }
    updateMotionTelemetry();
  }

  function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function startNewRun() {
    resetRun();
    startLevel(1, { daily: false });
  }

  function continueRun() {
    startLevel(getProfile().currentLevel || 1, { daily: false });
  }

  function startDailyChallenge() {
    startLevel(1, { daily: true, seed: createDailySeed() });
  }

  function startLevel(level, options = {}) {
    const nextLevel = Math.max(1, Math.floor(Number(level) || 1));
    closeAllModals();
    game.level = nextLevel;
    game.seed = options.seed ?? createSeed(nextLevel, Date.now() + Math.floor(Math.random() * 100000));
    game.hasKey = false;
    game.completed = false;
    game.paused = false;
    game.active = true;
    game.motionUsed = motionControls.isEnabled();
    game.daily = Boolean(options.daily);
    game.movesThisLevel = 0;
    game.wallBumpsThisLevel = 0;
    game.keyMoves = null;
    game.routeHint = [];
    game.difficulty = getLevelDifficulty(nextLevel);
    game.hazards = { holes: [] };
    game.savepoint = { x: 1, y: 1, hasKey: false, label: 'Start' };
    game.playerTween = null;
    game.rolling = { dx: 0, dy: 0, intensity: 0, angle: 0 };
    game.motionPosition = { x: 1.5, y: 1.5 };
    game.motionLastCell = { x: 1, y: 1 };
    game.motionTrail = [];
    game.motionFrameAt = now();
    game.lastMotionMoveAt = 0;
    game.motionTelemetry = { intensity: 0, x: 0, y: 0, speed: 0, velocityX: 0, velocityY: 0, received: false, source: 'none' };
    motionControls.resetVelocity();
    game.lastMove = 0;
    game.fallFlashUntil = 0;
    stopDirectionalHold();
    game.inputShieldUntil = Date.now() + 220;
    markInput(game.daily ? 'Daily route' : 'Bereit');
    game.levelStart = now();
    if (!game.daily) updateProfile({ currentLevel: nextLevel });
    showScreen('game');
    resizeCanvas();
    const mazeData = initMaze(elements.canvas, game.cellSize, nextLevel, game.seed);
    game.maze = mazeData.maze;
    game.cols = mazeData.cols;
    game.rows = mazeData.rows;
    game.exit = mazeData.exit;
    generateMaze(game.maze, game.cols, game.rows, nextLevel, game.seed);
    game.key = chooseKey(game.maze, game.cols, game.rows, game.exit, game.seed);
    game.player = { x: 1, y: 1 };
    game.hazards = applyLevelHazards(game.maze, game.cols, game.rows, nextLevel, game.seed, game.player, game.key, game.exit);
    if (comfortPreset().showRouteHint) {
      game.routeHint = solveMaze(game.maze, game.player, game.key, game.cols, game.rows).slice(0, 8);
    }
    updateHud();
    announce(`${game.daily ? 'Daily route' : `Level ${nextLevel.toLocaleString()}`} generiert · ${game.cols} × ${game.rows} Zellen`, 'info');
    audio.play('click');
    draw();
  }

  function completeLevel() {
    game.completed = true;
    stopDirectionalHold();
    motionControls.resetVelocity();
    const durationMs = now() - game.levelStart;
    const rankBefore = getRank(getProfile().xp).rank;
    const newAchievements = recordLevelComplete({
      level: game.level,
      durationMs,
      usedMotion: game.motionUsed,
      moves: game.movesThisLevel,
      wallBumps: game.wallBumpsThisLevel,
      daily: game.daily
    });
    const profile = getProfile();
    const xpGain = 100 + Math.min(500, game.level * 5);
    elements.completionTitle.textContent = `Level ${game.level.toLocaleString()} gemeistert`;
    elements.completionSummary.textContent = `${game.daily ? 'Daily route' : 'Expedition'} · ${profile.levelsCompleted.toLocaleString()} abgeschlossene Level · ${game.motionUsed ? 'mit Sensorsteuerung' : 'klassisch gespielt'}`;
    elements.completionXp.textContent = `+${xpGain} XP`;
    elements.completionNextBtn.textContent = `Weiter zu Level ${(game.level + 1).toLocaleString()}`;
    elements.completionRecap.innerHTML = [
      ['Zeit', formatTime(durationMs)],
      ['Moves', game.movesThisLevel.toLocaleString()],
      ['Schlüssel', game.keyMoves === null ? 'Start' : `${game.keyMoves} Moves`],
      ['Wände', game.wallBumpsThisLevel.toLocaleString()],
      ['Nächstes Ziel', game.daily ? 'Daily schlagen' : `Level ${game.level + 1}`],
      ['Rang', `Rang ${getRank(profile.xp).rank}`]
    ].map(([label, value]) => `<div class="recap-stat"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
    updateHud();
    openModal(elements.completionModal);
    hapticPulse([18, 40, 28]);
    audio.play('complete');
    if (getRank(profile.xp).rank > rankBefore) audio.play('rank');
    announceAchievements(newAchievements);
    updateMenuStats();
  }

  function handleCellArrival(source = 'input') {
    const landedCell = game.maze[game.player.y]?.[game.player.x];
    if (landedCell?.hazard === 'hole') {
      triggerFall();
      return true;
    }

    if (!game.hasKey && game.player.x === game.key.x && game.player.y === game.key.y) {
      game.hasKey = true;
      game.keyMoves = game.movesThisLevel;
      game.savepoint = { x: game.player.x, y: game.player.y, hasKey: true, label: 'Schlüssel-Savepoint' };
      const newAchievements = recordKey();
      announce('Schlüssel gesichert · Ausgang aktiviert', 'success');
      audio.play('key');
      announceAchievements(newAchievements);
      if (comfortPreset().showRouteHint) {
        game.routeHint = solveMaze(game.maze, game.player, game.exit, game.cols, game.rows).slice(0, 8);
      }
    }

    if (game.player.x === game.exit.x && game.player.y === game.exit.y) {
      if (game.hasKey) {
        completeLevel();
      } else {
        announce('Der Ausgang ist versiegelt. Finde zuerst den Schlüssel.', 'warning');
        audio.play('wall');
        motionControls.resetVelocity();
        stopDirectionalHold();
        return false;
      }
    }
    return true;
  }

  function movePlayer(dx, dy, source = 'input', intensity = 0) {
    if (!game.active || game.paused || game.completed) return false;
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) return false;
    if (source !== 'motion' && Date.now() < game.inputShieldUntil) return null;
    const directionX = clamp(Math.round(dx), -1, 1);
    const directionY = clamp(Math.round(dy), -1, 1);
    if ((directionX === 0 && directionY === 0) || (directionX !== 0 && directionY !== 0)) return false;
    const timestamp = Date.now();
    const normalizedIntensity = clamp(Number(intensity) || 0, 0, 1);
    // Manual input keeps its readable cell cadence. Motion Control is handled
    // by moveContinuousBall(), where the physics module owns velocity.
    const delay = source === 'motion'
      ? Math.max(44, CONFIG.motionMoveDelay / (0.35 + normalizedIntensity * 1.65))
      : comfortPreset().moveDelay;
    if (timestamp - game.lastMove < delay) return null;
    game.lastMove = timestamp;
    if (!canMove(game.maze, game.player, directionX, directionY)) {
      game.wallBumpsThisLevel += 1;
      const newAchievements = recordWallBump();
      if (source !== 'motion') hapticPulse(5);
      audio.play('wall');
      markInput('Wandkontakt', 'warning');
      announceAchievements(newAchievements);
      return false;
    }

    const previousPlayer = { ...game.player };
    game.player = { x: game.player.x + directionX, y: game.player.y + directionY };
    game.playerTween = { from: previousPlayer, to: { ...game.player }, started: now(), duration: Math.max(68, delay * 0.82) };
    game.motionPosition = { x: game.player.x + 0.5, y: game.player.y + 0.5 };
    game.motionLastCell = { ...game.player };
    game.rolling = {
      dx: directionX,
      dy: directionY,
      intensity: source === 'motion' ? normalizedIntensity : 0.78,
      angle: game.rolling.angle + (directionX - directionY) * Math.PI * 0.62
    };
    game.movesThisLevel += 1;
    recordMove();
    hapticPulse(4);
    audio.play('move');
    markInput(source === 'motion' ? 'Tilt' : 'Move');

    if (!handleCellArrival(source)) return false;
    updateHud();
    draw();
    return true;
  }

  function moveContinuousBall(deltaSeconds) {
    if (!game.active || game.paused || game.completed || !motionControls.isEnabled() || !game.maze.length) return;
    const movement = motionControls.tick(deltaSeconds);
    game.motionTelemetry = movement;
    if (!movement.calibrated || !movement.isRolling) return;

    const radius = CONFIG.physics.ballRadius;
    const position = { ...game.motionPosition };
    const minX = 1 + radius;
    const minY = 1 + radius;
    const maxX = game.cols - 1 - radius;
    const maxY = game.rows - 1 - radius;
    const blocked = { x: false, y: false };

    const moveAxis = (axis, amount) => {
      if (!amount) return;
      const coordinate = axis === 'x' ? position.x : position.y;
      const cellX = clamp(Math.floor(position.x), 1, game.cols - 2);
      const cellY = clamp(Math.floor(position.y), 1, game.rows - 2);
      const cell = game.maze[cellY]?.[cellX];
      if (!cell) return;
      const positive = amount > 0;
      const wallIndex = axis === 'x' ? (positive ? 1 : 3) : (positive ? 2 : 0);
      const boundary = axis === 'x'
        ? (positive ? cellX + 1 : cellX)
        : (positive ? cellY + 1 : cellY);
      const limit = positive ? boundary - radius : boundary + radius;
      const next = coordinate + amount;
      if ((positive && cell.walls[wallIndex] && next > limit) || (!positive && cell.walls[wallIndex] && next < limit)) {
        if (axis === 'x') position.x = limit;
        else position.y = limit;
        blocked[axis] = true;
        return;
      }
      if (axis === 'x') position.x = clamp(next, minX, maxX);
      else position.y = clamp(next, minY, maxY);
    };

    moveAxis('x', movement.velocityX * deltaSeconds);
    moveAxis('y', movement.velocityY * deltaSeconds);
    if (blocked.x) motionControls.hitWall('x');
    if (blocked.y) motionControls.hitWall('y');
    game.motionPosition = { x: clamp(position.x, minX, maxX), y: clamp(position.y, minY, maxY) };
    game.playerTween = null;
    game.motionTrail.push({ ...game.motionPosition, at: Date.now() });
    if (game.motionTrail.length > 10) game.motionTrail.shift();
    game.rolling = {
      dx: movement.x,
      dy: movement.y,
      intensity: movement.intensity,
      angle: game.rolling.angle + ((movement.velocityX - movement.velocityY) * deltaSeconds) / Math.max(0.2, radius)
    };

    const currentCell = {
      x: clamp(Math.floor(game.motionPosition.x), 1, game.cols - 2),
      y: clamp(Math.floor(game.motionPosition.y), 1, game.rows - 2)
    };
    if (currentCell.x === game.motionLastCell.x && currentCell.y === game.motionLastCell.y) return;
    game.motionLastCell = currentCell;
    game.player = currentCell;
    game.movesThisLevel += 1;
    recordMove();
    const timestamp = Date.now();
    if (timestamp - game.lastMotionMoveAt > 105) {
      game.lastMotionMoveAt = timestamp;
      audio.play('move');
    }
    markInput('Stufenloses Rollen');
    if (!handleCellArrival('motion-continuous')) return;
    updateHud();
  }

  function triggerFall() {
    const savepoint = game.savepoint || { x: 1, y: 1, hasKey: false, label: 'Start' };
    const fallenFrom = { ...game.player };
    game.hasKey = Boolean(savepoint.hasKey);
    game.player = { x: savepoint.x, y: savepoint.y };
    game.motionPosition = { x: savepoint.x + 0.5, y: savepoint.y + 0.5 };
    game.motionLastCell = { ...game.player };
    game.motionTrail = [];
    motionControls.resetVelocity();
    game.playerTween = { from: fallenFrom, to: { ...game.player }, started: now(), duration: 260 };
    game.rolling = { dx: 0, dy: 0, intensity: 0, angle: game.rolling.angle };
    game.fallFlashUntil = Date.now() + 520;
    stopDirectionalHold();
    hapticPulse([12, 45, 12]);
    audio.play('fall');
    markInput('Fallloch · zurück zum Savepoint', 'warning');
    announce(`Fallloch · zurück zu ${savepoint.label}`, 'warning');
    const newAchievements = recordFall();
    announceAchievements(newAchievements);
    game.routeHint = comfortPreset().showRouteHint
      ? solveMaze(game.maze, game.player, game.hasKey ? game.exit : game.key, game.cols, game.rows).slice(0, 8)
      : [];
    updateHud();
    draw();
  }

  function stopDirectionalHold() {
    if (game.manualHoldTimer) window.clearInterval(game.manualHoldTimer);
    game.manualHoldTimer = null;
    game.manualHold = null;
    document.querySelectorAll('.dpad-btn.is-pressed').forEach((button) => button.classList.remove('is-pressed'));
  }

  function startDirectionalHold(dx, dy, source = 'swipe') {
    const directionX = clamp(Math.round(dx), -1, 1);
    const directionY = clamp(Math.round(dy), -1, 1);
    if ((directionX === 0 && directionY === 0) || (directionX !== 0 && directionY !== 0)) return;
    stopDirectionalHold();
    game.manualHold = { dx: directionX, dy: directionY, source };
    const repeat = () => {
      if (!game.manualHold) return;
      const result = movePlayer(game.manualHold.dx, game.manualHold.dy, game.manualHold.source);
      if (result === false) stopDirectionalHold();
    };
    repeat();
    game.manualHoldTimer = window.setInterval(repeat, Math.max(38, comfortPreset().moveDelay * 0.68));
  }

  function togglePause() {
    if (!game.active || game.completed) return;
    game.paused = !game.paused;
    if (game.paused) {
      elements.pauseModal.classList.add('is-open');
      elements.pauseModal.setAttribute('aria-hidden', 'false');
    } else {
      closeModal(elements.pauseModal);
      game.levelStart += now() - (game.pauseStarted || now());
    }
    if (game.paused) game.pauseStarted = now();
  }

  function resizeCanvas() {
    const rect = elements.canvasViewport.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    game.viewport = { width, height };
    game.dpr = Math.min(2, window.devicePixelRatio || 1);
    elements.canvas.width = Math.floor(width * game.dpr);
    elements.canvas.height = Math.floor(height * game.dpr);
    ctx.setTransform(game.dpr, 0, 0, game.dpr, 0, 0);
    game.cellSize = clamp(Math.floor(Math.min(width, height) / 13), CONFIG.minCellSize, CONFIG.maxCellSize);
    resizeMiniMap();
    draw();
  }

  function resizeMiniMap() {
    const rect = elements.miniMap.getBoundingClientRect();
    const size = Math.max(96, Math.floor(Math.min(rect.width || 128, rect.height || 128)));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    elements.miniMap.width = Math.floor(size * dpr);
    elements.miniMap.height = Math.floor(size * dpr);
    miniCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    const { width, height } = game.viewport;
    if (!width || !height) return;
    const colors = palette();
    ctx.clearRect(0, 0, width, height);
    const atmosphere = ctx.createRadialGradient(width * 0.52, height * 0.42, 0, width * 0.52, height * 0.42, Math.max(width, height) * 0.78);
    atmosphere.addColorStop(0, colors.floorAlt);
    atmosphere.addColorStop(0.55, colors.background);
    atmosphere.addColorStop(1, '#03040d');
    ctx.fillStyle = atmosphere;
    ctx.fillRect(0, 0, width, height);
    if (!game.maze.length) return;

    const worldWidth = game.cols * game.cellSize;
    const worldHeight = game.rows * game.cellSize;
    const playerCenterX = (motionControls.isEnabled() ? game.motionPosition.x : game.player.x + 0.5) * game.cellSize;
    const playerCenterY = (motionControls.isEnabled() ? game.motionPosition.y : game.player.y + 0.5) * game.cellSize;
    const follow = getProfile().cameraFollow;
    const desiredViewX = playerCenterX - (width * follow) / 2;
    const desiredViewY = playerCenterY - (height * follow) / 2;
    const viewX = worldWidth <= width ? (worldWidth - width) / 2 : clamp(desiredViewX, 0, worldWidth - width);
    const viewY = worldHeight <= height ? (worldHeight - height) / 2 : clamp(desiredViewY, 0, worldHeight - height);
    const startX = Math.max(0, Math.floor(viewX / game.cellSize) - 1);
    const endX = Math.min(game.cols - 1, Math.ceil((viewX + width) / game.cellSize) + 1);
    const startY = Math.max(0, Math.floor(viewY / game.cellSize) - 1);
    const endY = Math.min(game.rows - 1, Math.ceil((viewY + height) / game.cellSize) + 1);

    ctx.save();
    ctx.translate(-viewX, -viewY);
    for (let y = startY; y <= endY; y += 1) {
      for (let x = startX; x <= endX; x += 1) {
        const cell = game.maze[y][x];
        drawCellSurface(cell, colors);
        if (cell.hazard === 'hole') drawHole(cell, colors);
        drawCellWalls(cell, colors);
      }
    }

    drawRouteHint(colors);
    drawMarker(game.key, colors.key, '⌁', !game.hasKey);
    drawMarker(game.exit, colors.exit, '↗', game.hasKey);
    drawMotionTrail(colors);
    drawPlayer(colors);
    ctx.restore();

    if (!game.hasKey) drawOffscreenIndicator(game.key, colors.key, 'KEY', viewX, viewY);
    if (game.hasKey) drawOffscreenIndicator(game.exit, colors.exit, 'EXIT', viewX, viewY);
    if (game.fallFlashUntil > Date.now()) {
      ctx.fillStyle = `rgba(255, 107, 138, ${Math.max(0, (game.fallFlashUntil - Date.now()) / 2400)})`;
      ctx.fillRect(0, 0, width, height);
    }
    drawMiniMap(colors);
  }

  function drawCellSurface(cell, colors) {
    const size = game.cellSize;
    const x = cell.x * size;
    const y = cell.y * size;
    const rhythm = (cell.x * 17 + cell.y * 31) % 5;
    const surface = ctx.createLinearGradient(x, y, x + size, y + size);
    surface.addColorStop(0, rhythm % 2 === 0 ? colors.floorAlt : colors.floor);
    surface.addColorStop(0.54, colors.floor);
    surface.addColorStop(1, rhythm === 0 ? '#080b20' : colors.background);
    ctx.fillStyle = surface;
    ctx.fillRect(x, y, size, size);

    ctx.save();
    ctx.globalAlpha = 0.34;
    ctx.strokeStyle = colors.wallGlow;
    ctx.lineWidth = Math.max(0.5, size * 0.012);
    ctx.strokeRect(x + size * 0.14, y + size * 0.14, size * 0.72, size * 0.72);
    if (rhythm === 0 || rhythm === 3) {
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.arc(x + size * 0.74, y + size * 0.27, size * 0.12, 0.15, Math.PI * 1.22);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + size * 0.25, y + size * 0.78, size * 0.08, Math.PI * 1.12, Math.PI * 1.8);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCellWalls(cell, colors) {
    const size = game.cellSize;
    const x = cell.x * size;
    const y = cell.y * size;

    const wallPath = () => {
      ctx.beginPath();
      if (cell.walls[0]) { ctx.moveTo(x, y); ctx.lineTo(x + size, y); }
      if (cell.walls[1]) { ctx.moveTo(x + size, y); ctx.lineTo(x + size, y + size); }
      if (cell.walls[2]) { ctx.moveTo(x, y + size); ctx.lineTo(x + size, y + size); }
      if (cell.walls[3]) { ctx.moveTo(x, y); ctx.lineTo(x, y + size); }
    };

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    wallPath();
    ctx.strokeStyle = 'rgba(1, 3, 14, .92)';
    ctx.lineWidth = Math.max(4, size * 0.135);
    ctx.shadowColor = 'rgba(0,0,0,.58)';
    ctx.shadowBlur = size * 0.18;
    ctx.stroke();

    wallPath();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = colors.wall;
    ctx.lineWidth = Math.max(1.5, size * 0.052);
    ctx.stroke();

    wallPath();
    ctx.globalAlpha = 0.52;
    ctx.strokeStyle = colors.wallGlow;
    ctx.lineWidth = Math.max(0.7, size * 0.016);
    ctx.stroke();
    ctx.restore();
  }

  function drawHole(cell, colors) {
    const centerX = (cell.x + 0.5) * game.cellSize;
    const centerY = (cell.y + 0.5) * game.cellSize;
    const radius = game.cellSize * (cell.holeRadius || 0.25);
    const pulse = getProfile().reducedMotion ? 0 : Math.sin(now() / 280 + cell.x * 0.7 + cell.y * 0.4) * 0.08;
    const outerRadius = radius * (1.42 + pulse);
    const glow = ctx.createRadialGradient(centerX, centerY, radius * 0.08, centerX, centerY, outerRadius * 1.36);
    glow.addColorStop(0, '#01020a');
    glow.addColorStop(0.44, colors.hole);
    glow.addColorStop(0.72, 'rgba(255, 107, 138, .18)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.save();
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius * 1.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.56)';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + radius * 0.18, radius * 1.05, radius * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.holeGlow;
    ctx.globalAlpha = 0.76;
    ctx.lineWidth = Math.max(1.2, game.cellSize * 0.045);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.02, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.34;
    ctx.setLineDash([game.cellSize * 0.09, game.cellSize * 0.14]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, -0.72, Math.PI * 1.6);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.78;
    ctx.fillStyle = colors.holeGlow;
    ctx.beginPath();
    ctx.arc(centerX + radius * 0.68, centerY - radius * 0.58, Math.max(1.2, game.cellSize * 0.035), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawMotionTrail(colors) {
    if (!motionControls.isEnabled() || game.motionTrail.length < 2 || getProfile().reducedMotion) return;
    ctx.save();
    game.motionTrail.forEach((point, index) => {
      const opacity = ((index + 1) / game.motionTrail.length) * 0.18;
      const radius = game.cellSize * (0.08 + (index / game.motionTrail.length) * 0.1);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = colors.player;
      ctx.shadowColor = colors.player;
      ctx.shadowBlur = 9;
      ctx.beginPath();
      ctx.arc(point.x * game.cellSize, point.y * game.cellSize, radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawMarker(point, color, glyph, visible) {
    if (!visible) return;
    const x = (point.x + 0.5) * game.cellSize;
    const y = (point.y + 0.5) * game.cellSize;
    const radius = game.cellSize * 0.28;
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#071018';
    ctx.font = `700 ${Math.max(12, game.cellSize * 0.42)}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(glyph, x, y + 1);
    ctx.restore();
  }

  function drawRouteHint(colors) {
    if (!game.routeHint || game.routeHint.length < 2 || game.hasKey) return;
    ctx.save();
    ctx.strokeStyle = colors.key;
    ctx.globalAlpha = 0.34;
    ctx.lineWidth = Math.max(2, game.cellSize * 0.1);
    ctx.setLineDash([game.cellSize * 0.16, game.cellSize * 0.22]);
    ctx.lineCap = 'round';
    ctx.beginPath();
    game.routeHint.forEach((point, index) => {
      const x = (point.x + 0.5) * game.cellSize;
      const y = (point.y + 0.5) * game.cellSize;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();
  }

  function drawPlayer(colors) {
    let visualX = game.player.x;
    let visualY = game.player.y;
    let progress = 1;
    const continuous = motionControls.isEnabled() && game.maze.length > 0;
    if (continuous) {
      visualX = game.motionPosition.x - 0.5;
      visualY = game.motionPosition.y - 0.5;
    } else if (game.playerTween) {
      progress = clamp((now() - game.playerTween.started) / game.playerTween.duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      visualX = game.playerTween.from.x + (game.playerTween.to.x - game.playerTween.from.x) * eased;
      visualY = game.playerTween.from.y + (game.playerTween.to.y - game.playerTween.from.y) * eased;
      if (progress >= 1) game.playerTween = null;
    }
    const x = (visualX + 0.5) * game.cellSize;
    const y = (visualY + 0.5) * game.cellSize;
    const theme = ballTheme();
    const rollingSpeed = Math.max(0, Number(game.motionTelemetry?.speed) || 0, (game.rolling.intensity || 0) * 2.4);
    const pulse = getProfile().reducedMotion ? 0 : Math.sin(now() / 220) * 0.025;
    const radius = game.cellSize * (0.34 + pulse);
    const squash = getProfile().reducedMotion ? 0 : clamp(rollingSpeed * 0.022, 0, 0.1);
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.34)';
    ctx.globalAlpha = 0.7;
    ctx.translate(x + radius * 0.1, y + radius * 0.52);
    ctx.scale(1.18, 0.34);
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 0.82, radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    const seamRotation = getProfile().reducedMotion ? 0 : game.rolling.angle + progress * 1.35;
    ctx.translate(x, y);
    if (theme.pattern === 'pizza') {
      drawDavePizza(theme, radius, seamRotation, squash);
    } else {
      drawSphericalBall(theme, radius, seamRotation, squash);
    }
    ctx.restore();
  }

  function drawSphericalBall(theme, radius, rotation, squash) {
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(rotation);
    ctx.scale(1 + squash, 1 - squash * 0.72);
    const sphere = ctx.createRadialGradient(-radius * 0.32, -radius * 0.38, radius * 0.06, radius * 0.08, radius * 0.1, radius * 1.12);
    sphere.addColorStop(0, theme.highlight);
    sphere.addColorStop(0.18, theme.base);
    sphere.addColorStop(0.72, theme.base);
    sphere.addColorStop(1, theme.shadow);
    ctx.fillStyle = sphere;
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 18 + squash * 70;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // A bright rim, specular spot and curved shade make every non-Dave theme
    // read as a solid 3D ball instead of a flat coloured token.
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, radius * 0.045);
    ctx.beginPath();
    ctx.arc(-radius * 0.08, -radius * 0.06, radius * 0.88, Math.PI * 1.05, Math.PI * 1.75);
    ctx.stroke();
    ctx.globalAlpha = 0.74;
    ctx.fillStyle = 'rgba(255,255,255,.72)';
    ctx.beginPath();
    ctx.ellipse(-radius * 0.3, -radius * 0.36, radius * 0.24, radius * 0.13, -0.46, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = 'rgba(0,0,0,.78)';
    ctx.lineWidth = Math.max(1.2, radius * 0.11);
    ctx.beginPath();
    ctx.arc(radius * 0.12, radius * 0.12, radius * 0.79, 0.14, Math.PI * 1.36);
    ctx.stroke();

    drawBallPattern(theme, radius, rotation);
    drawBallFace(theme, radius);
    ctx.restore();
  }

  function drawDavePizza(theme, radius, rotation, squash) {
    ctx.save();
    ctx.rotate(rotation);
    ctx.scale(1 + squash * 0.36, 1 - squash * 0.48);
    ctx.shadowColor = '#ff9f43';
    ctx.shadowBlur = 16 + squash * 56;

    // Dave is intentionally a pizza first and a ball second: thick baked
    // crust, tomato sauce, melted cheese, slice cuts and visible toppings.
    const crust = ctx.createRadialGradient(-radius * 0.24, -radius * 0.32, radius * 0.04, 0, 0, radius * 1.04);
    crust.addColorStop(0, '#ffd774');
    crust.addColorStop(0.6, '#c96a2f');
    crust.addColorStop(1, '#6b2b1e');
    ctx.fillStyle = crust;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#a63b2d';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();

    const cheese = ctx.createRadialGradient(-radius * 0.2, -radius * 0.26, radius * 0.04, 0, 0, radius * 0.9);
    cheese.addColorStop(0, '#fff2a8');
    cheese.addColorStop(0.5, '#ffd653');
    cheese.addColorStop(1, '#e49a2f');
    ctx.fillStyle = cheese;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.82, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,247,171,.72)';
    ctx.lineWidth = Math.max(1.1, radius * 0.055);
    for (let slice = 0; slice < 8; slice += 1) {
      const angle = slice * Math.PI / 4 + 0.1;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * radius * 0.08, Math.sin(angle) * radius * 0.08);
      ctx.lineTo(Math.cos(angle) * radius * 0.77, Math.sin(angle) * radius * 0.77);
      ctx.stroke();
    }

    const toppings = [
      [-0.38, -0.28, 0.105, '#c93636'], [0.23, -0.31, 0.11, '#d94a36'],
      [0.39, 0.18, 0.095, '#b92e32'], [-0.08, 0.36, 0.105, '#cf3f35'],
      [-0.48, 0.22, 0.07, '#4f9b55'], [0.08, -0.02, 0.065, '#4f9b55']
    ];
    toppings.forEach(([tx, ty, tr, color], index) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(tx * radius, ty * radius, tr * radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = index > 3 ? 'rgba(39,91,44,.72)' : 'rgba(101,30,26,.72)';
      ctx.lineWidth = Math.max(0.7, radius * 0.025);
      ctx.stroke();
      if (index < 4) {
        ctx.fillStyle = 'rgba(255,157,91,.7)';
        ctx.beginPath();
        ctx.arc((tx - 0.03) * radius, (ty - 0.04) * radius, tr * radius * 0.24, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.strokeStyle = '#ffe28a';
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = Math.max(1.2, radius * 0.07);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.87, -2.55, 0.2);
    ctx.stroke();
    drawBallFace(theme, radius, true);
    ctx.restore();
  }

  function drawBallFace(theme, radius, pizza = false) {
    const faceColor = pizza ? 'rgba(83,35,21,.92)' : 'rgba(18,12,36,.9)';
    ctx.fillStyle = faceColor;
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    ctx.arc(-radius * 0.2, -radius * 0.03, radius * 0.075, 0, Math.PI * 2);
    ctx.arc(radius * 0.2, -radius * 0.03, radius * 0.075, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pizza ? 'rgba(255,250,204,.88)' : 'rgba(255,255,255,.78)';
    ctx.beginPath();
    ctx.arc(-radius * 0.175, -radius * 0.055, radius * 0.022, 0, Math.PI * 2);
    ctx.arc(radius * 0.225, -radius * 0.055, radius * 0.022, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = faceColor;
    ctx.lineWidth = Math.max(0.8, radius * 0.025);
    ctx.beginPath();
    ctx.arc(0, radius * 0.09, radius * 0.2, 0.18, Math.PI - 0.18);
    ctx.stroke();
  }

  function drawBallPattern(theme, radius, rotation) {
    if (!theme?.pattern) return;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.985, 0, Math.PI * 2);
    ctx.clip();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = theme.accent;
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = 0.74;
    const line = Math.max(1, radius * 0.085);

    if (theme.pattern === 'pizza') {
      ctx.globalAlpha = 0.92;
      ctx.strokeStyle = '#a8512c';
      ctx.lineWidth = radius * 0.18;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.87, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#ffe28a';
      ctx.lineWidth = radius * 0.08;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.73, -0.6, Math.PI * 1.7);
      ctx.stroke();
      const toppings = [[-0.28, -0.18, 0.11], [0.28, -0.08, 0.1], [0.02, 0.28, 0.105], [-0.38, 0.27, 0.07]];
      toppings.forEach(([tx, ty, tr], index) => {
        ctx.fillStyle = index === 3 ? '#4e9e57' : '#cf3f35';
        ctx.beginPath();
        ctx.arc(tx * radius, ty * radius, tr * radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(95,32,26,.68)';
        ctx.lineWidth = Math.max(0.7, radius * 0.025);
        ctx.stroke();
      });
    } else if (theme.pattern === 'rings') {
      ctx.lineWidth = line * 0.72;
      [0.35, 0.58, 0.82].forEach((ring, index) => {
        ctx.globalAlpha = 0.32 + index * 0.18;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * ring, radius * ring * (0.44 + index * 0.09), rotation * 0.16, 0, Math.PI * 2);
        ctx.stroke();
      });
    } else if (theme.pattern === 'crystal') {
      ctx.globalAlpha = 0.48;
      ctx.lineWidth = line * 0.62;
      [[-0.62, -0.08, -0.14, -0.6, 0.12, 0.04], [0.16, -0.72, 0.56, -0.08, 0.08, 0.1], [-0.38, 0.54, 0.02, 0.08, 0.64, 0.56]].forEach((points) => {
        ctx.beginPath();
        ctx.moveTo(points[0] * radius, points[1] * radius);
        ctx.lineTo(points[2] * radius, points[3] * radius);
        ctx.lineTo(points[4] * radius, points[5] * radius);
        ctx.closePath();
        ctx.stroke();
      });
    } else if (theme.pattern === 'stars') {
      const star = (sx, sy, sr) => {
        ctx.beginPath();
        for (let point = 0; point < 8; point += 1) {
          const angle = -Math.PI / 2 + point * Math.PI / 4;
          const size = point % 2 === 0 ? sr : sr * 0.28;
          const px = sx + Math.cos(angle) * size;
          const py = sy + Math.sin(angle) * size;
          if (point === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      };
      ctx.globalAlpha = 0.86;
      star(-radius * 0.42, -radius * 0.32, radius * 0.13);
      star(radius * 0.34, -radius * 0.02, radius * 0.1);
      star(-radius * 0.12, radius * 0.42, radius * 0.08);
    } else if (theme.pattern === 'circuit') {
      ctx.globalAlpha = 0.78;
      ctx.lineWidth = line * 0.62;
      [[-0.78, -0.26, -0.26, -0.26, -0.08, -0.5], [0.2, -0.7, 0.2, -0.2, 0.7, -0.2], [-0.62, 0.25, -0.2, 0.25, -0.2, 0.66], [0.14, 0.58, 0.52, 0.58, 0.52, 0.24]].forEach((points) => {
        ctx.beginPath();
        ctx.moveTo(points[0] * radius, points[1] * radius);
        ctx.lineTo(points[2] * radius, points[3] * radius);
        ctx.lineTo(points[4] * radius, points[5] * radius);
        ctx.stroke();
        ctx.fillStyle = theme.highlight;
        ctx.beginPath();
        ctx.arc(points[4] * radius, points[5] * radius, radius * 0.055, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (theme.pattern === 'leaf') {
      ctx.globalAlpha = 0.62;
      ctx.lineWidth = line * 0.62;
      for (let index = -1; index <= 1; index += 1) {
        ctx.beginPath();
        ctx.moveTo(-radius * 0.78, index * radius * 0.2);
        ctx.bezierCurveTo(-radius * 0.2, index * radius * 0.56, radius * 0.2, -index * radius * 0.56, radius * 0.82, -index * radius * 0.14);
        ctx.stroke();
      }
    } else if (theme.pattern === 'ember' || theme.pattern === 'flare') {
      ctx.globalAlpha = 0.68;
      ctx.lineWidth = line * 0.7;
      for (let index = 0; index < 4; index += 1) {
        ctx.beginPath();
        ctx.arc(-radius * 0.08, radius * 0.1, radius * (0.34 + index * 0.14), -1.1 + index * 0.18, 0.35 + index * 0.22);
        ctx.stroke();
      }
      if (theme.pattern === 'flare') {
        ctx.globalAlpha = 0.56;
        for (let ray = 0; ray < 8; ray += 1) {
          const angle = ray * Math.PI / 4 + rotation * 0.18;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * radius * 0.58, Math.sin(angle) * radius * 0.58);
          ctx.lineTo(Math.cos(angle) * radius * 0.94, Math.sin(angle) * radius * 0.94);
          ctx.stroke();
        }
      }
    } else if (theme.pattern === 'relic') {
      ctx.globalAlpha = 0.64;
      ctx.lineWidth = line * 0.62;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.66, radius * 0.28, -0.34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.38, radius * 0.8, 0.34, 0, Math.PI * 2);
      ctx.stroke();
      for (let index = 0; index < 6; index += 1) {
        const angle = index * Math.PI / 3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * radius * 0.7, Math.sin(angle) * radius * 0.7);
        ctx.lineTo(Math.cos(angle) * radius * 0.87, Math.sin(angle) * radius * 0.87);
        ctx.stroke();
      }
    } else {
      ctx.globalAlpha = 0.82;
      ctx.lineWidth = line * 0.7;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.73, radius * 0.32, -0.42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.46;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.46, radius * 0.86, 0.44, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawOffscreenIndicator(target, color, label, viewX, viewY) {
    const targetX = (target.x + 0.5) * game.cellSize - viewX;
    const targetY = (target.y + 0.5) * game.cellSize - viewY;
    const margin = 26;
    if (targetX >= margin && targetX <= game.viewport.width - margin && targetY >= margin && targetY <= game.viewport.height - margin) return;
    const centerX = game.viewport.width / 2;
    const centerY = game.viewport.height / 2;
    const angle = Math.atan2(targetY - centerY, targetX - centerX);
    const radiusX = game.viewport.width / 2 - margin;
    const radiusY = game.viewport.height / 2 - margin;
    const scale = Math.min(Math.abs(radiusX / Math.cos(angle || 0)), Math.abs(radiusY / Math.sin(angle || 0)));
    const x = centerX + Math.cos(angle) * Math.min(radiusX, radiusY, scale);
    const y = centerY + Math.sin(angle) * Math.min(radiusX, radiusY, scale);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-8, -8);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.rotate(-angle);
    ctx.font = '700 9px system-ui';
    ctx.textAlign = 'center';
    if (getProfile().indicatorLabels && comfortPreset().showIndicatorLabels) ctx.fillText(label, 0, 22);
    ctx.restore();
  }

  function drawMiniMap(colors) {
    const rect = elements.miniMap.getBoundingClientRect();
    const width = rect.width || 128;
    const height = rect.height || 128;
    miniCtx.clearRect(0, 0, width, height);
    const miniAtmosphere = miniCtx.createLinearGradient(0, 0, width, height);
    miniAtmosphere.addColorStop(0, colors.floorAlt);
    miniAtmosphere.addColorStop(1, colors.background);
    miniCtx.fillStyle = miniAtmosphere;
    miniCtx.fillRect(0, 0, width, height);
    if (!game.maze.length) return;
    const scale = Math.min((width - 12) / game.cols, (height - 12) / game.rows) * getProfile().minimapZoom;
    const offsetX = (width - game.cols * scale) / 2;
    const offsetY = (height - game.rows * scale) / 2;
    miniCtx.strokeStyle = colors.wall;
    miniCtx.globalAlpha = 0.72;
    miniCtx.lineWidth = Math.max(0.5, scale * 0.14);
    miniCtx.beginPath();
    for (let y = 0; y < game.rows; y += 1) {
      for (let x = 0; x < game.cols; x += 1) {
        const cell = game.maze[y][x];
        const px = offsetX + x * scale;
        const py = offsetY + y * scale;
        if (cell.hazard === 'hole') {
          miniCtx.fillStyle = colors.holeGlow;
          miniCtx.globalAlpha = 0.72;
          miniCtx.fillRect(px + scale * 0.18, py + scale * 0.18, Math.max(1, scale * 0.64), Math.max(1, scale * 0.64));
          miniCtx.globalAlpha = 1;
        }
        if (cell.walls[0]) { miniCtx.moveTo(px, py); miniCtx.lineTo(px + scale, py); }
        if (cell.walls[1]) { miniCtx.moveTo(px + scale, py); miniCtx.lineTo(px + scale, py + scale); }
        if (cell.walls[2]) { miniCtx.moveTo(px, py + scale); miniCtx.lineTo(px + scale, py + scale); }
        if (cell.walls[3]) { miniCtx.moveTo(px, py); miniCtx.lineTo(px, py + scale); }
      }
    }
    miniCtx.stroke();
    miniCtx.globalAlpha = 1;
    drawMiniDot(game.savepoint, colors.accent || colors.exit, scale, offsetX, offsetY);
    drawMiniDot(game.exit, colors.exit, scale, offsetX, offsetY);
    if (!game.hasKey) drawMiniDot(game.key, colors.key, scale, offsetX, offsetY);
    const miniPlayer = motionControls.isEnabled()
      ? { x: game.motionPosition.x - 0.5, y: game.motionPosition.y - 0.5 }
      : game.player;
    drawMiniDot(miniPlayer, ballTheme().base || colors.player, scale, offsetX, offsetY);
  }

  function drawMiniDot(point, color, scale, offsetX, offsetY) {
    miniCtx.fillStyle = color;
    miniCtx.beginPath();
    miniCtx.arc(offsetX + (point.x + 0.5) * scale, offsetY + (point.y + 0.5) * scale, Math.max(2, scale * 0.45), 0, Math.PI * 2);
    miniCtx.fill();
  }

  function renderAchievements() {
    const achievements = getAchievements();
    const unlocked = getUnlockedAchievements();
    const profile = getProfile();
    const collections = getAchievementCollections();
    const filtered = elements.achievementsModal.querySelector('[data-achievement-filter].is-selected')?.dataset.achievementFilter || 'all';
    game.achievementFilter = filtered;
    const visible = achievements.filter((achievement) => filtered === 'all' || achievement.category === filtered);
    elements.achievementProgress.textContent = `${unlocked.size} / ${achievements.length} freigeschaltet`;
    elements.achievementCollections.innerHTML = collections.map((collection) => `<div class="achievement-collection"><strong>${collection.category}</strong><span>${collection.unlocked} / ${collection.total}</span></div>`).join('');
    const next = collections.find((collection) => collection.next)?.next;
    elements.nextAchievementHint.textContent = next ? `Nächstes leichtes Ziel: ${next.title} · ${next.description}` : 'Alle Achievement-Ketten abgeschlossen. Du bist ein Eternal Labyrinthian.';
    elements.achievementsGrid.innerHTML = visible.map((achievement) => {
      const isUnlocked = unlocked.has(achievement.id);
      const progress = Math.min(100, Math.round((getAchievementProgress(achievement, profile) / achievement.threshold) * 100));
      return `<article class="achievement-card ${isUnlocked ? 'is-unlocked' : ''} ${achievement.negative ? 'is-negative' : ''}">
        <div class="achievement-number">${String(achievement.number).padStart(4, '0')}</div>
        <div class="achievement-icon">${achievement.negative ? (isUnlocked ? '⚠' : '◌') : (isUnlocked ? '✦' : '◇')}</div>
        <div class="achievement-copy"><h3>${escapeHtml(achievement.title)}</h3><p>${escapeHtml(achievement.description)}</p>
        <div class="achievement-bar"><span style="width:${isUnlocked ? 100 : progress}%"></span></div></div>
      </article>`;
    }).join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  async function applyMotionSetting(enabled) {
    if (enabled) {
      try {
        const granted = await motionControls.enable();
        if (!granted) throw new Error('permission denied');
        setMotionPreferences({ enabled: true, sensitivity: Number(elements.motionSensitivity.value), invert: elements.invertMotion.checked });
        announce('Sensorsteuerung aktiviert · Gerät leicht neigen', 'success');
      } catch {
        elements.motionToggle.checked = false;
        setMotionPreferences({ enabled: false });
        announce('Sensorfreigabe wurde nicht erteilt oder ist nicht verfügbar.', 'warning');
      }
    } else {
      motionControls.disable();
      setMotionPreferences({ enabled: false });
      announce('Sensorsteuerung deaktiviert', 'info');
    }
    updateHud();
  }

  function syncSettings() {
    const profile = getProfile();
    elements.motionToggle.checked = profile.motionEnabled && motionControls.isEnabled();
    elements.motionSensitivity.value = profile.motionSensitivity;
    elements.motionSensitivityValue.textContent = `${profile.motionSensitivity.toFixed(1)}×`;
    elements.invertMotion.checked = profile.invertMotion;
    elements.hapticsToggle.checked = profile.haptics;
    elements.themeSelect.value = profile.theme;
    elements.ballTheme.value = profile.ballTheme;
    syncBallThemePreview();
    elements.comfortMode.value = profile.comfortMode;
    elements.comfortModeDescription.textContent = CONFIG.comfortModes[profile.comfortMode]?.description || CONFIG.comfortModes.standard.description;
    elements.cameraFollow.value = profile.cameraFollow;
    elements.cameraFollowValue.textContent = `${Math.round(profile.cameraFollow * 100)}%`;
    elements.minimapZoom.value = profile.minimapZoom;
    elements.minimapZoomValue.textContent = `${Number(profile.minimapZoom).toFixed(1)}×`;
    elements.indicatorLabels.checked = profile.indicatorLabels;
    elements.highContrast.checked = profile.highContrast;
    elements.reducedMotion.checked = profile.reducedMotion;
    elements.largeText.checked = profile.largeText;
    elements.leftHanded.checked = profile.leftHanded;
    elements.colorblindSafe.checked = profile.colorblindSafe;
    elements.sfxToggle.checked = profile.sfxEnabled;
    elements.sfxVolume.value = profile.sfxVolume;
    elements.musicToggle.checked = profile.musicEnabled;
    elements.musicVolume.value = profile.musicVolume;
    elements.ambientTrack.value = profile.ambientTrack;
    elements.spaceFxToggle.checked = profile.spaceFxEnabled;
    motionControls.setSensitivity(profile.motionSensitivity);
    motionControls.setInvert(profile.invertMotion);
    applyAccessibility();
  }

  function bindControls() {
    document.addEventListener('pointerdown', () => audio.unlock(), { once: true, passive: true });
    document.addEventListener('keydown', () => audio.unlock(), { once: true, passive: true });
    elements.continueBtn.addEventListener('click', continueRun);
    elements.newRunBtn.addEventListener('click', startNewRun);
    elements.dailyChallengeBtn.addEventListener('click', startDailyChallenge);
    elements.tutorialMenuBtn.addEventListener('click', openTutorial);
    elements.tutorialSkipBtn.addEventListener('click', finishTutorial);
    elements.tutorialPrevBtn.addEventListener('click', () => advanceTutorial(-1));
    elements.tutorialNextBtn.addEventListener('click', () => advanceTutorial(1));
    document.getElementById('openLevelBtn').addEventListener('click', () => {
      elements.levelInput.value = getProfile().currentLevel;
      openModal(elements.levelModal);
    });
    elements.levelStartBtn.addEventListener('click', () => startLevel(elements.levelInput.value));
    document.getElementById('menuAchievementsBtn').addEventListener('click', () => { renderAchievements(); openModal(elements.achievementsModal); });
    document.getElementById('menuSettingsBtn').addEventListener('click', () => { syncSettings(); openModal(elements.settingsModal); });
    document.getElementById('gameSettingsBtn').addEventListener('click', () => { syncSettings(); openModal(elements.settingsModal); });
    elements.togglePanelsBtn?.addEventListener('click', () => {
      const isFocusMode = elements.gameScreen.classList.toggle('focus-mode');
      elements.togglePanelsBtn.textContent = isFocusMode ? '⤡' : '⤢';
      elements.togglePanelsBtn.setAttribute('aria-label', isFocusMode ? 'Kartenansicht wiederherstellen' : 'Spielfeld maximieren');
      requestAnimationFrame(resizeCanvas);
    });
    document.getElementById('backToMenuBtn').addEventListener('click', () => { game.active = false; showScreen('menu'); });
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('resumeBtn').addEventListener('click', togglePause);
    document.getElementById('pauseMenuBtn').addEventListener('click', () => { game.active = false; closeModal(elements.pauseModal); showScreen('menu'); });
    document.getElementById('completionMenuBtn').addEventListener('click', () => { game.active = false; showScreen('menu'); });
    document.getElementById('completionReplayBtn').addEventListener('click', () => startLevel(game.level));
    elements.completionNextBtn.addEventListener('click', () => startLevel(game.level + 1));
    document.getElementById('closeLevelModal').addEventListener('click', () => closeModal(elements.levelModal));
    document.getElementById('closeSettingsModal').addEventListener('click', () => closeModal(elements.settingsModal));
    document.getElementById('closeAchievementsModal').addEventListener('click', () => closeModal(elements.achievementsModal));
    elements.tutorialModal.addEventListener('click', (event) => { if (event.target === elements.tutorialModal) finishTutorial(); });
    document.getElementById('calibrateMotionBtn').addEventListener('click', () => {
      const calibrated = motionControls.calibrate();
      announce(calibrated ? 'Sensoren kalibriert. Halte das Gerät jetzt waagerecht und neige es dann.' : 'Noch keine Messwerte. Aktiviere die Sensoren und bewege das Gerät kurz.', calibrated ? 'success' : 'warning');
    });
    document.getElementById('resetProgressBtn').addEventListener('click', () => {
      if (!window.confirm('Wirklich alle Level-, Rang- und Achievement-Fortschritte löschen?')) return;
      resetAllProgress();
      motionControls.disable();
      syncSettings();
      updateMenuStats();
      openTutorial();
      announce('Fortschritt zurückgesetzt', 'info');
    });
    elements.motionToggle.addEventListener('change', () => applyMotionSetting(elements.motionToggle.checked));
    elements.motionSensitivity.addEventListener('input', () => {
      const value = Number(elements.motionSensitivity.value);
      elements.motionSensitivityValue.textContent = `${value.toFixed(1)}×`;
      motionControls.setSensitivity(value);
      setMotionPreferences({ enabled: motionControls.isEnabled(), sensitivity: value });
    });
    elements.invertMotion.addEventListener('change', () => {
      motionControls.setInvert(elements.invertMotion.checked);
      setMotionPreferences({ enabled: motionControls.isEnabled(), invert: elements.invertMotion.checked });
    });
    elements.hapticsToggle.addEventListener('change', () => setHaptics(elements.hapticsToggle.checked));
    elements.themeSelect.addEventListener('change', () => { updateProfile({ theme: elements.themeSelect.value }); draw(); });
    elements.ballTheme.addEventListener('change', () => {
      setBallTheme(elements.ballTheme.value);
      syncBallThemePreview();
      audio.play('click');
      draw();
    });
    elements.comfortMode.addEventListener('change', () => {
      setComfortMode(elements.comfortMode.value);
      elements.comfortModeDescription.textContent = CONFIG.comfortModes[elements.comfortMode.value].description;
      if (game.active && !game.completed) game.routeHint = CONFIG.comfortModes[elements.comfortMode.value].showRouteHint ? solveMaze(game.maze, game.player, game.hasKey ? game.exit : game.key, game.cols, game.rows).slice(0, 8) : [];
      draw();
      announce(`Komfort-Preset: ${CONFIG.comfortModes[elements.comfortMode.value].label}`, 'success');
    });
    elements.cameraFollow.addEventListener('input', () => {
      const value = Number(elements.cameraFollow.value);
      elements.cameraFollowValue.textContent = `${Math.round(value * 100)}%`;
      setCameraPreferences({ follow: value });
      draw();
    });
    elements.minimapZoom.addEventListener('input', () => {
      const value = Number(elements.minimapZoom.value);
      elements.minimapZoomValue.textContent = `${value.toFixed(1)}×`;
      setCameraPreferences({ minimapZoom: value });
      draw();
    });
    elements.indicatorLabels.addEventListener('change', () => { setCameraPreferences({ indicatorLabels: elements.indicatorLabels.checked }); draw(); });
    [elements.highContrast, elements.reducedMotion, elements.largeText, elements.leftHanded, elements.colorblindSafe].forEach((input) => input.addEventListener('change', () => {
      setAccessibilityPreferences({
        highContrast: elements.highContrast.checked,
        reducedMotion: elements.reducedMotion.checked,
        largeText: elements.largeText.checked,
        leftHanded: elements.leftHanded.checked,
        colorblindSafe: elements.colorblindSafe.checked
      });
      applyAccessibility();
      draw();
    }));
    elements.sfxToggle.addEventListener('change', () => { audio.unlock(); audio.setSfxEnabled(elements.sfxToggle.checked); setAudioPreferences({ sfxEnabled: elements.sfxToggle.checked }); });
    elements.sfxVolume.addEventListener('input', () => { const value = Number(elements.sfxVolume.value); audio.setSfxVolume(value); setAudioPreferences({ sfxVolume: value }); });
    elements.musicToggle.addEventListener('change', () => { audio.unlock(); audio.setMusicEnabled(elements.musicToggle.checked); setAudioPreferences({ musicEnabled: elements.musicToggle.checked }); });
    elements.musicVolume.addEventListener('input', () => { const value = Number(elements.musicVolume.value); audio.setMusicVolume(value); setAudioPreferences({ musicVolume: value }); });
    elements.ambientTrack.addEventListener('change', () => { audio.unlock(); audio.setAmbientTrack(elements.ambientTrack.value); setAudioPreferences({ ambientTrack: elements.ambientTrack.value }); });
    elements.spaceFxToggle.addEventListener('change', () => { audio.unlock(); audio.setSpaceFxEnabled(elements.spaceFxToggle.checked); setAudioPreferences({ spaceFxEnabled: elements.spaceFxToggle.checked }); });
    elements.backupExportBtn.addEventListener('click', writeBackupCode);
    elements.backupCopyBtn.addEventListener('click', copyBackupCode);
    elements.backupImportBtn.addEventListener('click', importBackupCode);
    elements.achievementsModal.querySelectorAll('[data-achievement-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        elements.achievementsModal.querySelectorAll('[data-achievement-filter]').forEach((item) => item.classList.remove('is-selected'));
        button.classList.add('is-selected');
        renderAchievements();
      });
    });
    document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', () => closeModal(button.closest('.modal'))));
    document.querySelectorAll('[data-toggle-panel]').forEach((button) => {
      button.addEventListener('click', () => {
        const panel = button.closest('[data-panel]');
        if (!panel) return;
        const collapsed = panel.classList.toggle('is-collapsed');
        button.textContent = collapsed ? '+' : '−';
        button.setAttribute('aria-expanded', String(!collapsed));
        button.setAttribute('aria-label', collapsed ? 'Bereich maximieren' : 'Bereich minimieren');
        requestAnimationFrame(resizeCanvas);
      });
    });
    document.querySelectorAll('.dpad-btn').forEach((button) => {
      const start = (event) => {
        event.preventDefault();
        button.setPointerCapture?.(event.pointerId);
        button.classList.add('is-pressed');
        startDirectionalHold(Number(button.dataset.dx), Number(button.dataset.dy), 'dpad');
      };
      const stop = () => stopDirectionalHold();
      button.addEventListener('pointerdown', start);
      button.addEventListener('pointerup', stop);
      button.addEventListener('pointercancel', stop);
      button.addEventListener('lostpointercapture', stop);
    });
    elements.canvas.addEventListener('pointerdown', (event) => {
      stopDirectionalHold();
      game.pointerStart = { x: event.clientX, y: event.clientY, direction: null };
      elements.canvas.setPointerCapture?.(event.pointerId);
    });
    elements.canvas.addEventListener('pointermove', (event) => {
      if (!game.pointerStart || game.pointerStart.direction) return;
      const dx = event.clientX - game.pointerStart.x;
      const dy = event.clientY - game.pointerStart.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
      game.pointerStart.direction = Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)];
      startDirectionalHold(...game.pointerStart.direction, 'swipe');
    });
    elements.canvas.addEventListener('pointerup', (event) => {
      if (!game.pointerStart) return;
      const dx = event.clientX - game.pointerStart.x;
      const dy = event.clientY - game.pointerStart.y;
      const direction = game.pointerStart.direction;
      game.pointerStart = null;
      if (!direction && Math.max(Math.abs(dx), Math.abs(dy)) >= 18) {
        startDirectionalHold(Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) : 0, Math.abs(dy) >= Math.abs(dx) ? Math.sign(dy) : 0, 'swipe');
        window.setTimeout(stopDirectionalHold, 30);
      } else {
        stopDirectionalHold();
      }
    });
    elements.canvas.addEventListener('pointercancel', () => { game.pointerStart = null; stopDirectionalHold(); });
    elements.canvas.addEventListener('lostpointercapture', () => { game.pointerStart = null; stopDirectionalHold(); });
    window.addEventListener('keydown', (event) => {
      if (event.target.matches('input, select, textarea')) return;
      const directions = { ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0] };
      if (directions[event.key]) {
        event.preventDefault();
        const [dx, dy] = directions[event.key];
        if (!game.manualHold || game.manualHold.dx !== dx || game.manualHold.dy !== dy) startDirectionalHold(dx, dy, 'keyboard');
      }
      if (event.key === 'Escape' && game.active) togglePause();
      if (event.key === 'Enter' && !game.active) audio.play('click');
    });
    window.addEventListener('keyup', (event) => {
      if (/^(ArrowUp|ArrowDown|ArrowLeft|ArrowRight|w|a|s|d)$/i.test(event.key)) stopDirectionalHold();
    });
    window.addEventListener('blur', stopDirectionalHold);
    window.addEventListener('pointerup', stopDirectionalHold);
    window.addEventListener('resize', resizeCanvas);
    if (window.ResizeObserver) new ResizeObserver(resizeCanvas).observe(elements.canvasViewport);
  }

  function updateTime() {
    if (game.active && !game.paused && !game.completed) updateHud();
    game.levelTimer = window.setTimeout(updateTime, 250);
  }

  bindControls();
  syncSettings();
  updateMenuStats();
  showScreen('menu');
  updateTime();
  if (!getProfile().hasSeenTutorial) openTutorial();
  const initialUnlocked = evaluateAchievements();
  if (initialUnlocked.length > 0) announceAchievements(initialUnlocked);
  let renderFrameAt = now();
  animationFrame = requestAnimationFrame(renderLoop);

  function renderLoop(timestamp) {
    const frameAt = Number(timestamp) || now();
    const deltaSeconds = clamp((frameAt - renderFrameAt) / 1000, 0, 0.08);
    renderFrameAt = frameAt;
    if (game.active && !game.paused && !game.completed) {
      moveContinuousBall(deltaSeconds);
      draw();
    }
    animationFrame = requestAnimationFrame(renderLoop);
  }
}
