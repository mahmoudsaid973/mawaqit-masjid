// PR-29 — environment config driven by BuildConfig.
// API_BASE_URL is wired in build.gradle.kts under defaultConfig/buildTypes.
package com.forge.mawaqitmasjid.config

object AppConfig {
    const val DEFAULT_API_BASE_URL = "https://api.example.com"
    val apiBaseUrl: String
        get() = BuildConfig.API_BASE_URL.ifBlank { DEFAULT_API_BASE_URL }
}
