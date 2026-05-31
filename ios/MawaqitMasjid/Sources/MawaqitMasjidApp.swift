// PR-27 ios-navigator-agent — deterministic entry + ContentView.
// Regenerated every P4 to wire every feature View into the home screen.
// LLM-free. Replace manually only if you need a custom root UI.
import SwiftUI

@main
struct MawaqitMasjidApp: App {
    let persistence = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistence.container.viewContext)
        }
    }
}

struct ContentView: View {
    var body: some View {
        NavigationStack {
            List {
                Section(header: Text("Features")) {
                    NavigationLink("Prayer Times") { PrayerTimesView() }
                    NavigationLink("Events and Khutbah Topics") { EventsAndKhutbahTopicsView() }
                    NavigationLink("Quran Reader") { QuranReaderView() }
                    NavigationLink("Hadith Browser") { HadithBrowserView() }
                    NavigationLink("Azkar") { AzkarView() }
                    NavigationLink("Home Screen Widgets") { HomeScreenWidgetsView() }
                }

                Section(header: Text("Admin")) {
                    NavigationLink("Admin Portal") { AdminPortalView() }
                }
            }
            .navigationTitle("MawaqitMasjid")
        }
    }
}
