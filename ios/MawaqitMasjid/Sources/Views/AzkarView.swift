// Auto-generated SwiftUI view for "Azkar" (F005)
// PR-28 — wireframe-derived (archetype: table). Polished by
// the wireframe translator from the matching wireframes/ HTML.
import SwiftUI

public struct AzkarView: View {
    @StateObject private var viewModel = AzkarViewModel()

    public init() {}

    public var body: some View {
        List {
            if viewModel.isLoading {
                ProgressView().frame(maxWidth: .infinity).padding(.vertical, 16)
            } else if viewModel.items.isEmpty {
                ContentUnavailableView("Azkar" + " — no items", systemImage: "tray")
            } else {
                ForEach(viewModel.items) { item in
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: "doc.text")
                            .foregroundStyle(.tint)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(item.name)
                                .font(.headline)
                            Text(item.createdAt, style: .relative)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
        }
        .listStyle(.insetGrouped)

    }
}

#Preview {
    NavigationStack { AzkarView() }
}
