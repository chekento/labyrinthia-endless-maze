export const CONFIG = {
  appVersion: '2.2.1',
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
    // Values are normalized from the accelerometer's m/s² stream. A stronger
    // tilt therefore adds more velocity instead of merely changing direction.
    friction: 0.91,
    maxVelocity: 3.4,
    acceleration: 7.5,
    movementThreshold: 0.055,
    tiltSensitivity: 2.2,
    deadzone: 0.075
  }
};
