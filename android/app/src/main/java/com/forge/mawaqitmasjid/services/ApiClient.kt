// PR-29 — Retrofit + OkHttp ApiClient with bearer interceptor.
// Feature Repositories inject this via Hilt.
package com.forge.mawaqitmasjid.services

import com.forge.mawaqitmasjid.config.AppConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ApiClient @Inject constructor(
    private val tokenStore: DataStoreTokenStore,
) {
    val retrofit: Retrofit by lazy { buildRetrofit() }

    private fun buildRetrofit(): Retrofit {
        val authInterceptor = Interceptor { chain ->
            val original = chain.request()
            // Wave D #745 — runBlocking inside an OkHttp Interceptor blocks
            // the calling thread. If the interceptor fires on Main (e.g. a
            // synchronous Retrofit call from a Composable side-effect), the
            // app freezes for the DataStore I/O and ANRs after 5s. Using
            // runBlocking(Dispatchers.IO) moves the blocking work to a
            // worker thread. Longer-term fix: switch to OkHttp Authenticator
            // which is naturally async.
            val token = runBlocking(Dispatchers.IO) { tokenStore.read() }
            val request = if (token != null && !token.isExpired) {
                original.newBuilder()
                    .header("Authorization", "Bearer ${token.accessToken}")
                    .header("Content-Type", "application/json")
                    .build()
            } else original
            chain.proceed(request)
        }

        val httpClient = OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()

        val json = Json { ignoreUnknownKeys = true; isLenient = true }
        return Retrofit.Builder()
            .baseUrl(AppConfig.apiBaseUrl.trimEnd('/') + "/")
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .client(httpClient)
            .build()
    }

    inline fun <reified T> create(): T = retrofit.create(T::class.java)
}
