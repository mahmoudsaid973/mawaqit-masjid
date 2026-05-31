// Auto-generated minimal ViewModel for "Azkar" (F005)
// PR-29 — calls AzkarRepository, which wraps the global ApiClient.
package mawaqitmasjid.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import mawaqitmasjid.services.AzkarRepository
import mawaqitmasjid.services.AzkarItem

data class AzkarUiState(
    val items: List<AzkarItem> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class AzkarViewModel @Inject constructor(
    private val repository: AzkarRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(AzkarUiState())
    val state: StateFlow<AzkarUiState> = _state

    fun load() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            val result = repository.fetchAll()
            _state.value = result.fold(
                onSuccess = { items -> AzkarUiState(items = items, isLoading = false) },
                onFailure = { e -> AzkarUiState(items = emptyList(), isLoading = false, error = e.message) },
            )
        }
    }
}
