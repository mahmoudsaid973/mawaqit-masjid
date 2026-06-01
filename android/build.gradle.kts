// PR-30 — root build.gradle.kts
plugins {
    alias(libs.plugins.androidApplication) apply false
    alias(libs.plugins.kotlinAndroid) apply false
    alias(libs.plugins.kotlinSerialization) apply false
    alias(libs.plugins.kotlinKsp) apply false
    alias(libs.plugins.hilt) apply false
    alias(libs.plugins.composeCompiler) apply false
}
