// Wave15.4: stripped 2 lines of leading LLM narration prose
/** Domain model for "Quran Reader" with stable identity and a creation
 *  timestamp. */
data class QuranReader(
    val id: String,
    val name: String,
    val createdAtEpochMs: Long = System.currentTimeMillis(),
)
