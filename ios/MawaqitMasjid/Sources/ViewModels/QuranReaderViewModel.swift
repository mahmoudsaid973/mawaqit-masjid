// PR-75 — Real ViewModel that loads from URLSession-backed service.
import Foundation
import Combine

@MainActor
public final class QuranReaderViewModel: ObservableObject {
    @Published public private(set) var items: [QuranReaderItem] = []
    @Published public private(set) var isLoading = false
    @Published public private(set) var errorMessage: String?

    private let service: QuranReaderService

    public init(service: QuranReaderService = QuranReaderService()) {
        self.service = service
    }

    public func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            items = try await service.fetchAll()
        } catch QuranReaderServiceError.http(let code) {
            errorMessage = "Server returned \(code)."
        } catch QuranReaderServiceError.decoding(let detail) {
            errorMessage = "Could not parse response: \(detail)"
        } catch QuranReaderServiceError.transport(let detail) {
            errorMessage = "Network error: \(detail)"
        } catch {
            errorMessage = "Load failed: \(error.localizedDescription)"
        }
    }
}
