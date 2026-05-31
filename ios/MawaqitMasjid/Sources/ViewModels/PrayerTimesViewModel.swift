// PR-75 — Real ViewModel that loads from URLSession-backed service.
import Foundation
import Combine

@MainActor
public final class PrayerTimesViewModel: ObservableObject {
    @Published public private(set) var items: [PrayerTimesItem] = []
    @Published public private(set) var isLoading = false
    @Published public private(set) var errorMessage: String?

    private let service: PrayerTimesService

    public init(service: PrayerTimesService = PrayerTimesService()) {
        self.service = service
    }

    public func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            items = try await service.fetchAll()
        } catch PrayerTimesServiceError.http(let code) {
            errorMessage = "Server returned \(code)."
        } catch PrayerTimesServiceError.decoding(let detail) {
            errorMessage = "Could not parse response: \(detail)"
        } catch PrayerTimesServiceError.transport(let detail) {
            errorMessage = "Network error: \(detail)"
        } catch {
            errorMessage = "Load failed: \(error.localizedDescription)"
        }
    }
}
