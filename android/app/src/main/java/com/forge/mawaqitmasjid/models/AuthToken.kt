// PR-29 — persisted auth token.
package com.forge.mawaqitmasjid.models

import kotlinx.serialization.Serializable

@Serializable
data class AuthToken(
    val accessToken: String,
    val refreshToken: String? = null,
    val expiresAtEpochSeconds: Long,
) {
    val isExpired: Boolean
        get() = System.currentTimeMillis() / 1000 >= expiresAtEpochSeconds
}
