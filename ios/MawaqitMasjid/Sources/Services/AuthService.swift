// PR-29 — Sign in with Apple via AuthenticationServices.
// On success, stores the token via KeychainStore; APIClient picks it up
// automatically for subsequent requests.
import AuthenticationServices
import Foundation

@MainActor
public final class AuthService: NSObject, ObservableObject {
    public static let shared = AuthService()

    @Published public private(set) var isAuthenticated: Bool = false
    @Published public private(set) var userId: String?
    @Published public private(set) var lastError: String?

    // PR-47 — ASAuthorizationController holds its delegate / contextProvider
    // as weak references. If we kept them as locals in signInWithApple,
    // they could deallocate before the authorization callbacks fired,
    // causing waitForCredential() to hang. Storing them on the instance
    // keeps them alive for the duration of the request and clearing them
    // after the continuation resumes avoids leaks.
    private var pendingDelegate: AuthDelegate?
    private var pendingPresentationProxy: PresentationProxy?

    private override init() {
        super.init()
        if let token = KeychainStore.shared.read(), !token.isExpired {
            self.isAuthenticated = true
        }
    }

    public func signInWithApple(presentationAnchor: ASPresentationAnchor) async throws {
        // Wave D #745 — race-condition fix. The earlier shape did not
        // reset pendingDelegate/pendingPresentationProxy at the START of
        // a new call. If signInWithApple was invoked twice in quick
        // succession (button mash, deeplink re-entry, SwiftUI re-render)
        // the second call's continuation overwrote the first's, leaking
        // it (never resumed) and orphaning the first's controller.
        self.pendingDelegate = nil
        self.pendingPresentationProxy = nil
        let provider = ASAuthorizationAppleIDProvider()
        let request = provider.createRequest()
        request.requestedScopes = [.fullName, .email]
        let controller = ASAuthorizationController(authorizationRequests: [request])
        let delegate = AuthDelegate()
        let proxy = PresentationProxy(anchor: presentationAnchor)
        self.pendingDelegate = delegate
        self.pendingPresentationProxy = proxy
        controller.delegate = delegate
        controller.presentationContextProvider = proxy
        controller.performRequests()
        defer {
            self.pendingDelegate = nil
            self.pendingPresentationProxy = nil
        }
        let credential = try await delegate.waitForCredential()

        guard let identityTokenData = credential.identityToken,
              let identityToken = String(data: identityTokenData, encoding: .utf8) else {
            throw ApiError.transport("Missing Apple identity token")
        }

        // Exchange Apple credential for backend JWT via AppConfig.authEndpoint.
        let body = AppleSignInRequest(identityToken: identityToken, user: credential.user)
        let tokenResponse: BackendTokenResponse = try await APIClient.shared.post("auth/apple", body: body)
        let token = AuthToken(
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken,
            expiresAt: Date().addingTimeInterval(TimeInterval(tokenResponse.expiresInSeconds))
        )
        try KeychainStore.shared.write(token)
        self.userId = credential.user
        self.isAuthenticated = true
    }

    public func signOut() {
        KeychainStore.shared.delete()
        userId = nil
        isAuthenticated = false
    }
}

private struct AppleSignInRequest: Codable { let identityToken: String; let user: String }
private struct BackendTokenResponse: Codable { let accessToken: String; let refreshToken: String?; let expiresInSeconds: Int }

private final class AuthDelegate: NSObject, ASAuthorizationControllerDelegate {
    private var continuation: CheckedContinuation<ASAuthorizationAppleIDCredential, Error>?

    func waitForCredential() async throws -> ASAuthorizationAppleIDCredential {
        try await withCheckedThrowingContinuation { continuation = $0 }
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        guard let c = authorization.credential as? ASAuthorizationAppleIDCredential else {
            continuation?.resume(throwing: ApiError.transport("Unexpected credential type"))
            return
        }
        continuation?.resume(returning: c)
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        continuation?.resume(throwing: error)
    }
}

private final class PresentationProxy: NSObject, ASAuthorizationControllerPresentationContextProviding {
    let anchor: ASPresentationAnchor
    init(anchor: ASPresentationAnchor) { self.anchor = anchor }
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor { anchor }
}
