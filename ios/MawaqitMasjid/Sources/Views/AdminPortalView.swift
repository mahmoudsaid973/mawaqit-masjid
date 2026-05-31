// ios/MawaqitMasjid/Sources/Views/AdminPortalView.swift
// Admin Portal View for Mawaqit Masjid iOS App
// Implements F007: Admin dashboard for mosque management

import SwiftUI
import Combine

import Foundation
/// Main Admin Portal view providing access to mosque management features
@MainActor
public struct AdminPortalView: View {
    @StateObject private var viewModel = AdminPortalViewModel()
    
    public init() {}
    
    public var body: some View {
        Group {
            if viewModel.isLoading {
                loadingState
            } else if let error = viewModel.errorMessage {
                errorState(message: error)
            } else if viewModel.dashboardData.isEmpty {
                emptyState
            } else {
                contentState
            }
        }
        .navigationTitle("Admin Portal")
        .task {
            await viewModel.loadDashboardData()
        }
        .refreshable {
            await viewModel.refreshDashboardData()
        }
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    Task {
                        await viewModel.refreshDashboardData()
                    }
                } label: {
                    Image(systemName: "arrow.clockwise")
                        .symbolEffect(.variableColor.iterative, options: .repeating)
                }
                .accessibilityLabel("Refresh Dashboard")
                .disabled(viewModel.isLoading)
            }
        }
    }
    
    // MARK: - View States
    
    @ViewBuilder
    private var loadingState: some View {
        VStack(spacing: 16) {
            ProgressView()
                .controlSize(.large)
                .tint(.primary)
            Text("Loading admin dashboard...")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    @ViewBuilder
    private func errorState(message: String) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 48))
                .foregroundStyle(.orange)
            Text("Unable to Load Dashboard")
                .font(.headline)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button {
                Task {
                    await viewModel.refreshDashboardData()
                }
            } label: {
                Label("Try Again", systemImage: "arrow.clockwise")
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(Color.accentColor)
                    .foregroundStyle(.white)
                    .cornerRadius(12)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    @ViewBuilder
    private var emptyState: some View {
        ContentUnavailableView(
            "No Dashboard Data",
            systemImage: "tray",
            description: Text("Tap refresh to load admin statistics.")
        )
    }
    
    @ViewBuilder
    private var contentState: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Statistics Overview
                statisticsSection
                
                // Quick Actions
                quickActionsSection
                
                // Recent Activities
                recentActivitiesSection
                
                // System Status
                systemStatusSection
            }
            .padding()
        }
    }
    
    // MARK: - Sections
    
    @ViewBuilder
    private var statisticsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Overview")
                .font(.title2)
                .fontWeight(.semibold)
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                ForEach(viewModel.dashboardData.statistics, id: \.id) { stat in
                    StatCardView(stat: stat)
                }
            }
        }
    }
    
    @ViewBuilder
    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Quick Actions")
                .font(.title2)
                .fontWeight(.semibold)
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(viewModel.dashboardData.quickActions, id: \.id) { action in
                    QuickActionButtonView(action: action) {
                        viewModel.handleAction(action)
                    }
                }
            }
        }
    }
    
    @ViewBuilder
    private var recentActivitiesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Recent Activities")
                    .font(.title2)
                    .fontWeight(.semibold)
                Spacer()
                Button("View All") {
                    viewModel.navigateToAllActivities()
                }
                .font(.subheadline)
                .foregroundStyle(.accentColor)
            }
            
            VStack(spacing: 8) {
                ForEach(viewModel.dashboardData.recentActivities.prefix(5), id: \.id) { activity in
                    ActivityRowView(activity: activity)
                }
            }
        }
    }
    
    @ViewBuilder
    private var systemStatusSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("System Status")
                .font(.title2)
                .fontWeight(.semibold)
            
            VStack(spacing: 12) {
                ForEach(viewModel.dashboardData.systemStatus, id: \.id) { status in
                    SystemStatusRowView(status: status)
                }
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
    }
}

// MARK: - Supporting Views

/// Statistic card display
struct StatCardView: View {
    let stat: DashboardStat
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: stat.iconName)
                .font(.title2)
                .foregroundStyle(stat.color)
            
            Text(stat.value)
                .font(.title)
                .fontWeight(.bold)
            
            Text(stat.label)
                .font(.caption)
                .foregroundStyle(.secondary)
            
            if let change = stat.change {
                HStack {
                    Image(systemName: change.isPositive ? "arrow.up" : "arrow.down")
                        .font(.caption)
                    Text("\(change.value)%")
                        .font(.caption)
                }
                .foregroundStyle(change.isPositive ? .green : .red)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

/// Quick action button
struct QuickActionButtonView: View {
    let action: QuickAction
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 8) {
                Image(systemName: action.iconName)
                    .font(.title2)
                    .foregroundStyle(.accentColor)
                Text(action.title)
                    .font(.caption)
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
        }
    }
}

/// Activity row display
struct ActivityRowView: View {
    let activity: RecentActivity
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: activity.iconName)
                .font(.subheadline)
                .foregroundStyle(activity.color)
                .frame(width: 32, height: 32)
                .background(activity.color.opacity(0.1))
                .cornerRadius(8)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(activity.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text(activity.timestamp, style: .relative)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 8)
    }
}

/// System status row display
struct SystemStatusRowView: View {
    let status: SystemStatusItem
    
    var body: some View {
        HStack {
            Circle()
                .fill(status.isOnline ? .green : .red)
                .frame(width: 8, height: 8)
            
            Text(status.name)
                .font(.subheadline)
            
            Spacer()
            
            Text(status.description)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        AdminPortalView()
    }
}
