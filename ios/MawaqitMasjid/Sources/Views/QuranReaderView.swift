// Auto-generated SwiftUI view for "Quran Reader" (F003)
// PR-28 — wireframe-derived (archetype: form). Polished by
// the wireframe translator from the matching wireframes/ HTML.
import SwiftUI

public struct QuranReaderView: View {
    @StateObject private var viewModel = QuranReaderViewModel()

    public init() {}

    public var body: some View {
        Form {
            Section {
                    TextField("Ayah:", text: $viewModel.form.ayah)
                        .keyboardType(.numberPad)
                    Picker("Surah:", selection: $viewModel.form.surah) {
                        // Populate via viewModel.optionsOptions
                        Text("Option 1").tag("1")
                        Text("Option 2").tag("2")
                    }
            } footer: {
                Text("All fields are required unless noted.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Section {
                Button {
                    Task { await viewModel.submit() }
                } label: {
                    HStack {
                        if viewModel.isSubmitting { ProgressView().padding(.trailing, 8) }
                        Text("Read Ayah")
                            .frame(maxWidth: .infinity)
                    }
                }
                .buttonStyle(.borderedProminent)
                .disabled(viewModel.isSubmitting)
            }
        }

    }
}

#Preview {
    NavigationStack { QuranReaderView() }
}
