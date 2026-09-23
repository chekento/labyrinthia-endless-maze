<div align="center">

# ✦ Labyrinthia
## The Endless Maze

**Find the key. Read the maze. Escape the impossible.**

[![Status: Pre-Alpha](https://img.shields.io/badge/status-pre--alpha-ff6b8a?style=for-the-badge)](#-development-status)
[![Android Ready](https://img.shields.io/badge/android-ready-36e0c5?style=for-the-badge&logo=android&logoColor=071018)](#-android-build)
[![Progression](https://img.shields.io/badge/progression-1000%20ranks%20%2B%201000%20achievements-7c6cff?style=for-the-badge)](#-long-term-motivation)

<img src="./Gemini_Generated_Image_5kaosm5kaosm5kao.png" alt="Labyrinthia key art" width="760" />

### An endless procedural maze adventure by KoSch

</div>

> **Development status — important:** Labyrinthia is an experimental **Pre-Alpha**. It is playable and Android-ready, but it is not yet a finished Play Store release. Expect balancing changes, new visual polish and further device testing.

## Download and play

- **[Download the Android-ready package](./Labyrinthia-The-Endless-Maze-Android-ready-v2.0.0.zip)** — web app, offline PWA shell and Android WebView project in one archive.
- **Browser preview:** serve the repository over HTTP(S), then open `index.html`.
- **Android Studio:** open the `android/` project and build the debug APK or a signed AAB.

## Why the game should stay fun for a long time

Labyrinthia is built around a simple loop that remains readable even as the challenge grows:

1. Enter a fresh, procedurally generated maze.
2. Keep the player large and legible while the camera follows through the maze.
3. Locate the key using spatial memory, the focused view and the complete minimap.
4. Reach the exit and choose whether to push into the next level.
5. Earn XP, rise through 1,000 ranks and unlock one of 1,000 persistent achievements.

The maze can extend far beyond the screen. Higher difficulty changes the scale of the world, not the readability of the player character.

## Core experience

| Area | Current design | Why it matters |
| --- | --- | --- |
| Camera | Fixed-size cells with a player-centred viewport | Large mazes remain playable on small Android screens |
| Orientation | Full-maze minimap plus off-screen key/exit indicators | Players can plan without losing their sense of place |
| Input | Swipe, touch D-pad, keyboard and device motion | Comfortable on phone, tablet and desktop |
| Motion | Calibrate, sensitivity and inversion controls | Tilt movement feels like guiding a ball on a board |
| World | Endless level numbers with seeded procedural generation | No artificial final level |
| Progression | Local XP, 1,000 ranks and exactly 1,000 achievements | Long-term goals without an account or server |
| Offline | Relative modules, local storage and PWA caching | The core game can remain available without a network |

## Controls

| Platform | Controls |
| --- | --- |
| Touch | Swipe directly on the maze or use the D-pad |
| Keyboard | Arrow keys or `W A S D`; `Esc` pauses |
| Android sensors | Settings → enable motion controls → hold the device flat to calibrate → tilt |

The sensor mode can be switched off at any time. Haptic feedback is optional and can also be disabled in settings.

## Long-term motivation

Progress is stored locally on the device:

- **1,000 ranks:** XP-based titles from *Newcomer* to *Eternal Labyrinthian*.
- **1,000 achievements:** level gates, key collection, movement milestones, speed goals and motion-control mastery.
- **Endless levels:** level numbers are not capped; the generated maze grows up to a mobile-safe board size and then continues to become more demanding through route density and pace.
- **No forced community layer:** the game loop stays focused on the individual expedition, mastery and discovery.

## Visual and UX direction

The interface uses a focused sci-fi game language: high-contrast objectives, glowing path walls, large readable markers, a compact HUD and mobile-safe touch targets. Themes currently include Neon Night, Ember Temple, Verdant Run and Ice Circuit.

The design rules are deliberately strict:

- never make the player unreadably tiny;
- never hide the current objective;
- keep pause, settings and progress one tap away;
- reward mastery without interrupting the maze flow;
- keep the core game local and privacy-friendly.

## Android build

The `android/` folder contains a native WebView wrapper. It:

- loads the local game through `WebViewAssetLoader`;
- enables fullscreen, hardware acceleration and safe-area friendly rendering;
- exposes the Android accelerometer to the web game through a small native bridge;
- keeps the web files at the repository root as the single source of truth.

Open `android/` in Android Studio with an Android SDK installed, then build `assembleDebug` for testing or a signed release AAB for Play Console. Keep signing keys and upload credentials outside this public repository.

## Development status

The current foundation is **v2.0.0 Android-ready / Pre-Alpha**. The next quality passes should focus on:

- device-by-device sensor tuning and accessibility testing;
- sound, music and stronger moment-to-moment feedback;
- additional maze modifiers and fair challenge variants;
- device performance profiling on very large levels;
- signed AAB preparation and Play Store listing assets.

See [`CHANGELOG.md`](./CHANGELOG.md) for the current release notes.

## Privacy

The core game does not require an account, location, contacts or background permissions. Progression is stored locally with browser/WebView storage. The Android wrapper only uses the accelerometer when the player explicitly enables motion controls.

<div align="center">

**Labyrinthia is made to be explored, mastered and revisited.** ❣️

</div>
