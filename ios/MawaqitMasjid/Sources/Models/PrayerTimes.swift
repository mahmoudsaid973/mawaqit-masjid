// ios/MawaqitMasjid/Sources/Models/PrayerTimes.swift
// Core Data / SwiftData model for "Prayer Times" (F001)
// Implements prayer time storage with SwiftData macros for iOS 17+

import Foundation
import SwiftData

/// Represents the five daily prayers plus optional extra prayers.
@Model
public final class PrayerTimes {
    /// Unique identifier for the prayer time entry.
    @Attribute(.unique) public var id: UUID
    
    /// The name of the prayer (e.g., "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha").
    public var name: String
    
    /// The scheduled time for this prayer on a specific date.
    /// Note: This Date object contains both the date and the specific time.
    public var timestamp: Date
    
    /// The mosque or location ID this prayer time belongs to.
    public var mosqueId: String?
    
    /// Whether this prayer time has been completed/confirmed.
    public var isCompleted: Bool
    
    /// Timestamp when this record was created.
    public var createdAt: Date
    
    /// Timestamp when this record was last updated.
    public var updatedAt: Date

    /// Initialize a new PrayerTimes model.
    /// - Parameters:
    ///   - id: Unique identifier (defaults to new UUID).
    ///   - name: Name of the prayer.
    ///   - timestamp: Scheduled date and time for the prayer.
    ///   - mosqueId: Optional mosque/location identifier.
    ///   - isCompleted: Completion status (defaults to false).
    ///   - createdAt: Creation timestamp (defaults to now).
    ///   - updatedAt: Last update timestamp (defaults to now).
    public init(
        id: UUID = UUID(),
        name: String,
        timestamp: Date,
        mosqueId: String? = nil,
        isCompleted: Bool = false,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.timestamp = timestamp
        self.mosqueId = mosqueId
        self.isCompleted = isCompleted
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
    
    /// Computed property to access just the date component if needed for grouping.
    public var date: Date {
        Calendar.current.startOfDay(for: timestamp)
    }
    
    /// Computed property to access just the time component if needed.
    public var time: Date {
        // Returns a date object representing the time on Jan 1, 2001 (reference date) or similar
        // Useful for time-only comparisons
        let components = Calendar.current.dateComponents([.hour, .minute], from: timestamp)
        return Calendar.current.date(from: components) ?? timestamp
    }
}

// MARK: - Prayer Name Constants

public extension PrayerTimes {
    /// Standard names for the five daily prayers.
    struct PrayerNames {
        public static let fajr = "Fajr"
        public static let sunrise = "Sunrise"
        public static let dhuhr = "Dhuhr"
        public static let asr = "Asr"
        public static let maghrib = "Maghrib"
        public static let isha = "Isha"
        public static let tahajjud = "Tahajjud"
        public static let duha = "Duha"
    }
    
    /// Order of prayers for sorting purposes.
    static let prayerOrder: [String] = [
        PrayerNames.fajr,
        PrayerNames.sunrise,
        PrayerNames.dhuhr,
        PrayerNames.asr,
        PrayerNames.maghrib,
        PrayerNames.isha,
        PrayerNames.tahajjud,
        PrayerNames.duha
    ]
}

// MARK: - Comparable Conformance

extension PrayerTimes: Comparable {
    /// Compare two PrayerTimes instances by their scheduled time.
    public static func < (lhs: PrayerTimes, rhs: PrayerTimes) -> Bool {
        lhs.timestamp < rhs.timestamp
    }
    
    public static func == (lhs: PrayerTimes, rhs: PrayerTimes) -> Bool {
        lhs.id == rhs.id
    }
}