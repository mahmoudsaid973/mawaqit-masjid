// Auto-generated minimal ViewModel for "Admin Portal" (F007)
// PR-29 — calls AdminPortalRepository, which wraps the global ApiClient.
package mawaqitmasjid.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import mawaqitmasjid.services.AdminPortalRepository
import mawaqitmasjid.services.AdminPortalItem

data class AdminPortalUiState(
    val items: List<AdminPortalItem> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class AdminPortalViewModel @Inject constructor(
    private val repository: AdminPortalRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(AdminPortalUiState())
    val state: StateFlow<AdminPortalUiState> = _state

    fun load() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            val result = repository.fetchAll()
            _state.value = result.fold(
                onSuccess = { items -> AdminPortalUiState(items = items, isLoading = false) },
                onFailure = { e -> AdminPortalUiState(items = emptyList(), isLoading = false, error = e.message) },
            )
        }
    }
}
