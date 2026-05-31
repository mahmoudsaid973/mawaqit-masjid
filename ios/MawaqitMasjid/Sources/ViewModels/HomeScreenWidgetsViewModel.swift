// PR-75 — Real ViewModel that loads from URLSession-backed service.
import Foundation
import Combine

@MainActor
public final class HomeScreenWidgetsViewModel: ObservableObject {
    @Published public private(set) var items: [HomeScreenWidgetsItem] = []
    @Published public private(set) var isLoading = false
    @Published public private(set) var errorMessage: String?

    private let service: HomeScreenWidgetsService

    public init(service: HomeScreenWidgetsService = HomeScreenWidgetsService()) {
        self.service = service
    }

    public func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            items = try await service.fetchAll()
        } catch HomeScreenWidgetsServiceError.http(let code) {
            errorMessage = "Server returned \(code)."
        } catch HomeScreenWidgetsServiceError.decoding(let detail) {
            errorMessage = "Could not parse response: \(detail)"
        } catch HomeScreenWidgetsServiceError.transport(let detail) {
            errorMessage = "Network error: \(detail)"
        } catch {
            errorMessage = "Load failed: \(error.localizedDescription)"
        }
    }
}
