// Auto-generated minimal ViewModel for "Home Screen Widgets" (F006)
// PR-29 — calls HomeScreenWidgetsRepository, which wraps the global ApiClient.
package mawaqitmasjid.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import mawaqitmasjid.services.HomeScreenWidgetsRepository
import mawaqitmasjid.services.HomeScreenWidgetsItem

data class HomeScreenWidgetsUiState(
    val items: List<HomeScreenWidgetsItem> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class HomeScreenWidgetsViewModel @Inject constructor(
    private val repository: HomeScreenWidgetsRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(HomeScreenWidgetsUiState())
    val state: StateFlow<HomeScreenWidgetsUiState> = _state

    fun load() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            val result = repository.fetchAll()
            _state.value = result.fold(
                onSuccess = { items -> HomeScreenWidgetsUiState(items = items, isLoading = false) },
                onFailure = { e -> HomeScreenWidgetsUiState(items = emptyList(), isLoading = false, error = e.message) },
            )
        }
    }
}
