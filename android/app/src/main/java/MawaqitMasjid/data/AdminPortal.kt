// Wave15.4: stripped 2 lines of leading LLM narration prose
/** Domain model for "Admin Portal" with stable identity and a creation
 *  timestamp. */
data class AdminPortal(
    val id: String,
    val name: String,
    val createdAtEpochMs: Long = System.currentTimeMillis(),
)
