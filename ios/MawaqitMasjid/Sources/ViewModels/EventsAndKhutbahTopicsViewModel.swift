// PR-75 — Real ViewModel that loads from URLSession-backed service.
import Foundation
import Combine

@MainActor
public final class EventsAndKhutbahTopicsViewModel: ObservableObject {
    @Published public private(set) var items: [EventsAndKhutbahTopicsItem] = []
    @Published public private(set) var isLoading = false
    @Published public private(set) var errorMessage: String?

    private let service: EventsAndKhutbahTopicsService

    public init(service: EventsAndKhutbahTopicsService = EventsAndKhutbahTopicsService()) {
        self.service = service
    }

    public func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            items = try await service.fetchAll()
        } catch EventsAndKhutbahTopicsServiceError.http(let code) {
            errorMessage = "Server returned \(code)."
        } catch EventsAndKhutbahTopicsServiceError.decoding(let detail) {
            errorMessage = "Could not parse response: \(detail)"
        } catch EventsAndKhutbahTopicsServiceError.transport(let detail) {
            errorMessage = "Network error: \(detail)"
        } catch {
            errorMessage = "Load failed: \(error.localizedDescription)"
        }
    }
}
