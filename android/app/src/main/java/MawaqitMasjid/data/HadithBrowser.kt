// Wave15.4: stripped 2 lines of leading LLM narration prose
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import androidx.room.Delete
import kotlinx.coroutines.flow.Flow

/**
 * Room entity representing a Hadith entry for the Hadith Browser feature.
 * Stores the collection name, hadith text, reference, and metadata.
 */
@Entity(tableName = "hadith_entries")
data class HadithEntry(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val collectionName: String,
    val hadithNumber: String,
    val arabicText: String,
    val englishText: String,
    val narrator: String,
    val grade: String?,
    val reference: String?,
    val category: String?,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

/**
 * Data Access Object (DAO) for performing database operations on HadithEntry.
 * Provides suspend functions for write operations and Flow for reactive read operations.
 */
@Dao
interface HadithBrowserDao {

    /**
     * Inserts a single hadith entry. If a conflict occurs based on unique constraints,
     * the existing entry is replaced.
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertHadith(hadith: HadithEntry): Long

    /**
     * Inserts a list of hadith entries in a single transaction.
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertHadithList(hadithList: List<HadithEntry>): List<Long>

    /**
     * Updates an existing hadith entry.
     */
    @Update
    suspend fun updateHadith(hadith: HadithEntry)

    /**
     * Deletes a specific hadith entry.
     */
    @Delete
    suspend fun deleteHadith(hadith: HadithEntry)

    /**
     * Retrieves all hadith entries as a reactive Flow.
     * Emits a new list whenever the underlying table changes.
     */
    @Query("SELECT * FROM hadith_entries ORDER BY createdAt DESC")
    fun getAllHadith(): Flow<List<HadithEntry>>

    /**
     * Retrieves a specific hadith by its ID.
     */
    @Query("SELECT * FROM hadith_entries WHERE id = :hadithId")
    suspend fun getHadithById(hadithId: Long): HadithEntry?

    /**
     * Retrieves hadith entries filtered by collection name.
     */
    @Query("SELECT * FROM hadith_entries WHERE collectionName = :collectionName ORDER BY hadithNumber ASC")
    fun getHadithByCollection(collectionName: String): Flow<List<HadithEntry>>

    /**
     * Searches for hadith entries containing the query text in English or Arabic text.
     */
    @Query("SELECT * FROM hadith_entries WHERE englishText LIKE :query OR arabicText LIKE :query ORDER BY createdAt DESC")
    fun searchHadith(query: String): Flow<List<HadithEntry>>

    /**
     * Counts the total number of hadith entries in the database.
     */
    @Query("SELECT COUNT(*) FROM hadith_entries")
    suspend fun getHadithCount(): Int

    /**
     * Deletes all entries from the hadith table.
     */
    @Query("DELETE FROM hadith_entries")
    suspend fun deleteAllHadith()
}