// Wave15.4: stripped 2 lines of leading LLM narration prose
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** ViewModel for "Hadith Browser". Exposes UI state via StateFlow and
 *  loads a deterministic default dataset; swap load() for a repository
 *  call when the data source is available. */
data class HadithBrowserItem(val id: String, val title: String, val subtitle: String)

data class HadithBrowserUiState(
    val isLoading: Boolean = false,
    val items: List<HadithBrowserItem> = emptyList(),
    val errorMessage: String? = null,
)

class HadithBrowserViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(HadithBrowserUiState())
    val uiState: StateFlow<HadithBrowserUiState> = _uiState.asStateFlow()

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            try {
                _uiState.value = HadithBrowserUiState(
                    isLoading = false,
                    items = listOf(
                        HadithBrowserItem("1", "Hadith Browser 1", "Ready"),
                        HadithBrowserItem("2", "Hadith Browser 2", "Ready"),
                    ),
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = e.message)
            }
        }
    }
}
