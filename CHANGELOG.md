# Changelog

## Front-page marketing pass · 2026-09-23

### Added

- Versioned APK download banner for v2.0.0 with one stable build-page destination.
- Five feature illustrations for camera readability, motion controls, progression, achievements and offline play.
- Six 16:9 in-game product screenshots with an accessible swipe/keyboard sliderwheel in `docs/sliderwheel.html`.
- Ten concrete GUI/UX upgrade recommendations in the repository front page.

## v2.0.0 · Android-ready foundation · 2026-09-23

### Added

- New gaming-style main menu and mobile-first HUD.
- Player-centred camera viewport with stable cell size for larger mazes.
- Full-maze minimap and off-screen objective indicators.
- Swipe, touch D-pad, keyboard and device motion controls.
- Motion settings for permission, calibration, sensitivity and inversion.
- Offline-ready PWA shell with local relative module paths.
- Android WebView wrapper with native accelerometer bridge.
- Persistent local XP, level progress, ranks and achievements.
- Exactly 1,000 generated achievements across levels, keys, moves, speed and motion categories.
- Four visual themes: Neon Night, Ember Temple, Verdant Run and Ice Circuit.
- Android launcher icon and Play-Store-oriented build configuration.

### UX principles

- Large mazes scroll around the player instead of shrinking the player.
- The current objective, key state, timer and rank remain visible.
- Core play stays local and does not require community features or an account.

### Known pre-alpha limitations

- The final signed AAB and Play Store listing are not included yet.
- Sensor behavior still needs testing across more Android devices and orientations.
- Audio, advanced maze modifiers and deeper difficulty balancing are planned next.
