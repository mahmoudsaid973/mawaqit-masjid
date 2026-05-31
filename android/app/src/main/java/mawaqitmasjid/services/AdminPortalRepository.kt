// Auto-generated minimal Repository for "Admin Portal" (F007)
// PR-29 — wraps the global ApiClient with typed fetchAll() for this feature.
package mawaqitmasjid.services

import javax.inject.Inject
import javax.inject.Singleton

/** Wave 11 #739 — typed domain model (was List<Any>: a Kotlin
 *  type-erasure equivalent of `any` that the coding council
 *  hard-rejects under constitution rule 8). Coder-team extends with
 *  feature-specific fields; the typed shape is the compilable floor. */
data class AdminPortalItem(
    val id: String = "",
    val name: String = "",
    val createdAt: String = "",
)

@Singleton
class AdminPortalRepository @Inject constructor(
    private val apiClient: ApiClient,
) {
    suspend fun fetchAll(): Result<List<AdminPortalItem>> {
        return runCatching {
            apiClient.get("/api/admin_portal").body<List<AdminPortalItem>>()
        }
    }
}
