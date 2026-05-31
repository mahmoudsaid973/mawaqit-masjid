// Auto-generated minimal Room entity for "Azkar" (F005)
package mawaqitmasjid.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "azkar")
data class Azkar(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String = "",
    val createdAt: Long = System.currentTimeMillis(),
)
