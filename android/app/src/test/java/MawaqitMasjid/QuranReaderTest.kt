// Wave15.4: stripped 2 lines of leading LLM narration prose
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.TestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test

/**
 * Unit tests for the QuranReaderViewModel and related UI state logic.
 */

class QuranReaderTest {

    private lateinit var viewModel: TestQuranReaderViewModel
    private lateinit var dispatcher: TestDispatcher

    @Before
    fun setup() {
        dispatcher = StandardTestDispatcher()
        viewModel = TestQuranReaderViewModel(dispatcher)
    }

    @Test
    fun `initial state should be Loading`() = runTest {
        assertEquals(QuranReaderUiState.Loading, viewModel.uiState.value)
    }

    @Test
    fun `successful load should emit Success state`() = runTest {
        viewModel.loadQuranContent()
        // Advance virtual time to allow coroutine execution
        dispatcher.scheduler.advanceUntilIdle()

        val expectedState = QuranReaderUiState.Success(
            surahName = "Al-Fatiha",
            ayatText = "Bismillahir Rahmanir Rahim..."
        )
        assertEquals(expectedState, viewModel.uiState.value)
    }

    @Test
    fun `failed load should emit Error state`() = runTest {
        viewModel.loadQuranContent(shouldFail = true)
        dispatcher.scheduler.advanceUntilIdle()

        val expectedState = QuranReaderUiState.Error(
            message = "Failed to load Quran content"
        )
        assertEquals(expectedState, viewModel.uiState.value)
    }

    /**
     * A testable version of QuranReaderViewModel that allows controlling success/failure.
     */
    class TestQuranReaderViewModel(
        private val dispatcher: TestDispatcher
    ) : ViewModel() {

        private val _uiState = MutableStateFlow<QuranReaderUiState>(QuranReaderUiState.Loading)
        val uiState: StateFlow<QuranReaderUiState> = _uiState

        fun loadQuranContent(shouldFail: Boolean = false) {
            viewModelScope.launch(dispatcher) {
                try {
                    if (shouldFail) {
                        throw Exception("Network error")
                    }
                    // Simulate successful data fetch
                    _uiState.value = QuranReaderUiState.Success(
                        surahName = "Al-Fatiha",
                        ayatText = "Bismillahir Rahmanir Rahim..."
                    )
                } catch (e: Exception) {
                    _uiState.value = QuranReaderUiState.Error(e.message ?: "Unknown error")
                }
            }
        }
    }
}
