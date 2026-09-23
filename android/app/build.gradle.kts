plugins {
    id("com.android.application")
}

android {
    namespace = "cloud.kosch.labyrinthia"
    compileSdk = 35

    defaultConfig {
        applicationId = "cloud.kosch.labyrinthia"
        minSdk = 23
        targetSdk = 35
        versionCode = 20
        versionName = "2.0.0"
    }

    buildFeatures { buildConfig = true }

    sourceSets {
        getByName("main") {
            // The web app at the project root is the single source of truth.
            assets.srcDir(rootProject.projectDir.parentFile)
            assets.exclude("android/**")
            assets.exclude("upload/**")
            assets.exclude("*.zip")
        }
    }

    packaging {
        resources.excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
}
