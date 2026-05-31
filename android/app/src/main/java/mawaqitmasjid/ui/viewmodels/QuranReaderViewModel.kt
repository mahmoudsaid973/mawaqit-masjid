// Auto-generated minimal ViewModel for "Quran Reader" (F003)
// PR-29 — calls QuranReaderRepository, which wraps the global ApiClient.
package mawaqitmasjid.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import mawaqitmasjid.services.QuranReaderRepository
import mawaqitmasjid.services.QuranReaderItem

data class QuranReaderUiState(
    val items: List<QuranReaderItem> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class QuranReaderViewModel @Inject constructor(
    private val repository: QuranReaderRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(QuranReaderUiState())
    val state: StateFlow<QuranReaderUiState> = _state

    fun load() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            val result = repository.fetchAll()
            _state.value = result.fold(
                onSuccess = { items -> QuranReaderUiState(items = items, isLoading = false) },
                onFailure = { e -> QuranReaderUiState(items = emptyList(), isLoading = false, error = e.message) },
            )
        }
    }
}
