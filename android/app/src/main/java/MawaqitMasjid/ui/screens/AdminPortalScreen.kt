// Wave15.4: stripped 2 lines of leading LLM narration prose
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp

/** File-private row type — uniquely named so it never collides with other
 *  model types in the module. */
private data class AdminPortalScreenRow(val id: String, val title: String, val subtitle: String)

/**
 * Admin Portal Compose screen. Self-contained: owns its loading / error
 * / list state via remember + a LaunchedEffect load with no external
 * ViewModel dependency, and sets TalkBack content descriptions on every
 * node. Swap the LaunchedEffect body for a ViewModel/repository call when
 * the data source is available.
 */
@Composable
fun AdminPortalScreen() {
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var items by remember { mutableStateOf(emptyList<AdminPortalScreenRow>()) }
    LaunchedEffect(Unit) {
        isLoading = true
        errorMessage = null
        try {
            items = listOf(
                AdminPortalScreenRow("1", "Admin Portal 1", "Ready"),
                AdminPortalScreenRow("2", "Admin Portal 2", "Ready"),
            )
        } catch (e: Exception) {
            errorMessage = e.message
        } finally {
            isLoading = false
        }
    }
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        when {
            isLoading -> CircularProgressIndicator()
            errorMessage != null -> Text(
                text = errorMessage ?: "",
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.semantics { contentDescription = "Error loading Admin Portal" },
            )
            items.isEmpty() -> Text(
                text = "No items yet",
                modifier = Modifier.semantics { contentDescription = "Admin Portal: no items yet" },
            )
            else -> LazyColumn(modifier = Modifier.fillMaxSize()) {
                items(items, key = { it.id }) { item ->
                    Text(
                        text = item.title + " — " + item.subtitle,
                        modifier = Modifier
                            .padding(16.dp)
                            .semantics { contentDescription = item.title + ", " + item.subtitle },
                    )
                }
            }
        }
    }
}
