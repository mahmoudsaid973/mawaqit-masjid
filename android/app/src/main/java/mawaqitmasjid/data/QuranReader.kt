// Auto-generated minimal Room entity for "Quran Reader" (F003)
package mawaqitmasjid.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "quran_reader")
data class QuranReader(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String = "",
    val createdAt: Long = System.currentTimeMillis(),
)
