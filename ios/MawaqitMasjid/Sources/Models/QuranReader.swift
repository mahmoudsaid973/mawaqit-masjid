// ios/MawaqitMasjid/Sources/Models/QuranReader.swift
// Core Data / SwiftData model for "Quran Reader" feature
// Supports both legacy Core Data (NSManagedObject) and modern SwiftData (ObservableObject)

import Foundation
import CoreData

#if canImport(SwiftData)
import SwiftData
#endif

// MARK: - SwiftData Model (iOS 17+)

#if canImport(SwiftData)
/// The canonical SwiftData model for a Quran reading session or bookmark.
@Model
public final class QuranReaderEntry {
    public var id: UUID
    public var surahNumber: Int
    public var ayahNumber: Int
    public var bookmarkDate: Date
    public var notes: String?
    public var isCompleted: Bool
    
    public init(
        id: UUID = UUID(),
        surahNumber: Int,
        ayahNumber: Int,
        bookmarkDate: Date = Date(),
        notes: String? = nil,
        isCompleted: Bool = false
    ) {
        self.id = id
        self.surahNumber = surahNumber
        self.ayahNumber = ayahNumber
        self.bookmarkDate = bookmarkDate
        self.notes = notes
        self.isCompleted = isCompleted
    }
}
#endif

// MARK: - Core Data Model (Legacy & iOS 15/16)

/// Core Data entity class for Quran Reader entries.
/// Usage: Fetch via NSFetchRequest<QuranReaderCD>, insert into NSManagedObjectContext.
public final class QuranReaderCD: NSManagedObject, Identifiable {
    @NSManaged public var id: UUID
    @NSManaged public var surahNumber: Int16
    @NSManaged public var ayahNumber: Int16
    @NSManaged public var bookmarkDate: Date
    @NSManaged public var notes: String?
    @NSManaged public var isCompleted: Bool
    
    /// Convenience initializer for creating new entries in a context.
    public static func create(
        in context: NSManagedObjectContext,
        surahNumber: Int,
        ayahNumber: Int,
        notes: String? = nil,
        isCompleted: Bool = false
    ) -> QuranReaderCD {
        let entity = NSEntityDescription.entity(forEntityName: "QuranReaderCD", in: context)!
        let obj = QuranReaderCD(entity: entity, insertInto: context)
        obj.id = UUID()
        obj.surahNumber = Int16(surahNumber)
        obj.ayahNumber = Int16(ayahNumber)
        obj.bookmarkDate = Date()
        obj.notes = notes
        obj.isCompleted = isCompleted
        return obj
    }
    
    /// Maps the Core Data object to a domain-friendly struct.
    public func toDomain() -> QuranReaderDomain {
        QuranReaderDomain(
            id: self.id,
            surahNumber: Int(self.surahNumber),
            ayahNumber: Int(self.ayahNumber),
            bookmarkDate: self.bookmarkDate,
            notes: self.notes,
            isCompleted: self.isCompleted
        )
    }
}

// MARK: - Domain Model (Pure Swift Struct)

/// Immutable domain model used for UI state and business logic, decoupled from persistence.
public struct QuranReaderDomain: Identifiable, Codable, Hashable, Sendable {
    public let id: UUID
    public let surahNumber: Int
    public let ayahNumber: Int
    public let bookmarkDate: Date
    public let notes: String?
    public let isCompleted: Bool
    
    public init(
        id: UUID = UUID(),
        surahNumber: Int,
        ayahNumber: Int,
        bookmarkDate: Date = Date(),
        notes: String? = nil,
        isCompleted: Bool = false
    ) {
        self.id = id
        self.surahNumber = surahNumber
        self.ayahNumber = ayahNumber
        self.bookmarkDate = bookmarkDate
        self.notes = notes
        self.isCompleted = isCompleted
    }
    
    /// Creates a copy with modified fields (copy-on-write pattern).
    public func copy(
        surahNumber: Int? = nil,
        ayahNumber: Int? = nil,
        notes: String? = nil,
        isCompleted: Bool? = nil
    ) -> QuranReaderDomain {
        QuranReaderDomain(
            id: self.id,
            surahNumber: surahNumber ?? self.surahNumber,
            ayahNumber: ayahNumber ?? self.ayahNumber,
            bookmarkDate: self.bookmarkDate,
            notes: notes ?? self.notes,
            isCompleted: isCompleted ?? self.isCompleted
        )
    }
}

// MARK: - Core Data Stack Helper

/// Helper to bootstrap the Core Data stack for Quran Reader.
public final class QuranReaderStore {
    public let container: NSPersistentContainer
    
    public init(inMemory: Bool = false) {
        container = NSPersistentContainer(name: "QuranReaderModel")
        
        if inMemory {
            container.persistentStoreDescriptions.first?.url = URL(fileURLWithPath: "/dev/null")
        }
        
        container.loadPersistentStores { _, error in
            if let error = error {
                fatalError("Core Data failed to load stores: \(error.localizedDescription)")
            }
        }
        container.viewContext.automaticallyMergesChangesFromParent = true
    }
    
    /// Returns a fetch request configured for QuranReaderCD.
    public static func fetchRequest() -> NSFetchRequest<QuranReaderCD> {
        NSFetchRequest<QuranReaderCD>(entityName: "QuranReaderCD")
    }
}
