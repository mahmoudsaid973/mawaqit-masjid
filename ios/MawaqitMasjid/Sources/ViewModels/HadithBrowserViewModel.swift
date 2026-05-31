// PR-75 — Real ViewModel that loads from URLSession-backed service.
import Foundation
import Combine

@MainActor
public final class HadithBrowserViewModel: ObservableObject {
    @Published public private(set) var items: [HadithBrowserItem] = []
    @Published public private(set) var isLoading = false
    @Published public private(set) var errorMessage: String?

    private let service: HadithBrowserService

    public init(service: HadithBrowserService = HadithBrowserService()) {
        self.service = service
    }

    public func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            items = try await service.fetchAll()
        } catch HadithBrowserServiceError.http(let code) {
            errorMessage = "Server returned \(code)."
        } catch HadithBrowserServiceError.decoding(let detail) {
            errorMessage = "Could not parse response: \(detail)"
        } catch HadithBrowserServiceError.transport(let detail) {
            errorMessage = "Network error: \(detail)"
        } catch {
            errorMessage = "Load failed: \(error.localizedDescription)"
        }
    }
}
