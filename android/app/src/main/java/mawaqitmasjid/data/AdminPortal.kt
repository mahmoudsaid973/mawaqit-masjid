// Auto-generated minimal Room entity for "Admin Portal" (F007)
package mawaqitmasjid.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "admin_portal")
data class AdminPortal(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String = "",
    val createdAt: Long = System.currentTimeMillis(),
)
