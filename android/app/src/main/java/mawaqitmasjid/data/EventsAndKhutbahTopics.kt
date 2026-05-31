// Auto-generated minimal Room entity for "Events and Khutbah Topics" (F002)
package mawaqitmasjid.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "events_and_khutbah_topics")
data class EventsAndKhutbahTopics(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String = "",
    val createdAt: Long = System.currentTimeMillis(),
)
