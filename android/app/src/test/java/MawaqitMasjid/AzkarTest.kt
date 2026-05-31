// Wave15.4: stripped 2 lines of leading LLM narration prose
import MawaqitMasjid.ui.screens.AzkarScreenViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

/**
 * Unit tests for AzkarScreenViewModel.
 * Validates the initialization logic, state updates, and edge cases
 * for the Azkar (remembrance) feature without requiring Android instrumentation.
 */
class AzkarTest {

    private lateinit var viewModel: AzkarScreenViewModel

    @Before
    fun setup() {
        viewModel = AzkarScreenViewModel()
    }

    @Test
    fun `initial state should be empty list before initialization`() {
        // Arrange: ViewModel is created but initialize() has not been called yet
        val initialState = viewModel.azkarList.value

        // Assert: State should be empty initially
        assertTrue("Initial state should be empty", initialState.isNullOrEmpty())
    }

    @Test
    fun `initialize should populate azkar list with default values`() {
        // Arrange
        val expectedCount = 5
        val expectedFirstItem = "Subhan Allah"

        // Act
        viewModel.initialize()
        val result = viewModel.azkarList.value

        // Assert: Happy path - list is populated correctly
        assertFalse("List should not be empty after initialization", result.isNullOrEmpty())
        assertEquals("List should contain expected number of items", expectedCount, result?.size)
        assertEquals("First item should match expected default", expectedFirstItem, result?.first())
    }

    @Test
    fun `azkar list should contain specific core remembrances`() {
        // Arrange
        val requiredAzkar = listOf(
            "Subhan Allah",
            "Alhamdulillah",
            "Allah Akbar"
        )

        // Act
        viewModel.initialize()
        val result = viewModel.azkarList.value

        // Assert: Boundary case - verify specific required content exists
        requiredAzkar.forEach { required ->
            assertTrue("List must contain '$required'", result?.contains(required) == true)
        }
    }

    @Test
    fun `re-initialization should not duplicate entries`() {
        // Arrange
        viewModel.initialize()
        val firstInitSize = viewModel.azkarList.value?.size

        // Act: Call initialize again
        viewModel.initialize()
        val secondInitSize = viewModel.azkarList.value?.size

        // Assert: Idempotency check - size should remain constant
        assertEquals("Re-initialization should not duplicate items", firstInitSize, secondInitSize)
    }
}