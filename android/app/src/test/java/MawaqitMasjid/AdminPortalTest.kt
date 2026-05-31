// Wave15.4: stripped 2 lines of leading LLM narration prose
import org.junit.Assert.assertEquals
import org.junit.Test

/** Tests for "Admin Portal" — asserts the model holds its values. */
class AdminPortalTest {
    @Test
    fun adminPortal_model_holds_values() {
        val model = AdminPortal(id = "1", name = "Admin Portal")
        assertEquals("1", model.id)
        assertEquals("Admin Portal", model.name)
    }
}
