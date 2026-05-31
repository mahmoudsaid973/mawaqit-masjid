// PR-102 — Application entrypoint (Hilt + Coroutines).
package com.forge.mawaqitmasjid

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class MawaqitMasjidApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // App-wide initialization goes here (logging, crash reporting,
        // analytics SDKs). Per-feature DI is handled by the @Module classes
        // in the di/ package.
    }
}
