// ios/MawaqitMasjid/Sources/ViewModels/AdminPortalViewModel.swift
// ViewModel for Admin Portal
// Handles data loading, state management, and user interactions

import SwiftUI
import Combine

import Foundation
/// Dashboard statistic model
public struct DashboardStat: Identifiable {
    public let id: String
    public let label: String
    public let value: String
    public let iconName: String
    public let color: Color
    public let change: StatChange?
    
    public init(
        id: String,
        label: String,
        value: String,
        iconName: String,
        color: Color,
        change: StatChange? = nil
    ) {
        self.id = id
        self.label = label
        self.value = value
        self.iconName = iconName
        self.color = color
        self.change = change
    }
}

/// Stat change indicator
public struct StatChange {
    public let value: Double
    public let isPositive: Bool
    
    public init(value: Double, isPositive: Bool) {
        self.value = value
        self.isPositive = isPositive
    }
}

/// Quick action model
public struct QuickAction: Identifiable {
    public let id: String
    public let title: String
    public let iconName: String
    public let actionType: QuickActionType
    
    public init(id: String, title: String, iconName: String, actionType: QuickActionType) {
        self.id = id
        self.title = title
        self.iconName = iconName
        self.actionType = actionType
    }
}

/// Quick action types
public enum QuickActionType: String {
    case addEvent
    case manageUsers
    case viewReports
    case settings
    case announcements
    case donations
}

/// Recent activity model
public struct RecentActivity: Identifiable {
    public let id: String
    public let title: String
    public let iconName: String
    public let color: Color
    public let timestamp: Date
    
    public init(id: String, title: String, iconName: String, color: Color, timestamp: Date) {
        self.id = id
        self.title = title
        self.iconName = iconName
        self.color = color
        self.timestamp = timestamp
    }
}

/// System status item model
public struct SystemStatusItem: Identifiable {
    public let id: String
    public let name: String
    public let description: String
    public let isOnline: Bool
    
    public init(id: String, name: String, description: String, isOnline: Bool) {
        self.id = id
        self.name = name
        self.description = description
        self.isOnline = isOnline
    }
}

/// Dashboard data container
public struct DashboardData {
    public var statistics: [DashboardStat] = []
    public var quickActions: [QuickAction] = []
    public var recentActivities: [RecentActivity] = []
    public var systemStatus: [SystemStatusItem] = []
    
    public var isEmpty: Bool {
        statistics.isEmpty && quickActions.isEmpty && recentActivities.isEmpty && systemStatus.isEmpty
    }
    
    public init() {}
}

/// Admin Portal ViewModel
@MainActor
public final class AdminPortalViewModel: ObservableObject {
    // MARK: - Published Properties
    
    @Published public private(set) var isLoading: Bool = false
    @Published public private(set) var errorMessage: String?
    @Published public private(set) var dashboardData: DashboardData = DashboardData()
    
    // MARK: - Private Properties
    
    private var cancellables = Set<AnyCancellable>()
    private let dashboardService: DashboardServiceProtocol
    
    // MARK: - Initialization
    
    public init(dashboardService: DashboardServiceProtocol = DashboardService()) {
        self.dashboardService = dashboardService
    }
    
    // MARK: - Public Methods
    
    /// Load dashboard data
    public func loadDashboardData() async {
        await loadData(isRefresh: false)
    }
    
    /// Refresh dashboard data
    public func refreshDashboardData() async {
        await loadData(isRefresh: true)
    }
    
    /// Handle quick action tap
    public func handleAction(_ action: QuickAction) {
        switch action.actionType {
        case .addEvent:
            navigateToAddEvent()
        case .manageUsers:
            navigateToUserManagement()
        case .viewReports:
            navigateToReports()
        case .settings:
            navigateToSettings()
        case .announcements:
            navigateToAnnouncements()
        case .donations:
            navigateToDonations()
        }
    }
    
    /// Navigate to all activities screen
    public func navigateToAllActivities() {
        // Navigation logic will be implemented with coordinator pattern
        print("Navigate to all activities")
    }
    
    // MARK: - Private Methods
    
