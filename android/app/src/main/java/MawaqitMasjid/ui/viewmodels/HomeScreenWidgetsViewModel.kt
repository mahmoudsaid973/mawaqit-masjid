// Wave15.4: stripped 2 lines of leading LLM narration prose
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** ViewModel for "Home Screen Widgets". Exposes UI state via StateFlow and
 *  loads a deterministic default dataset; swap load() for a repository
 *  call when the data source is available. */
data class HomeScreenWidgetsItem(val id: String, val title: String, val subtitle: String)

data class HomeScreenWidgetsUiState(
    val isLoading: Boolean = false,
    val items: List<HomeScreenWidgetsItem> = emptyList(),
    val errorMessage: String? = null,
)

class HomeScreenWidgetsViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(HomeScreenWidgetsUiState())
    val uiState: StateFlow<HomeScreenWidgetsUiState> = _uiState.asStateFlow()

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            try {
                _uiState.value = HomeScreenWidgetsUiState(
                    isLoading = false,
                    items = listOf(
                        HomeScreenWidgetsItem("1", "Home Screen Widgets 1", "Ready"),
                        HomeScreenWidgetsItem("2", "Home Screen Widgets 2", "Ready"),
                    ),
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = e.message)
            }
        }
    }
}
