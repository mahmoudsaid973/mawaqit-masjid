// Wave15.4: stripped 2 lines of leading LLM narration prose
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** ViewModel for "Azkar". Exposes UI state via StateFlow and
 *  loads a deterministic default dataset; swap load() for a repository
 *  call when the data source is available. */
data class AzkarItem(val id: String, val title: String, val subtitle: String)

data class AzkarUiState(
    val isLoading: Boolean = false,
    val items: List<AzkarItem> = emptyList(),
    val errorMessage: String? = null,
)

class AzkarViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(AzkarUiState())
    val uiState: StateFlow<AzkarUiState> = _uiState.asStateFlow()

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            try {
                _uiState.value = AzkarUiState(
                    isLoading = false,
                    items = listOf(
                        AzkarItem("1", "Azkar 1", "Ready"),
                        AzkarItem("2", "Azkar 2", "Ready"),
                    ),
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = e.message)
            }
        }
    }
}
