// PR-34 android-navigator-agent — deterministic NavHost.
// Regenerated every P4 so every feature Screen has a route + home entry.
// LLM-free. Replace manually only if you need a custom root UI.
package com.forge.mawaqitmasjid

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.forge.mawaqitmasjid.ui.screens.PrayerTimesScreen
import com.forge.mawaqitmasjid.ui.screens.EventsAndKhutbahTopicsScreen
import com.forge.mawaqitmasjid.ui.screens.QuranReaderScreen
import com.forge.mawaqitmasjid.ui.screens.HadithBrowserScreen
import com.forge.mawaqitmasjid.ui.screens.AzkarScreen
import com.forge.mawaqitmasjid.ui.screens.HomeScreenWidgetsScreen
import com.forge.mawaqitmasjid.ui.screens.AdminPortalScreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppNavHost() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "home") {
        composable(route = "home") { HomeScreen(navController) }
        composable(route = "prayertimes") { PrayerTimesScreen() }
        composable(route = "eventsandkhutbahtopics") { EventsAndKhutbahTopicsScreen() }
        composable(route = "quranreader") { QuranReaderScreen() }
        composable(route = "hadithbrowser") { HadithBrowserScreen() }
        composable(route = "azkar") { AzkarScreen() }
        composable(route = "homescreenwidgets") { HomeScreenWidgetsScreen() }
        composable(route = "adminportal") { AdminPortalScreen() }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(navController: NavHostController) {
    Scaffold(
        topBar = { TopAppBar(title = { Text("MawaqitMasjid") }) },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState()),
        ) {
            Text(
                text = "Features",
                style = MaterialTheme.typography.labelLarge,
                modifier = Modifier.padding(16.dp),
            )
            ElevatedCard(modifier = Modifier.padding(horizontal = 16.dp)) {
                Column {
                FeatureLink(title = "Prayer Times") { navController.navigate("prayertimes") }
                FeatureLink(title = "Events and Khutbah Topics") { navController.navigate("eventsandkhutbahtopics") }
                FeatureLink(title = "Quran Reader") { navController.navigate("quranreader") }
                FeatureLink(title = "Hadith Browser") { navController.navigate("hadithbrowser") }
                FeatureLink(title = "Azkar") { navController.navigate("azkar") }
                FeatureLink(title = "Home Screen Widgets") { navController.navigate("homescreenwidgets") }
                }
            }
            Text(
                text = "Admin",
                style = MaterialTheme.typography.labelLarge,
                modifier = Modifier.padding(16.dp),
            )
            ElevatedCard(modifier = Modifier.padding(horizontal = 16.dp)) {
                Column {
                FeatureLink(title = "Admin Portal") { navController.navigate("adminportal") }
                }
            }
        }
    }
}

@Composable
private fun FeatureLink(title: String, onClick: () -> Unit) {
    // PR-47 — wire onClick to the row's clickable modifier; previously the
    // callback was received but never invoked, so tapping a feature link
    // did nothing.
    ListItem(
        headlineContent = { Text(title) },
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
    )
}
