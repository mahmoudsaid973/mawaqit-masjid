// ios/MawaqitMasjid/Sources/Models/EventsAndKhutbahTopics.swift
// Core Data / SwiftData model for "Events and Khutbah Topics"
// Implements F002 requirements with full type safety and Swift 6 concurrency compliance.

import Foundation
import SwiftData

/// Represents a Khutbah Topic that can be associated with Events.
@Model
public final class KhutbahTopic {
    @Attribute(.unique) public var id: UUID
    public var title: String
    public var description: String?
    public var arabicTitle: String?
    public var references: String? // Quran/Hadith references
    public var createdAt: Date
    public var updatedAt: Date
    
    @Relationship(deleteRule: .nullify) public var events: [EventItem]?
    
    public init(
        id: UUID = UUID(),
        title: String,
        description: String? = nil,
        arabicTitle: String? = nil,
        references: String? = nil,
        createdAt: Date = Date(),
        updatedAt: String? = nil
    ) {
        self.id = id
        self.title = title
        self.description = description
        self.arabicTitle = arabicTitle
        self.references = references
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

/// Represents a Masjid Event (e.g., Jumu'ah, Eid, Special Lectures).
@Model
public final class EventItem {
    @Attribute(.unique) public var id: UUID
    public var title: String
    public var eventType: String // e.g., "Jumuah", "Eid", "Lecture"
    public var startDate: Date
    public var endDate: Date?
    public var location: String?
    public var isRecurring: Bool
    public var recurringPattern: String? // iCal RRULE format or custom enum string
    public var createdAt: Date
    public var updatedAt: Date
    
    @Relationship(deleteRule: .nullify) public var khutbahTopic: KhutbahTopic?
    
    public init(
        id: UUID = UUID(),
        title: String,
        eventType: String,
        startDate: Date,
        endDate: Date? = nil,
        location: String? = nil,
        isRecurring: Bool = false,
        recurringPattern: String? = nil,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.title = title
        self.eventType = eventType
        self.startDate = startDate
        self.endDate = endDate
        self.location = location
        self.isRecurring = isRecurring
        self.recurringPattern = recurringPattern
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

// MARK: - Legacy Core Data Support (Optional Migration Path)
// If the project still requires NSManagedObject subclasses for iOS 14 compatibility or migration.

#if canImport(CoreData)
import CoreData

@objc(KhutbahTopicCD)
public final class KhutbahTopicCD: NSManagedObject {
    @NSManaged public var id: UUID
    @NSManaged public var title: String
    @NSManaged public var desc: String? // 'description' is reserved
    @NSManaged public var arabicTitle: String?
    @NSManaged public var references: String?
    @NSManaged public var createdAt: Date
    @NSManaged public var updatedAt: Date
    @NSManaged public var events: NSSet?
}

@objc(EventItemCD)
public final class EventItemCD: NSManagedObject {
    @NSManaged public var id: UUID
    @NSManaged public var title: String
    @NSManaged public var eventType: String
    @NSManaged public var startDate: Date
    @NSManaged public var endDate: Date?
    @NSManaged public var location: String?
    @NSManaged public var isRecurring: Bool
    @NSManaged public var recurringPattern: String?
    @NSManaged public var createdAt: Date
    @NSManaged public var updatedAt: Date
    @NSManaged public var khutbahTopic: KhutbahTopicCD?
}

// MARK: - Extensions for Relationship Management

extension KhutbahTopicCD {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<KhutbahTopicCD> {
        return NSFetchRequest<KhutbahTopicCD>(entityName: "KhutbahTopic")
    }

    @nonobjc public func fetchRequest() -> NSFetchRequest<EventItemCD> {
        return NSFetchRequest<EventItemCD>(entityName: "EventItem")
    }
}

#endif
