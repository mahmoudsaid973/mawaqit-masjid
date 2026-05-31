// Wave15.4: stripped 2 lines of leading LLM narration prose
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** ViewModel for "Prayer Times". Exposes UI state via StateFlow and
 *  loads a deterministic default dataset; swap load() for a repository
 *  call when the data source is available. */
data class PrayerTimesItem(val id: String, val title: String, val subtitle: String)

data class PrayerTimesUiState(
    val isLoading: Boolean = false,
    val items: List<PrayerTimesItem> = emptyList(),
    val errorMessage: String? = null,
)

class PrayerTimesViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(PrayerTimesUiState())
    val uiState: StateFlow<PrayerTimesUiState> = _uiState.asStateFlow()

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            try {
                _uiState.value = PrayerTimesUiState(
                    isLoading = false,
                    items = listOf(
                        PrayerTimesItem("1", "Prayer Times 1", "Ready"),
                        PrayerTimesItem("2", "Prayer Times 2", "Ready"),
                    ),
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = e.message)
            }
        }
    }
}
