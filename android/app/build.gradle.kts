plugins {
    id("com.android.application")
}

val webAssetsDir = layout.buildDirectory.dir("generated/webAssets")

val syncWebAssets = tasks.register<Sync>("syncWebAssets") {
    from(rootProject.projectDir.parentFile) {
        include("index.html")
        include("*.js")
        include("*.css")
        include("*.json")
        include("*.webmanifest")
        include("*.svg")
        include("*.png")
        include("*.jpg")
        include("assets/**")
        include("docs/**")
        exclude("android/**")
        exclude(".gradle-user/**")
        exclude(".gradle-tmp/**")
    }
    into(webAssetsDir)
}

android {
    namespace = "cloud.kosch.labyrinthia"
    compileSdk = 35

    defaultConfig {
        applicationId = "cloud.kosch.labyrinthia"
        minSdk = 23
        targetSdk = 35
        versionCode = 23
        versionName = "2.2.0"
    }

    buildFeatures { buildConfig = true }

    sourceSets {
        getByName("main") {
            // The web app at the project root is the single source of truth.
            assets.srcDir(webAssetsDir)
        }
    }

    packaging {
        resources.excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }
}

tasks.named("preBuild") {
    dependsOn(syncWebAssets)
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
}
