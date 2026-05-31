// Wave15.4: stripped 2 lines of leading LLM narration prose
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** ViewModel for "Events and Khutbah Topics". Exposes UI state via StateFlow and
 *  loads a deterministic default dataset; swap load() for a repository
 *  call when the data source is available. */
data class EventsAndKhutbahTopicsItem(val id: String, val title: String, val subtitle: String)

data class EventsAndKhutbahTopicsUiState(
    val isLoading: Boolean = false,
    val items: List<EventsAndKhutbahTopicsItem> = emptyList(),
    val errorMessage: String? = null,
)

class EventsAndKhutbahTopicsViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(EventsAndKhutbahTopicsUiState())
    val uiState: StateFlow<EventsAndKhutbahTopicsUiState> = _uiState.asStateFlow()

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            try {
                _uiState.value = EventsAndKhutbahTopicsUiState(
                    isLoading = false,
                    items = listOf(
                        EventsAndKhutbahTopicsItem("1", "Events and Khutbah Topics 1", "Ready"),
                        EventsAndKhutbahTopicsItem("2", "Events and Khutbah Topics 2", "Ready"),
                    ),
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = e.message)
            }
        }
    }
}
