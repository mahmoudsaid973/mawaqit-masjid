import SwiftUI

// MARK: - Model

struct HomeScreenWidget: Identifiable, Equatable {
    let id: String
    let title: String
    let subtitle: String
    let iconName: String
    let enabled: Bool
}

// MARK: - ViewModel

@MainActor
final class HomeScreenWidgetsViewModel: ObservableObject {
    @Published var widgets: [HomeScreenWidget] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let widgetService: WidgetServiceProtocol

    init(widgetService: WidgetServiceProtocol = WidgetService()) {
        self.widgetService = widgetService
    }

    func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            widgets = try await widgetService.fetchHomeScreenWidgets()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func toggleWidget(_ widget: HomeScreenWidget) async {
        do {
            try await widgetService.updateWidget(id: widget.id, enabled: !widget.enabled)
            await load()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// MARK: - Service Protocol

protocol WidgetServiceProtocol {
    func fetchHomeScreenWidgets() async throws -> [HomeScreenWidget]
    func updateWidget(id: String, enabled: Bool) async throws
}

// MARK: - Service Implementation

final class WidgetService: WidgetServiceProtocol {
    func fetchHomeScreenWidgets() async throws -> [HomeScreenWidget] {
        // TODO: Replace with actual API call
        try await Task.sleep(nanoseconds: 1_000_000_000)
        return [
            HomeScreenWidget(id: "1", title: "Prayer Times", subtitle: "Next: Fajr at 5:30 AM", iconName: "clock", enabled: true),
            HomeScreenWidget(id: "2", title: "Qibla Direction", subtitle: "Find direction to Mecca", iconName: "location.north", enabled: true),
            HomeScreenWidget(id: "3", title: "Upcoming Events", subtitle: "Eid in 15 days", iconName: "calendar", enabled: false)
        ]
    }

    func updateWidget(id: String, enabled: Bool) async throws {
        // TODO: Replace with actual API call
        try await Task.sleep(nanoseconds: 500_000_000)
    }
}

// MARK: - View

public struct HomeScreenWidgetsView: View {
    @StateObject private var viewModel: HomeScreenWidgetsViewModel

    public init(viewModel: HomeScreenWidgetsViewModel = HomeScreenWidgetsViewModel()) {
        _viewModel = StateObject(wrappedValue: viewModel)
    }

    public var body: some View {
        Group {
            if viewModel.isLoading && viewModel.widgets.isEmpty {
                ProgressView("Loading widgets...")
                    .controlSize(.large)
            } else if let message = viewModel.errorMessage {
                ContentUnavailableView(
                    "Unable to Load Widgets",
                    systemImage: "exclamationmark.triangle",
                    description: Text(message)
                )
            } else if viewModel.widgets.isEmpty {
                ContentUnavailableView(
                    "No Widgets Configured",
                    systemImage: "tray",
                    description: Text("Add widgets to your home screen for quick access to prayer times and events.")
                )
            } else {
                List {
                    ForEach(viewModel.widgets) { widget in
                        WidgetRow(widget: widget) {
                            Task { await viewModel.toggleWidget(widget) }
                        }
                    }
                }
                .refreshable { await viewModel.load() }
            }
        }
        .navigationTitle("Home Screen Widgets")
        .task { await viewModel.load() }
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    Task { await viewModel.load() }
                } label: {
                    Image(systemName: "arrow.clockwise")
                        .accessibilityLabel("Refresh widgets")
                }
                .disabled(viewModel.isLoading)
            }
        }
    }
}

// MARK: - Widget Row

private struct WidgetRow: View {
    let widget: HomeScreenWidget
    let onToggle: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: widget.iconName)
                .font(.title2)
                .foregroundStyle(widget.enabled ? .blue : .gray)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 2) {
                Text(widget.title)
                    .font(.headline)
                Text(widget.subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Toggle("", isOn: .constant(widget.enabled))
                .labelsHidden()
                .onTapGesture { onToggle() }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        HomeScreenWidgetsView()
    }
}
