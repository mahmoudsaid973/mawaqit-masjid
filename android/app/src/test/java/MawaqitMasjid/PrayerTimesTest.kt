// Wave15.4: stripped 2 lines of leading LLM narration prose
import org.junit.Assert.assertEquals
import org.junit.Test

/** Tests for "Prayer Times" — asserts the model holds its values. */
class PrayerTimesTest {
    @Test
    fun prayerTimes_model_holds_values() {
        val model = PrayerTimes(id = "1", name = "Prayer Times")
        assertEquals("1", model.id)
        assertEquals("Prayer Times", model.name)
    }
}
