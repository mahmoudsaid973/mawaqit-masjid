// PR-75 — Generic URLSession-backed service for "Prayer Times".
// Default fallback when no native framework matches the feature's
// keyword profile. Real backend wiring lands when PR-29 (iOS backend
// integration) ships; until then this calls a configurable base URL
// with a JSON Decodable response.
import Foundation

public struct PrayerTimesItem: Identifiable, Sendable, Decodable {
    public let id: String
    public let name: String
    public let createdAt: Date
}

public enum PrayerTimesServiceError: Error, Sendable {
    case http(Int)
    case decoding(String)
    case transport(String)
}

@MainActor
public final class PrayerTimesService {
    private let session: URLSession
    private let baseURL: URL

    public init(session: URLSession = .shared, baseURL: URL = URL(string: ProcessInfo.processInfo.environment["API_BASE_URL"] ?? "http://localhost:3000")!) {
        self.session = session
        self.baseURL = baseURL
    }

    public func fetchAll() async throws -> [PrayerTimesItem] {
        let url = baseURL.appendingPathComponent("/api/prayer-times")
        var req = URLRequest(url: url)
        req.httpMethod = "GET"
        req.addValue("application/json", forHTTPHeaderField: "Accept")
        do {
            let (data, response) = try await session.data(for: req)
            if let http = response as? HTTPURLResponse, http.statusCode >= 400 {
                throw PrayerTimesServiceError.http(http.statusCode)
            }
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            do {
                return try decoder.decode([PrayerTimesItem].self, from: data)
            } catch {
                throw PrayerTimesServiceError.decoding(String(describing: error))
            }
        } catch let e as PrayerTimesServiceError {
            throw e
        } catch {
            throw PrayerTimesServiceError.transport(error.localizedDescription)
        }
    }
}
