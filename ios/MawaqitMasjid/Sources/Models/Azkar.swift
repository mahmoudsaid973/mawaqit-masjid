// swift-tools-version: 5.10
// Auto-generated minimal model for feature "Core Data / SwiftData model for \"Azkar\"" (F005)
// Extend with Core Data attributes / Codable fields as the feature evolves.
import Foundation
import CoreData

@available(iOS 17.0, macOS 14.0, *)
@available(iOS 17.0, *)
public class Azkar: NSManagedObject {
    @NSManaged public var id: UUID
    @NSManaged public var title: String
    @NSManaged public var arabicText: String?
    @NSManaged public var translation: String?
    @NSManaged public var transliteration: String?
    @NSManaged public var reference: String?
    @NSManaged public var category: String?
    @NSManaged public var createdAt: Date
    @NSManaged public var times: Int16
    @NSManaged public var fadak: String
    @NSManaged public var benefits: String
    @NSManaged public var repeatTimes: Int16
    @NSManaged public var lastRead: Date?
    @NSManaged public var isFavorite: Bool
    @NSManaged public var order: Int32
    
    public override func awakeFromInsert() {
        super.awakeFromInsert()
        self.id = UUID()
        self.createdAt = Date()
        self.times = 1
        self.fadak = ""
        self.benefits = ""
        self.repeatTimes = 1
        self.isFavorite = false
        self.order = 0
    }
}
