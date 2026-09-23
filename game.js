import { CONFIG } from './config.js';
import {
  canMove,
  chooseKey,
  createSeed,
  generateMaze,
  initMaze
} from './maze-utils.js';
import { initMotionControls } from './motion-controls.js';
import {
  evaluateAchievements,
  getAchievementProgress,
  getAchievements,
  getAchievementStats,
  getProfile,
  getRank,
  getUnlockedAchievements,
  hapticPulse,
  recordKey,
  recordLevelComplete,
  recordMove,
  resetAllProgress,
  resetRun,
  saveProfile,
  setHaptics,
  setMotionPreferences,
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
    exit: '#36e0c5'
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
    exit: '#62e6c4'
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
    exit: '#b5f36d'
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
    exit: '#8ff2e1'
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
    timer: document.getElementById('levelTimer'),
    hudRank: document.getElementById('hudRank'),
    hudXp: document.getElementById('hudXp'),
    hudXpFill: document.getElementById('hudXpFill'),
    menuRank: document.getElementById('menuRank'),
    menuRankTitle: document.getElementById('menuRankTitle'),
    menuLevel: document.getElementById('menuLevel'),
    menuAchievements: document.getElementById('menuAchievements'),
    continueBtn: document.getElementById('continueBtn'),
    newRunBtn: document.getElementById('newRunBtn'),
    levelInput: document.getElementById('levelInput'),
    levelStartBtn: document.getElementById('levelStartBtn'),
    levelModal: document.getElementById('levelModal'),
    settingsModal: document.getElementById('settingsModal'),
    achievementsModal: document.getElementById('achievementsModal'),
    pauseModal: document.getElementById('pauseModal'),
    completionModal: document.getElementById('completionModal'),
    toastStack: document.getElementById('toastStack'),
    achievementsGrid: document.getElementById('achievementsGrid'),
    achievementProgress: document.getElementById('achievementProgress'),
    motionToggle: document.getElementById('motionToggle'),
    motionSensitivity: document.getElementById('motionSensitivity'),
    motionSensitivityValue: document.getElementById('motionSensitivityValue'),
    invertMotion: document.getElementById('invertMotion'),
    hapticsToggle: document.getElementById('hapticsToggle'),
    themeSelect: document.getElementById('themeSelect'),
    completionTitle: document.getElementById('completionTitle'),
    completionSummary: document.getElementById('completionSummary'),
    completionXp: document.getElementById('completionXp'),
    completionNextBtn: document.getElementById('completionNextBtn')
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
    hasKey: false,
    motionUsed: false,
    levelStart: 0,
    cellSize: CONFIG.cellSize,
    viewport: { width: 0, height: 0 },
    dpr: 1,
    pointerStart: null,
    lastMove: 0,
    levelTimer: null,
    achievementFilter: 'all'
  };

  let animationFrame = null;
  const motionControls = initMotionControls((dx, dy) => {
    if (!game.active || game.paused) return;
    game.motionUsed = true;
    movePlayer(dx, dy, 'motion');
  });

  function palette() {
    return palettes[getProfile().theme] || palettes.neon;
  }

  function showScreen(screen) {
    elements.mainMenu.classList.toggle('is-active', screen === 'menu');
    elements.gameScreen.classList.toggle('is-active', screen === 'game');
    if (screen === 'menu') {
      updateMenuStats();
      closeModal(elements.pauseModal);
      closeModal(elements.completionModal);
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
    [elements.levelModal, elements.settingsModal, elements.achievementsModal, elements.pauseModal, elements.completionModal]
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
      setTimeout(() => announce(`🏆 ${achievement.title} · Achievement ${achievement.number}/1000`, 'achievement'), index * 360);
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
    elements.motionStatus.textContent = motionControls.isEnabled() ? 'Sensorsteuerung aktiv' : 'Touch / Pfeile';
    elements.motionStatus.classList.toggle('is-active', motionControls.isEnabled());
  }

  function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function startNewRun() {
    resetRun();
    startLevel(1);
  }

  function continueRun() {
    startLevel(getProfile().currentLevel || 1);
  }

  function startLevel(level) {
    const nextLevel = Math.max(1, Math.floor(Number(level) || 1));
    closeAllModals();
    game.level = nextLevel;
    game.seed = createSeed(nextLevel, Date.now() + Math.floor(Math.random() * 100000));
    game.hasKey = false;
    game.completed = false;
    game.paused = false;
    game.motionUsed = motionControls.isEnabled();
    game.levelStart = now();
    updateProfile({ currentLevel: nextLevel });
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
    updateHud();
    announce(`Level ${nextLevel.toLocaleString()} generiert · ${game.cols} × ${game.rows} Zellen`, 'info');
    draw();
  }

  function completeLevel() {
    game.completed = true;
    const durationMs = now() - game.levelStart;
    const newAchievements = recordLevelComplete({ level: game.level, durationMs, usedMotion: game.motionUsed });
    const profile = getProfile();
    const xpGain = 100 + Math.min(500, game.level * 5);
    elements.completionTitle.textContent = `Level ${game.level.toLocaleString()} gemeistert`;
    elements.completionSummary.textContent = `${formatTime(durationMs)} · ${profile.levelsCompleted.toLocaleString()} abgeschlossene Level · ${game.motionUsed ? 'mit Sensorsteuerung' : 'klassisch gespielt'}`;
    elements.completionXp.textContent = `+${xpGain} XP`;
    elements.completionNextBtn.textContent = `Weiter zu Level ${(game.level + 1).toLocaleString()}`;
    updateHud();
    openModal(elements.completionModal);
    hapticPulse([18, 40, 28]);
    announceAchievements(newAchievements);
  }

  function movePlayer(dx, dy, source = 'input') {
    if (!game.active || game.paused || game.completed) return;
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
    const directionX = clamp(Math.round(dx), -1, 1);
    const directionY = clamp(Math.round(dy), -1, 1);
    if ((directionX === 0 && directionY === 0) || (directionX !== 0 && directionY !== 0)) return;
    const timestamp = Date.now();
    const delay = source === 'motion' ? CONFIG.motionMoveDelay : CONFIG.moveDelay;
    if (timestamp - game.lastMove < delay) return;
    game.lastMove = timestamp;
    if (!canMove(game.maze, game.player, directionX, directionY)) {
      if (source !== 'motion') hapticPulse(5);
      return;
    }

    game.player = { x: game.player.x + directionX, y: game.player.y + directionY };
    recordMove();
    hapticPulse(4);

    if (!game.hasKey && game.player.x === game.key.x && game.player.y === game.key.y) {
      game.hasKey = true;
      const newAchievements = recordKey();
      announce('Schlüssel gesichert · Ausgang aktiviert', 'success');
      announceAchievements(newAchievements);
    }

    if (game.player.x === game.exit.x && game.player.y === game.exit.y) {
      if (game.hasKey) {
        completeLevel();
      } else {
        announce('Der Ausgang ist versiegelt. Finde zuerst den Schlüssel.', 'warning');
      }
    }
    updateHud();
    draw();
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
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);
    if (!game.maze.length) return;

    const worldWidth = game.cols * game.cellSize;
    const worldHeight = game.rows * game.cellSize;
    const playerCenterX = (game.player.x + 0.5) * game.cellSize;
    const playerCenterY = (game.player.y + 0.5) * game.cellSize;
    const viewX = worldWidth <= width ? (worldWidth - width) / 2 : playerCenterX - width / 2;
    const viewY = worldHeight <= height ? (worldHeight - height) / 2 : playerCenterY - height / 2;
    const startX = Math.max(0, Math.floor(viewX / game.cellSize) - 1);
    const endX = Math.min(game.cols - 1, Math.ceil((viewX + width) / game.cellSize) + 1);
    const startY = Math.max(0, Math.floor(viewY / game.cellSize) - 1);
    const endY = Math.min(game.rows - 1, Math.ceil((viewY + height) / game.cellSize) + 1);

    ctx.save();
    ctx.translate(-viewX, -viewY);
    for (let y = startY; y <= endY; y += 1) {
      for (let x = startX; x <= endX; x += 1) {
        const cell = game.maze[y][x];
        ctx.fillStyle = (x + y) % 2 === 0 ? colors.floor : colors.floorAlt;
        ctx.fillRect(x * game.cellSize, y * game.cellSize, game.cellSize, game.cellSize);
        ctx.strokeStyle = colors.wall;
        ctx.lineWidth = Math.max(1.3, game.cellSize * 0.055);
        ctx.shadowBlur = game.cellSize > 30 ? 4 : 2;
        ctx.shadowColor = colors.wallGlow;
        ctx.beginPath();
        if (cell.walls[0]) { ctx.moveTo(x * game.cellSize, y * game.cellSize); ctx.lineTo((x + 1) * game.cellSize, y * game.cellSize); }
        if (cell.walls[1]) { ctx.moveTo((x + 1) * game.cellSize, y * game.cellSize); ctx.lineTo((x + 1) * game.cellSize, (y + 1) * game.cellSize); }
        if (cell.walls[2]) { ctx.moveTo(x * game.cellSize, (y + 1) * game.cellSize); ctx.lineTo((x + 1) * game.cellSize, (y + 1) * game.cellSize); }
        if (cell.walls[3]) { ctx.moveTo(x * game.cellSize, y * game.cellSize); ctx.lineTo(x * game.cellSize, (y + 1) * game.cellSize); }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    drawMarker(game.key, colors.key, '⌁', !game.hasKey);
    drawMarker(game.exit, colors.exit, '↗', game.hasKey);
    drawPlayer(colors);
    ctx.restore();

    drawOffscreenIndicator(game.key, colors.key, 'KEY', viewX, viewY);
    drawOffscreenIndicator(game.exit, colors.exit, 'EXIT', viewX, viewY);
    drawMiniMap(colors);
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

  function drawPlayer(colors) {
    const x = (game.player.x + 0.5) * game.cellSize;
    const y = (game.player.y + 0.5) * game.cellSize;
    const radius = game.cellSize * 0.34;
    ctx.save();
    ctx.fillStyle = colors.player;
    ctx.shadowColor = colors.player;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.playerBright;
    ctx.beginPath();
    ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1231';
    ctx.beginPath();
    ctx.arc(x - radius * 0.2, y - radius * 0.03, radius * 0.08, 0, Math.PI * 2);
    ctx.arc(x + radius * 0.2, y - radius * 0.03, radius * 0.08, 0, Math.PI * 2);
    ctx.fill();
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
    ctx.fillText(label, 0, 22);
    ctx.restore();
  }

  function drawMiniMap(colors) {
    const rect = elements.miniMap.getBoundingClientRect();
    const width = rect.width || 128;
    const height = rect.height || 128;
    miniCtx.clearRect(0, 0, width, height);
    miniCtx.fillStyle = '#080c1e';
    miniCtx.fillRect(0, 0, width, height);
    if (!game.maze.length) return;
    const scale = Math.min((width - 12) / game.cols, (height - 12) / game.rows);
    const offsetX = (width - game.cols * scale) / 2;
    const offsetY = (height - game.rows * scale) / 2;
    miniCtx.strokeStyle = 'rgba(140, 130, 255, .6)';
    miniCtx.lineWidth = Math.max(0.5, scale * 0.14);
    miniCtx.beginPath();
    for (let y = 0; y < game.rows; y += 1) {
      for (let x = 0; x < game.cols; x += 1) {
        const cell = game.maze[y][x];
        const px = offsetX + x * scale;
        const py = offsetY + y * scale;
        if (cell.walls[0]) { miniCtx.moveTo(px, py); miniCtx.lineTo(px + scale, py); }
        if (cell.walls[1]) { miniCtx.moveTo(px + scale, py); miniCtx.lineTo(px + scale, py + scale); }
        if (cell.walls[2]) { miniCtx.moveTo(px, py + scale); miniCtx.lineTo(px + scale, py + scale); }
        if (cell.walls[3]) { miniCtx.moveTo(px, py); miniCtx.lineTo(px, py + scale); }
      }
    }
    miniCtx.stroke();
    drawMiniDot(game.exit, colors.exit, scale, offsetX, offsetY);
    if (!game.hasKey) drawMiniDot(game.key, colors.key, scale, offsetX, offsetY);
    drawMiniDot(game.player, colors.player, scale, offsetX, offsetY);
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
    const filtered = elements.achievementsModal.querySelector('[data-achievement-filter].is-selected')?.dataset.achievementFilter || 'all';
    game.achievementFilter = filtered;
    const visible = achievements.filter((achievement) => filtered === 'all' || achievement.category === filtered);
    elements.achievementProgress.textContent = `${unlocked.size} / ${achievements.length} freigeschaltet`;
    elements.achievementsGrid.innerHTML = visible.map((achievement) => {
      const isUnlocked = unlocked.has(achievement.id);
      const progress = Math.min(100, Math.round((getAchievementProgress(achievement, profile) / achievement.threshold) * 100));
      return `<article class="achievement-card ${isUnlocked ? 'is-unlocked' : ''}">
        <div class="achievement-number">${String(achievement.number).padStart(4, '0')}</div>
        <div class="achievement-icon">${isUnlocked ? '✦' : '◇'}</div>
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
    motionControls.setSensitivity(profile.motionSensitivity);
    motionControls.setInvert(profile.invertMotion);
  }

  function bindControls() {
    elements.continueBtn.addEventListener('click', continueRun);
    elements.newRunBtn.addEventListener('click', startNewRun);
    document.getElementById('openLevelBtn').addEventListener('click', () => {
      elements.levelInput.value = getProfile().currentLevel;
      openModal(elements.levelModal);
    });
    elements.levelStartBtn.addEventListener('click', () => startLevel(elements.levelInput.value));
    document.getElementById('menuAchievementsBtn').addEventListener('click', () => { renderAchievements(); openModal(elements.achievementsModal); });
    document.getElementById('menuSettingsBtn').addEventListener('click', () => { syncSettings(); openModal(elements.settingsModal); });
    document.getElementById('gameSettingsBtn').addEventListener('click', () => { syncSettings(); openModal(elements.settingsModal); });
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
    document.getElementById('calibrateMotionBtn').addEventListener('click', () => { motionControls.calibrate(); announce('Sensoren kalibriert. Halte das Gerät jetzt waagerecht.', 'success'); });
    document.getElementById('resetProgressBtn').addEventListener('click', () => {
      if (!window.confirm('Wirklich alle Level-, Rang- und Achievement-Fortschritte löschen?')) return;
      resetAllProgress();
      motionControls.disable();
      syncSettings();
      updateMenuStats();
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
    elements.achievementsModal.querySelectorAll('[data-achievement-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        elements.achievementsModal.querySelectorAll('[data-achievement-filter]').forEach((item) => item.classList.remove('is-selected'));
        button.classList.add('is-selected');
        renderAchievements();
      });
    });
    document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', () => closeModal(button.closest('.modal'))));
    document.querySelectorAll('.dpad-btn').forEach((button) => {
      button.addEventListener('pointerdown', (event) => { event.preventDefault(); movePlayer(Number(button.dataset.dx), Number(button.dataset.dy)); });
    });
    elements.canvas.addEventListener('pointerdown', (event) => {
      game.pointerStart = { x: event.clientX, y: event.clientY };
      elements.canvas.setPointerCapture?.(event.pointerId);
    });
    elements.canvas.addEventListener('pointerup', (event) => {
      if (!game.pointerStart) return;
      const dx = event.clientX - game.pointerStart.x;
      const dy = event.clientY - game.pointerStart.y;
      game.pointerStart = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
      if (Math.abs(dx) > Math.abs(dy)) movePlayer(Math.sign(dx), 0);
      else movePlayer(0, Math.sign(dy));
    });
    window.addEventListener('keydown', (event) => {
      if (event.target.matches('input, select, textarea')) return;
      const directions = { ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0] };
      if (directions[event.key]) {
        event.preventDefault();
        movePlayer(...directions[event.key]);
      }
      if (event.key === 'Escape' && game.active) togglePause();
    });
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
  const initialUnlocked = evaluateAchievements();
  if (initialUnlocked.length > 0) announceAchievements(initialUnlocked);
  animationFrame = requestAnimationFrame(renderLoop);

  function renderLoop() {
    if (game.active && !game.paused) draw();
    animationFrame = requestAnimationFrame(renderLoop);
  }
}
