// Auto-generated minimal ViewModel for "Hadith Browser" (F004)
// PR-29 — calls HadithBrowserRepository, which wraps the global ApiClient.
package mawaqitmasjid.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import mawaqitmasjid.services.HadithBrowserRepository
import mawaqitmasjid.services.HadithBrowserItem

data class HadithBrowserUiState(
    val items: List<HadithBrowserItem> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class HadithBrowserViewModel @Inject constructor(
    private val repository: HadithBrowserRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(HadithBrowserUiState())
    val state: StateFlow<HadithBrowserUiState> = _state

    fun load() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            val result = repository.fetchAll()
            _state.value = result.fold(
                onSuccess = { items -> HadithBrowserUiState(items = items, isLoading = false) },
                onFailure = { e -> HadithBrowserUiState(items = emptyList(), isLoading = false, error = e.message) },
            )
        }
    }
}