    private func loadData(isRefresh: Bool) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let data = try await dashboardService.fetchDashboardData()
            dashboardData = data
        } catch {
            errorMessage = "Failed to load dashboard data. Please try again."
            dashboardData = DashboardData()
        }
        
        isLoading = false
    }
    
    // MARK: - Navigation Methods
    
    private func navigateToAddEvent() {
        print("Navigate to Add Event")
    }
    
    private func navigateToUserManagement() {
        print("Navigate to User Management")
    }
    
    private func navigateToReports() {
        print("Navigate to Reports")
    }
    
    private func navigateToSettings() {
        print("Navigate to Settings")
    }
    
    private func navigateToAnnouncements() {
        print("Navigate to Announcements")
    }
    
    private func navigateToDonations() {
        print("Navigate to Donations")
    }
}

// MARK: - Service Protocol

/// Dashboard service protocol
public protocol DashboardServiceProtocol {
    func fetchDashboardData() async throws -> DashboardData
}

// MARK: - Dashboard Service Implementation

/// Dashboard service implementation
public final class DashboardService: DashboardServiceProtocol {
    
    public init() {}
    
    public func fetchDashboardData() async throws -> DashboardData {
        // Simulate network delay
        try await Task.sleep(nanoseconds: 1_000_000_000)
        
        var dashboardData = DashboardData()
        
        // Sample statistics
        dashboardData.statistics = [
            DashboardStat(
                id: "total_users",
                label: "Total Users",
                value: "1,234",
                iconName: "person.3.fill",
                color: .blue,
                change: StatChange(value: 12.5, isPositive: true)
            ),
            DashboardStat(
                id: "active_events",
                label: "Active Events",
                value: "8",
                iconName: "calendar",
                color: .green,
                change: StatChange(value: 5.2, isPositive: true)
            ),
            DashboardStat(
                id: "donations",
                label: "Donations",
                value: "$5,678",
                iconName: "dollarsign.circle.fill",
                color: .orange,
                change: StatChange(value: -2.1, isPositive: false)
            ),
            DashboardStat(
                id: "attendance",
                label: "Avg Attendance",
                value: "89%",
                iconName: "chart.bar.fill",
                color: .purple,
                change: StatChange(value: 3.4, isPositive: true)
            )
        ]
        
        // Sample quick actions
        dashboardData.quickActions = [
            QuickAction(id: "add_event", title: "Add Event", iconName: "plus.circle.fill", actionType: .addEvent),
            QuickAction(id: "manage_users", title: "Manage Users", iconName: "person.2.fill", actionType: .manageUsers),
            QuickAction(id: "view_reports", title: "Reports", iconName: "doc.text.fill", actionType: .viewReports),
            QuickAction(id: "settings", title: "Settings", iconName: "gearshape.fill", actionType: .settings),
            QuickAction(id: "announcements", title: "Announcements", iconName: "megaphone.fill", actionType: .announcements),
            QuickAction(id: "donations", title: "Donations", iconName: "hand.dollars.fill", actionType: .donations)
        ]
        
        // Sample recent activities
        let now = Date()
        dashboardData.recentActivities = [
            RecentActivity(id: "1", title: "New user registered", iconName: "person.badge.plus", color: .blue, timestamp: now.addingTimeInterval(-300)),
            RecentActivity(id: "2", title: "Event created: Friday Prayer", iconName: "calendar.badge.plus", color: .green, timestamp: now.addingTimeInterval(-1800)),
            RecentActivity(id: "3", title: "Donation received", iconName: "dollarsign.circle.fill", color: .orange, timestamp: now.addingTimeInterval(-3600)),
            RecentActivity(id: "4", title: "Settings updated", iconName: "gearshape.fill", color: .gray, timestamp: now.addingTimeInterval(-7200)),
            RecentActivity(id: "5", title: "Announcement posted", iconName: "megaphone.fill", color: .purple, timestamp: now.addingTimeInterval(-14400))
        ]
        
        // Sample system status
        dashboardData.systemStatus = [
            SystemStatusItem(id: "database", name: "Database", description: "Connected", isOnline: true),
            SystemStatusItem(id: "api", name: "API Server", description: "Operational", isOnline: true),
            SystemStatusItem(id: "storage", name: "Cloud Storage", description: "Syncing", isOnline: true),
            SystemStatusItem(id: "notifications", name: "Push Notifications", description: "Active", isOnline: true)
        ]
        
        return dashboardData
    }
}
