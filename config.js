export const CONFIG = {
  appVersion: '2.4.3',
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
    // The accelerometer delta is converted back to m/s². A stronger tilt
    // therefore produces proportionally stronger tangential acceleration,
    // rather than selecting a faster discrete grid step.
    friction: 0.988,
    maxVelocity: 4.8,
    acceleration: 9.81,
    movementThreshold: 0.035,
    tiltSensitivity: 1.0,
    deadzone: 0.06,
    ballRadius: 0.265
  }
};

export const BALL_THEMES = {
  nova: {
    name: 'Nova',
    description: 'Rosé Neon mit einer hellen Orbit-Naht.',
    base: '#ff5f91',
    highlight: '#ffd2df',
    shadow: '#7d204a',
    accent: '#36e0c5',
    pattern: 'orbit'
  },
  luma: {
    name: 'Luma',
    description: 'Aqua-Lichtkugel mit weichen Datenringen.',
    base: '#37d9d0',
    highlight: '#d9fffb',
    shadow: '#14747e',
    accent: '#a696ff',
    pattern: 'rings'
  },
  cinder: {
    name: 'Cinder',
    description: 'Glühender Kern mit warmer Ember-Oberfläche.',
    base: '#ef633e',
    highlight: '#ffe0a8',
    shadow: '#6e1d22',
    accent: '#ffc857',
    pattern: 'ember'
  },
  moss: {
    name: 'Moss',
    description: 'Organische Waldkugel mit Blattlinien.',
    base: '#63c77a',
    highlight: '#e3ffc2',
    shadow: '#1b603e',
    accent: '#b5f36d',
    pattern: 'leaf'
  },
  glacia: {
    name: 'Glacia',
    description: 'Klares Eis mit kristallinen Brechungen.',
    base: '#72cfff',
    highlight: '#f0fdff',
    shadow: '#245b9a',
    accent: '#d3f4ff',
    pattern: 'crystal'
  },
  nyx: {
    name: 'Nyx',
    description: 'Dunkle Void-Kugel mit violettem Sternenstaub.',
    base: '#895dff',
    highlight: '#e4d8ff',
    shadow: '#2b185e',
    accent: '#ff7bd5',
    pattern: 'stars'
  },
  aurelia: {
    name: 'Aurelia',
    description: 'Goldene Reliktkugel mit gravierten Ringen.',
    base: '#e7a82f',
    highlight: '#fff4b0',
    shadow: '#784115',
    accent: '#fff0a0',
    pattern: 'relic'
  },
  sol: {
    name: 'Sol',
    description: 'Sonnenkern mit fließenden Plasma-Flammen.',
    base: '#ff9e32',
    highlight: '#fff6cf',
    shadow: '#a52b22',
    accent: '#ffe36e',
    pattern: 'flare'
  },
  echo: {
    name: 'Echo',
    description: 'Chrom-Puls mit kühlen technischen Segmenten.',
    base: '#a9b7d8',
    highlight: '#ffffff',
    shadow: '#3c4a72',
    accent: '#6de4ff',
    pattern: 'circuit'
  },
  dave: {
    name: 'Dave',
    description: 'Die rollende Pizzakugel: Käse, Kruste und Pepperoni.',
    base: '#f2b447',
    highlight: '#fff3a7',
    shadow: '#873b24',
    accent: '#d9403e',
    pattern: 'pizza'
  }
};
