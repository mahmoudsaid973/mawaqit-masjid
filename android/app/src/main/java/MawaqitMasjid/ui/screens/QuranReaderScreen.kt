// Wave15.4: stripped 2 lines of leading LLM narration prose
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import MawaqitMasjid.viewmodel.QuranReaderViewModel

/**
 * The main screen for displaying and reading the Quran.
 * It observes the [QuranReaderViewModel] to render state (loading, content, error).
 *
 * @param modifier Optional modifier for the root layout.
 * @param viewModel The ViewModel providing state and events for the Quran reader.
 */
@Composable
fun QuranReaderScreen(
    modifier: Modifier = Modifier,
    viewModel: QuranReaderViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Box(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        when (val state = uiState) {
            is QuranReaderUiState.Loading -> {
                Text(
                    text = "Loading Quran...",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
            is QuranReaderUiState.Success -> {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = state.surahName,
                        style = MaterialTheme.typography.headlineMedium,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                    Text(
                        text = state.ayatText,
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurface,
                        textAlign = TextAlign.Center,
                        lineHeight = MaterialTheme.typography.bodyLarge.lineHeight * 1.5
                    )
                }
            }
            is QuranReaderUiState.Error -> {
                Text(
                    text = "Error: ${state.message}",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.error,
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}

/**
 * Represents the UI state for the Quran Reader screen.
 */
sealed class QuranReaderUiState {
    object Loading : QuranReaderUiState()
    data class Success(
        val surahName: String,
        val ayatText: String
    ) : QuranReaderUiState()
    data class Error(
        val message: String
    ) : QuranReaderUiState()
}
