// PR-75 — Generic URLSession-backed service for "Hadith Browser".
// Default fallback when no native framework matches the feature's
// keyword profile. Real backend wiring lands when PR-29 (iOS backend
// integration) ships; until then this calls a configurable base URL
// with a JSON Decodable response.
import Foundation

public struct HadithBrowserItem: Identifiable, Sendable, Decodable {
    public let id: String
    public let name: String
    public let createdAt: Date
}

public enum HadithBrowserServiceError: Error, Sendable {
    case http(Int)
    case decoding(String)
    case transport(String)
}

@MainActor
public final class HadithBrowserService {
    private let session: URLSession
    private let baseURL: URL

    public init(session: URLSession = .shared, baseURL: URL = URL(string: ProcessInfo.processInfo.environment["API_BASE_URL"] ?? "http://localhost:3000")!) {
        self.session = session
        self.baseURL = baseURL
    }

    public func fetchAll() async throws -> [HadithBrowserItem] {
        let url = baseURL.appendingPathComponent("/api/hadith-browser")
        var req = URLRequest(url: url)
        req.httpMethod = "GET"
        req.addValue("application/json", forHTTPHeaderField: "Accept")
        do {
            let (data, response) = try await session.data(for: req)
            if let http = response as? HTTPURLResponse, http.statusCode >= 400 {
                throw HadithBrowserServiceError.http(http.statusCode)
            }
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            do {
                return try decoder.decode([HadithBrowserItem].self, from: data)
            } catch {
                throw HadithBrowserServiceError.decoding(String(describing: error))
            }
        } catch let e as HadithBrowserServiceError {
            throw e
        } catch {
            throw HadithBrowserServiceError.transport(error.localizedDescription)
        }
    }
}
