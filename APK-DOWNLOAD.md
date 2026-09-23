# Labyrinthia APK · v2.2.0

The front-page banner always points here so the APK call-to-action has one stable, version-aware destination.

## Current channel

**v2.2.0 · Android-ready · Pre-Alpha**

The repository contains the Android Studio project, the complete offline web game and a compiled debug APK for device testing.

## Current download

[Download Labyrinthia v2.2.0 debug APK](./downloads/Labyrinthia-v2.2.0-debug.apk)

- Package: `cloud.kosch.labyrinthia`
- Version: `2.2.0` (`versionCode 23`)
- Minimum Android version: Android 6.0 / API 23
- SHA-256: `2b80048f092a2d47ff2b363812e5a7b213d2029d4fa593ecdbd50506eb578fca`

This APK is debug-signed for installation and UX testing. It is not the final Play Store-signed AAB. The banner and this page remain the stable entry point; future builds can replace the direct download without changing the front-page URL.

## Build the current APK locally

1. Open [`android/`](./android/) in Android Studio.
2. Install an Android SDK and let Android Studio sync the Gradle project.
3. Run `./gradlew assembleDebug` for a test APK or create a signed release build for distribution.
4. Keep signing keys and upload credentials outside this public repository.

For browser testing, serve the repository over HTTP(S) and open [`index.html`](./index.html). The core game is offline-first and stores progression locally.

[← Back to the visual front page](./README.md)
