// Auto-generated minimal ViewModel for "Events and Khutbah Topics" (F002)
// PR-29 — calls EventsAndKhutbahTopicsRepository, which wraps the global ApiClient.
package mawaqitmasjid.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import mawaqitmasjid.services.EventsAndKhutbahTopicsRepository
import mawaqitmasjid.services.EventsAndKhutbahTopicsItem

data class EventsAndKhutbahTopicsUiState(
    val items: List<EventsAndKhutbahTopicsItem> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class EventsAndKhutbahTopicsViewModel @Inject constructor(
    private val repository: EventsAndKhutbahTopicsRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(EventsAndKhutbahTopicsUiState())
    val state: StateFlow<EventsAndKhutbahTopicsUiState> = _state

    fun load() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            val result = repository.fetchAll()
            _state.value = result.fold(
                onSuccess = { items -> EventsAndKhutbahTopicsUiState(items = items, isLoading = false) },
                onFailure = { e -> EventsAndKhutbahTopicsUiState(items = emptyList(), isLoading = false, error = e.message) },
            )
        }
    }
}
