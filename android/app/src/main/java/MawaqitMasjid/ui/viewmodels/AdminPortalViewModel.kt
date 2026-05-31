// Wave15.4: stripped 2 lines of leading LLM narration prose
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** ViewModel for "Admin Portal". Exposes UI state via StateFlow and
 *  loads a deterministic default dataset; swap load() for a repository
 *  call when the data source is available. */
data class AdminPortalItem(val id: String, val title: String, val subtitle: String)

data class AdminPortalUiState(
    val isLoading: Boolean = false,
    val items: List<AdminPortalItem> = emptyList(),
    val errorMessage: String? = null,
)

class AdminPortalViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(AdminPortalUiState())
    val uiState: StateFlow<AdminPortalUiState> = _uiState.asStateFlow()

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            try {
                _uiState.value = AdminPortalUiState(
                    isLoading = false,
                    items = listOf(
                        AdminPortalItem("1", "Admin Portal 1", "Ready"),
                        AdminPortalItem("2", "Admin Portal 2", "Ready"),
                    ),
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = e.message)
            }
        }
    }
}
