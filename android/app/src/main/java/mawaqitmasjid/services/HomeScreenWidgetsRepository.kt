// Auto-generated minimal Repository for "Home Screen Widgets" (F006)
// PR-29 — wraps the global ApiClient with typed fetchAll() for this feature.
package mawaqitmasjid.services

import javax.inject.Inject
import javax.inject.Singleton

/** Wave 11 #739 — typed domain model (was List<Any>: a Kotlin
 *  type-erasure equivalent of `any` that the coding council
 *  hard-rejects under constitution rule 8). Coder-team extends with
 *  feature-specific fields; the typed shape is the compilable floor. */
data class HomeScreenWidgetsItem(
    val id: String = "",
    val name: String = "",
    val createdAt: String = "",
)

@Singleton
class HomeScreenWidgetsRepository @Inject constructor(
    private val apiClient: ApiClient,
) {
    suspend fun fetchAll(): Result<List<HomeScreenWidgetsItem>> {
        return runCatching {
            apiClient.get("/api/home_screen_widgets").body<List<HomeScreenWidgetsItem>>()
        }
    }
}
