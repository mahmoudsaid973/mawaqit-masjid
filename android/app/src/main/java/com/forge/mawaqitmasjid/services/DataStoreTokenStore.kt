// PR-29 — Preferences DataStore token persistence.
package com.forge.mawaqitmasjid.services

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.forge.mawaqitmasjid.models.AuthToken
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.authDataStore by preferencesDataStore(name = "auth")

@Singleton
class DataStoreTokenStore @Inject constructor(private val context: Context) {
    private val accessKey = stringPreferencesKey("access_token")
    private val refreshKey = stringPreferencesKey("refresh_token")
    private val expiresKey = longPreferencesKey("expires_at_epoch_seconds")

    val tokenFlow: Flow<AuthToken?> = context.authDataStore.data.map { prefs ->
        val access = prefs[accessKey] ?: return@map null
        val expires = prefs[expiresKey] ?: return@map null
        AuthToken(access, prefs[refreshKey], expires)
    }

    suspend fun read(): AuthToken? = tokenFlow.first()

    suspend fun write(token: AuthToken) {
        context.authDataStore.edit { prefs ->
            prefs[accessKey] = token.accessToken
            token.refreshToken?.let { prefs[refreshKey] = it } ?: prefs.remove(refreshKey)
            prefs[expiresKey] = token.expiresAtEpochSeconds
        }
    }

    suspend fun clear() {
        context.authDataStore.edit { it.clear() }
    }
}
