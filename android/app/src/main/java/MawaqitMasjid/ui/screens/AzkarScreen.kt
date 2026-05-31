// android/app/src/main/java/MawaqitMasjid/ui/screens/AzkarScreen.kt
package MawaqitMasjid.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import kotlinx.coroutines.*
import androidx.lifecycle.viewmodel.compose.*
import androidx.lifecycle.viewmodel.*
import androidx.lifecycle.*
import MawaqitMasjid.viewmodel.AzkarViewModel

class AzkarScreenViewModel : ViewModel() {
    private val _azkarList = mutableStateOf<List<String>>(emptyList())
    val azkarList: State<List<String>> = _azkarList

    private fun loadAzkar() {
        // In a real app, this would be populated from a repository or API
        _azkarList.value = listOf(
            "Subhan Allah",
            "Alhamdulillah",
            "Allah Akbar",
            "La Ilaha Illa Allah",
            "Astaghfirullah"
        )
    }

    fun initialize() {
        loadAzkar()
    }

    @Composable
    fun AzkarItem(azkar: String, onAzkarClick: (String) -> Unit)n    {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Row(modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(azkar, style = MaterialTheme.typography.bodyMedium)
                Button(onClick = { onAzkarClick(azkar) }) {
                    Text("Recite")
                }
            }
        }
    }
}

@Composable
fun ComposeScreenForAzkarScreen(modifier: Modifier = Modifier) {
    val viewModel = viewModel<AzkarScreenViewModel>()
    val azkarList by viewModel.azkarList.observeAsState()

    LaunchedEffect(Unit) {
        viewModel.initialize()
    }

    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        Text("Azkar", style = MaterialTheme.typography.headlineMedium)
        
        if (azkarList != null) {
            LazyColumn {
                items(azkarList!!) { azkar ->
                    AzkarItem(azkar) { selectedAzkar ->
                        // Handle the selection, e.g., show details or start recitation
                        println("Reciting: $selectedAzkar")
                    }
                }
            }
        }
    }
}
