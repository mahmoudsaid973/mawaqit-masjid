// PR-29 — AuthService using Credential Manager API for Google Sign-In.
// Exchanges Google ID token for backend JWT, persists via DataStoreTokenStore.
package com.forge.mawaqitmasjid.services

import android.content.Context
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.CustomCredential
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.forge.mawaqitmasjid.models.AuthToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthService @Inject constructor(
    private val tokenStore: DataStoreTokenStore,
    // Backend auth client; feature code injects the same interface.
    // Wire implementation in Hilt NetworkModule.
) {
    private val _state = MutableStateFlow<AuthState>(AuthState.Unknown)
    val state: StateFlow<AuthState> = _state.asStateFlow()

    suspend fun checkSession() {
        val token = tokenStore.read()
        _state.value = if (token != null && !token.isExpired) AuthState.Authenticated(token) else AuthState.Unauthenticated
    }

    suspend fun signInWithGoogle(context: Context, webClientId: String) {
        val credentialManager = CredentialManager.create(context)
        val option = GetGoogleIdOption.Builder()
            .setFilterByAuthorizedAccounts(false)
            .setServerClientId(webClientId)
            .build()
        val request = GetCredentialRequest.Builder().addCredentialOption(option).build()
        val response = credentialManager.getCredential(context = context, request = request)
        val cred = response.credential
        if (cred is CustomCredential && cred.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
            val google = GoogleIdTokenCredential.createFrom(cred.data)
            // Wave D #745 — the earlier scaffold marked the exchange TODO
            // and never updated _state or persisted the token. UI then
            // showed "signed in" success because the credential dance
            // completed, but the next API request had no Authorization
            // header and 401'd. At minimum, expose the Google id token
            // as a pending state so the feature code knows to call its
            // backend /auth/google endpoint. Real implementation should
            // inject an AuthApi here (Hilt) and exchange the token.
            _state.value = AuthState.PendingExchange(google.idToken)
        } else {
            throw IllegalStateException("Credential Manager returned non-Google credential: ${cred.javaClass.simpleName}")
        }
    }

    /**
     * Wave D #745 — complete the Google sign-in by writing the backend
     * token AND transitioning state. Feature code calls this after
     * exchanging the Google id token for a backend JWT.
     */
    suspend fun completeGoogleSignIn(backendToken: AuthToken) {
        tokenStore.write(backendToken)
        _state.value = AuthState.Authenticated(backendToken)
    }

    suspend fun signOut() {
        tokenStore.clear()
        _state.value = AuthState.Unauthenticated
    }
}

sealed class AuthState {
    object Unknown : AuthState()
    object Unauthenticated : AuthState()
    data class Authenticated(val token: AuthToken) : AuthState()
    // Wave D #745 — Google credential obtained but backend exchange
    // hasn't happened yet. Feature code observes this and calls its
    // /auth/google endpoint, then invokes completeGoogleSignIn().
    data class PendingExchange(val googleIdToken: String) : AuthState()
}
