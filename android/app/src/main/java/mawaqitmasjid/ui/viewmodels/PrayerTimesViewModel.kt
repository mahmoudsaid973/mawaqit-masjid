// Auto-generated minimal ViewModel for "Prayer Times" (F001)
// PR-29 — calls PrayerTimesRepository, which wraps the global ApiClient.
package mawaqitmasjid.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import mawaqitmasjid.services.PrayerTimesRepository
import mawaqitmasjid.services.PrayerTimesItem

data class PrayerTimesUiState(
    val items: List<PrayerTimesItem> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class PrayerTimesViewModel @Inject constructor(
    private val repository: PrayerTimesRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(PrayerTimesUiState())
    val state: StateFlow<PrayerTimesUiState> = _state

    fun load() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            val result = repository.fetchAll()
            _state.value = result.fold(
                onSuccess = { items -> PrayerTimesUiState(items = items, isLoading = false) },
                onFailure = { e -> PrayerTimesUiState(items = emptyList(), isLoading = false, error = e.message) },
            )
        }
    }
}
