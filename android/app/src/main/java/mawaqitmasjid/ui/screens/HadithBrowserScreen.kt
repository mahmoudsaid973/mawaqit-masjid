// Auto-generated Compose screen for "Hadith Browser" (F004)
// PR-28 — wireframe-derived (archetype: table). Polished by
// the wireframe translator from the matching wireframes/ HTML.
package mawaqitmasjid.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import import androidx.compose.foundation.layout.*
import import androidx.compose.foundation.lazy.LazyColumn
import import androidx.compose.foundation.lazy.grid.GridCells
import import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import import androidx.compose.foundation.rememberScrollState
import import androidx.compose.foundation.verticalScroll
import import androidx.compose.material3.*
import import androidx.compose.runtime.*
import import androidx.compose.ui.Alignment
import import androidx.compose.ui.Modifier
import import androidx.compose.ui.unit.dp
import import androidx.compose.foundation.lazy.items
import import androidx.compose.material.icons.Icons
import import androidx.compose.material.icons.rounded.Description

@Composable
fun HadithBrowserScreen(modifier: Modifier = Modifier) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        when (val state = uiState) {
            is HadithbrowserUiState.Loading -> item { CircularProgressIndicator() }
            is HadithbrowserUiState.Error -> item { Text(state.message, color = MaterialTheme.colorScheme.error) }
            is HadithbrowserUiState.Content -> items(state.items) { item ->
                ListItem(
                    headlineContent = { Text(item.name) },
                    supportingContent = { Text(item.createdAt, style = MaterialTheme.typography.bodySmall) },
                    leadingContent = { Icon(Icons.Rounded.Description, contentDescription = null) },
                )
            }
        }
    }

}
