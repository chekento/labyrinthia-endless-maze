# Changelog

## v2.2.1 · Sensor bridge fallback · 2026-09-24

### Fixed

- Added a DeviceOrientation fallback for Android/WebView builds where the browser motion event stream is unavailable.
- Sensor samples now report their source and waiting state in the settings UI.
- Screen rotation uses the modern `screen.orientation.angle` API when available.
- Added a distinct version code so the sensor repair installs as an update over v2.2.0.

### Verification

- APK package: `cloud.kosch.labyrinthia`
- Version: `2.2.1` / `versionCode 24`
- SHA-256: `bbf5b3014f19da8ab0c7bd6f9e34f3d5960a7d4dcd2fc814c53b7af1ce08cd13`

## v2.2.0 · Physical roll and fair hazards · 2026-09-23

### Added

- Accelerometer input now normalizes gravity and builds physical roll velocity from tilt magnitude.
- Held swipes, D-pad presses and keyboard holds repeat movement until release or an obstacle.
- Difficulty tiers start without holes, then add protected, solvable fall-hole routes with growing size and clusters.
- Start and key tiles act as savepoints; holes return the player to the latest savepoint and preserve the key state.
- Rolling-ball easing, rotating seam, sphere shading, fall feedback and hazard minimap markers.
- Compact HUD with individual minimize controls for objective, map, controls and expedition actions, plus a focus-mode maximize button.

### Verification

- APK package: `cloud.kosch.labyrinthia`
- Version: `2.2.0` / `versionCode 23`
- SHA-256: `2b80048f092a2d47ff2b363812e5a7b213d2029d4fa593ecdbd50506eb578fca`

## v2.1.1 · Signature icon pass · 2026-09-23

### Added

- New premium Labyrinthia launcher icon: a luminous maze portal with a gold core, cyan route and violet dimensional frame.
- Android density-specific launcher assets for mdpi through xxxhdpi, including round-icon variants.
- Matching PWA, favicon, Apple touch icon and in-game main-menu brand mark.
- Rebuilt debug APK with the new icon as the current installable build.

### Verification

- APK package: `cloud.kosch.labyrinthia`
- Version: `2.1.1` / `versionCode 22`
- SHA-256: `a0c69065bc5839af076815f69a7afe622e05bbf7d8a7f6d79c4a97d270076db6`

## v2.1.0 · Complete UX and graphics pass · 2026-09-23

### Added

- First-run tutorial with a short, readable onboarding path for swipe, D-pad, key and exit.
- Relaxed, Standard and Focused comfort modes with route hints and pressure tuning.
- Offline daily challenge seed with a shareable date/seed token.
- Post-run recap with time, moves, wall bumps, route length, key detour and next target.
- Input safety feedback, last-input status, haptics-ready motion flow and reliable touch locking.
- High contrast, colour-blind-safe, reduced-motion, large-text and left-handed layouts.
- Camera follow strength, minimap zoom and objective-label controls for large mazes.
- Local Web Audio feedback for movement, walls, keys, exits, achievements and rank-ups, plus music/SFX sliders.
- Achievement collection summaries with a “next easiest” target across all 1,000 achievements.
- Local export/import backup code for progression portability.
- Compiled debug APK `Labyrinthia-v2.1.0-debug.apk` with a reproducible Gradle wrapper and GitHub Actions build.
- Further visual polish: generated 16:9 marketing art, key-art menu backdrop, animated player feedback, route hints and color-safe palettes.

### Verification

- APK package: `cloud.kosch.labyrinthia`
- Version: `2.1.0` / `versionCode 21`
- SHA-256: `4df0ac06ddb1ef2138169add1b2af96736e51bb17d8576be692874e3ce2d8d9a`

## Front-page marketing pass · 2026-09-23

### Added

- Versioned APK download banner for v2.1.0 with one stable build-page destination.
- Five generated 16:9 marketing motifs for camera focus, tilt controls, route planning, minimap strategy and level completion.
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
