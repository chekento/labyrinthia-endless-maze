export const CONFIG = {
  appVersion: '2.1.1',
  maxRank: 1000,
  achievementCount: 1000,
  cellSize: 36,
  minCellSize: 28,
  maxCellSize: 44,
  moveDelay: 115,
  motionMoveDelay: 145,
  aiMoveDelay: 180,
  persistenceKey: 'labyrinthia-profile-v3',
  comfortModes: {
    relaxed: {
      label: 'Relaxed',
      description: 'Mehr Orientierung, großzügige Eingaben, kein Zeitdruck.',
      moveDelay: 82,
      showRouteHint: true,
      showIndicatorLabels: true
    },
    standard: {
      label: 'Standard',
      description: 'Die ausgewogene Labyrinthia-Erfahrung.',
      moveDelay: 115,
      showRouteHint: false,
      showIndicatorLabels: true
    },
    focused: {
      label: 'Focused',
      description: 'Weniger Hilfen, schärferes Timing, maximale Konzentration.',
      moveDelay: 135,
      showRouteHint: false,
      showIndicatorLabels: false
    }
  },
  theme: {
    background: '#070918',
    panel: '#11152c',
    panelRaised: '#171d3b',
    ink: '#f3f6ff',
    muted: '#9da8c9',
    primary: '#7c6cff',
    primaryBright: '#a696ff',
    accent: '#36e0c5',
    gold: '#ffc857',
    danger: '#ff6b8a'
  },
  physics: {
    friction: 0.84,
    maxVelocity: 2.8,
    acceleration: 1.25,
    movementThreshold: 0.18,
    tiltSensitivity: 2.2,
    deadzone: 0.16
  }
};
