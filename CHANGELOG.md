# Changelog

## v2.4.3 · Project links and external navigation · 2026-09-24

### Added

- Settings now expose direct links to `kosch.cloud` and the playable web version at `maze.on.websim.com`.
- Android WebView opens external HTTPS links in the device browser without taking the local game out of its asset shell.
- Repository frontpage and APK artwork now point to the freshly built v2.4.3 / versionCode 29 package.

### Verification

- APK package: `cloud.kosch.labyrinthia`
- Version: `2.4.3` / `versionCode 29`
- SHA-256: `fb4d594c22147d1a1e4b95d93aeff7c73987a1cbf33afe85cc7df80a9380597c`

## v2.4.2 · Fair wide-lane hazards and compact onboarding levels · 2026-09-24

### Added

- Roll-Steuerung now sits above the Expedition Map on mobile, tablet and desktop layouts, so both remain reachable while the maze is visible.
- Level 1–10 now use compact 9×9 through 27×27 boards; the early route is tuned for readable play and time achievements.
- Fall holes are placed only inside carved 2×3 or 3×2 wide-lane pockets with an explicit safe parallel bypass. The objective route remains protected.
- Dave now reads as a pizza at a glance with crust, sauce, cheese, cut lines, pepperoni and basil; the other nine themes receive a stronger 3D sphere treatment.

### Verification

- APK package: `cloud.kosch.labyrinthia`
- Version: `2.4.2` / `versionCode 28`
- SHA-256: `123215e88c18b51a1650dd3e8b63b81923eb6e5b4a205656fbed8250a66ee7bd`

## v2.4.1 · Welcome art and main-menu visual pass · 2026-09-24

### Added

- New cinematic welcome/tutorial artwork now sits behind the first-run popup without competing with the tutorial copy.
- New main-menu hero artwork gives the landing screen a stronger Labyrinthia identity while preserving readable title and action space.
- Both images are compressed, cached offline and bundled into the Android APK.
- Added a linked versions archive so the current and older debug APKs remain downloadable from the repository.

### Verification

- APK package: `cloud.kosch.labyrinthia`
- Version: `2.4.1` / `versionCode 27`
- SHA-256: `9c2003ffbd51f80f7f4aa167ce18d5ef9159e49605f55e4b7df9f75f7bed43d6`

## v2.4.0 · Rolling physics, ball profiles and graphics overhaul · 2026-09-24

### Added

- Motion Control now simulates continuous ball-board movement: calibrated gravity deltas become tangential acceleration, velocity carries between sensor samples, friction slows the ball naturally and walls absorb momentum.
- The canvas received a new visual pass with layered maze surfaces, depth-lit walls, animated hazard wells, motion trails, ball shading, squash, rotating seams and profile-specific patterns.
- Settings now include ten named ball profiles: Nova, Luma, Cinder, Moss, Glacia, Nyx, Aurelia, Sol, Echo and Dave, the pizza ball.
- Dave renders as a readable pizza sphere with crust, melted cheese and pepperoni while preserving the rolling face and highlight.

### Verification

- APK package: `cloud.kosch.labyrinthia`
- Version: `2.4.0` / `versionCode 26`
- SHA-256: `7f68c2b6000e96c24ccda7703025b86d7a42fb2b57c7db5b2d0f27da6fea6b57`

## v2.3.0 · Mobile polish, spatial audio and varied achievements · 2026-09-24

### Added

- Mobile game content now flows vertically with a safe bottom inset, so the maze no longer overlays the minimap, controls or expedition actions.
- D-pad buttons gained clearer depth, focus, pressed states and a hold-to-roll hint.
- Five procedural loopable ambient scenes keep the APK small while adding slow movement, echo and reverb to music and FX.
- The tutorial now covers every current mechanic, including physical tilt speed, savepoints, fair fall holes, panel controls and negative achievements.
- The 1,000-achievement catalog now has varied wording plus a Risks collection for fall-hole and wall-contact badges.

### Fixed

- Hazard placement now checks local byways and clears the complete hazard set if the protected start-to-key-to-exit routes ever become unsolvable.
- Fall-hole and wall-contact achievements unlock at the event that caused them.

### Verification

- APK package: `cloud.kosch.labyrinthia`
- Version: `2.3.0` / `versionCode 25`
- SHA-256: `67d9e5e226e24bcf1e55e2c6ccaf3ae33f57bee3f98bb51e815331cff3d114b1`

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
