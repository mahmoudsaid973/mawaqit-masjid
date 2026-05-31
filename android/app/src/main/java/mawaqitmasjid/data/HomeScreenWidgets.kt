// Auto-generated minimal Room entity for "Home Screen Widgets" (F006)
package mawaqitmasjid.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "home_screen_widgets")
data class HomeScreenWidgets(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String = "",
    val createdAt: Long = System.currentTimeMillis(),
)
