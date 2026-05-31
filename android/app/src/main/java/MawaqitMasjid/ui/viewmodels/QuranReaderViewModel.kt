// Wave15.4: stripped 2 lines of leading LLM narration prose
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** ViewModel for "Quran Reader". Exposes UI state via StateFlow and
 *  loads a deterministic default dataset; swap load() for a repository
 *  call when the data source is available. */
data class QuranReaderItem(val id: String, val title: String, val subtitle: String)

data class QuranReaderUiState(
    val isLoading: Boolean = false,
    val items: List<QuranReaderItem> = emptyList(),
    val errorMessage: String? = null,
)

class QuranReaderViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(QuranReaderUiState())
    val uiState: StateFlow<QuranReaderUiState> = _uiState.asStateFlow()

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            try {
                _uiState.value = QuranReaderUiState(
                    isLoading = false,
                    items = listOf(
                        QuranReaderItem("1", "Quran Reader 1", "Ready"),
                        QuranReaderItem("2", "Quran Reader 2", "Ready"),
                    ),
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = e.message)
            }
        }
    }
}
