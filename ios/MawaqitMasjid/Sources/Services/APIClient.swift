// PR-29 — URLSession-based API client with async/await + JWT bearer injection.
// Feature Repositories consume this singleton via APIClient.shared.
import Foundation

@MainActor
public final class APIClient: ObservableObject {
    public static let shared = APIClient()
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder
    private init(session: URLSession = .shared) {
        self.session = session
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        self.decoder = decoder
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        self.encoder = encoder
    }

    public func get<T: Decodable>(_ path: String, as type: T.Type = T.self) async throws -> T {
        try await send(method: "GET", path: path, body: Optional<Empty>.none)
    }

    public func post<U: Encodable, T: Decodable>(_ path: String, body: U, as type: T.Type = T.self) async throws -> T {
        try await send(method: "POST", path: path, body: body)
    }

    public func delete(_ path: String) async throws {
        _ = try await send(method: "DELETE", path: path, body: Optional<Empty>.none) as Empty
    }

    private func send<U: Encodable, T: Decodable>(method: String, path: String, body: U?) async throws -> T {
        var request = URLRequest(url: AppConfig.apiBaseURL.appendingPathComponent(path))
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if let token = KeychainStore.shared.read(), !token.isExpired {
            request.setValue("Bearer \(token.accessToken)", forHTTPHeaderField: "Authorization")
        }
        if let body = body { request.httpBody = try encoder.encode(body) }

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw ApiError.transport(error.localizedDescription)
        }
        guard let http = response as? HTTPURLResponse else { throw ApiError.transport("Invalid response") }
        switch http.statusCode {
        case 200...299:
            if T.self == Empty.self { return Empty() as! T }
            do { return try decoder.decode(T.self, from: data) } catch { throw ApiError.decoding(String(describing: error)) }
        case 401, 403: throw ApiError.unauthorized
        case 404: throw ApiError.notFound
        default:
            let msg = String(data: data, encoding: .utf8) ?? "no body"
            throw ApiError.server(http.statusCode, msg)
        }
    }
}

public struct Empty: Codable {}
