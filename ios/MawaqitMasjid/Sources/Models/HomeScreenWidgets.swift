// Auto-generated minimal model for feature "Home Screen Widgets" (F006)
// Extend with Core Data attributes / Codable fields as the feature evolves.
import Foundation

public struct HomeScreenWidgets: Codable, Identifiable, Hashable {
    public let id: UUID
    public var name: String
    public var createdAt: Date

    public init(id: UUID = UUID(), name: String, createdAt: Date = Date()) {
        self.id = id
        self.name = name
        self.createdAt = createdAt
    }
}
