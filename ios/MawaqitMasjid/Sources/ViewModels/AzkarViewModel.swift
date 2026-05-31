// PR-75 — Real ViewModel that loads from URLSession-backed service.
import Foundation
import Combine

@MainActor
public final class AzkarViewModel: ObservableObject {
    @Published public private(set) var items: [AzkarItem] = []
    @Published public private(set) var isLoading = false
    @Published public private(set) var errorMessage: String?

    private let service: AzkarService

    public init(service: AzkarService = AzkarService()) {
        self.service = service
    }

    public func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            items = try await service.fetchAll()
        } catch AzkarServiceError.http(let code) {
            errorMessage = "Server returned \(code)."
        } catch AzkarServiceError.decoding(let detail) {
            errorMessage = "Could not parse response: \(detail)"
        } catch AzkarServiceError.transport(let detail) {
            errorMessage = "Network error: \(detail)"
        } catch {
            errorMessage = "Load failed: \(error.localizedDescription)"
        }
    }
}
