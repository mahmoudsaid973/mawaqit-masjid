// PR-29 — Hilt network module. Provides ApiClient + Retrofit services.
package com.forge.mawaqitmasjid.di

import android.content.Context
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import com.forge.mawaqitmasjid.services.ApiClient
import com.forge.mawaqitmasjid.services.DataStoreTokenStore
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides @Singleton
    fun provideTokenStore(@ApplicationContext ctx: Context): DataStoreTokenStore = DataStoreTokenStore(ctx)

    @Provides @Singleton
    fun provideApiClient(tokenStore: DataStoreTokenStore): ApiClient = ApiClient(tokenStore)
}
