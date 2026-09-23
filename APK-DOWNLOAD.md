# Labyrinthia APK · v2.0.0

The front-page banner always points here so the APK call-to-action has one stable, version-aware destination.

## Current channel

**v2.0.0 · Android-ready · Pre-Alpha**

The repository currently contains the Android Studio project and the complete offline web game. A compiled APK has not been published yet because the signed Android build still needs to be produced and device-tested.

When the first APK is released, it will be attached to the [latest GitHub release](https://github.com/chekento/labyrinthia-endless-maze/releases/latest). The banner and this page will remain the stable entry point, so the front page does not need a new URL for every build.

## Build the current APK locally

1. Open [`android/`](./android/) in Android Studio.
2. Install an Android SDK and let Android Studio sync the Gradle project.
3. Run `assembleDebug` for a test APK or create a signed release build for distribution.
4. Keep signing keys and upload credentials outside this public repository.

For browser testing, serve the repository over HTTP(S) and open [`index.html`](./index.html). The core game is offline-first and stores progression locally.

[← Back to the visual front page](./README.md)
