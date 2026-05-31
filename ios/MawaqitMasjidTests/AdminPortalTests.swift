// ios/MawaqitMasjidTests/AdminPortalTests.swift
import XCTest
@testable import MawaqitMasjid
import Combine

@MainActor
final class AdminPortalTests: XCTestCase {
    
    var viewModel: AdminPortalViewModel!
    var mockService: MockDashboardService!
    var cancellables: Set<AnyCancellable>!
    
    override func setUp() async throws {
        try await super.setUp()
        mockService = MockDashboardService()
        viewModel = AdminPortalViewModel(dashboardService: mockService)
        cancellables = Set<AnyCancellable>()
    }
    
    override func tearDown() async throws {
        viewModel = nil
        mockService = nil
        cancellables = nil
        try await super.tearDown()
    }
    
    func test_initialState_isCorrect() {
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.errorMessage)
        XCTAssertTrue(viewModel.dashboardData.isEmpty)
    }
    
    func test_loadDashboardData_success_populatesData() async throws {
        mockService.shouldThrowError = false
        
        await viewModel.loadDashboardData()
        
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.errorMessage)
        XCTAssertFalse(viewModel.dashboardData.isEmpty)
    }
    
    func test_loadDashboardData_failure_setsErrorMessage() async throws {
        // Given
        mockService.shouldThrowError = true
        let expectedError = "Network failure"
        mockService.errorMessage = expectedError
        
        // When
        await viewModel.loadDashboardData()
        
        // Then
        XCTAssertFalse(viewModel.isLoading, "Loading should stop on error")
        XCTAssertEqual(viewModel.errorMessage, expectedError, "Error message should be set")
        XCTAssertTrue(viewModel.dashboardData.isEmpty, "Data should remain empty on failure")
    }
}

class MockDashboardService: DashboardServiceProtocol {
    var shouldThrowError: Bool = false
    var errorMessage: String = "Unknown error"
    var overrideStatsCount: Int? = nil
    
    func fetchDashboardData() async throws -> DashboardData {
        if shouldThrowError {
            throw DashboardError.networkFailed(errorMessage)
        }
        
        var stats = [DashboardStat]()
        let count = overrideStatsCount ?? 4
        for i in 0..<count {
            stats.append(DashboardStat(id: "\(i)", label: "Stat \(i)", value: "\(i)", iconName: "star", color: .blue))
        }
        
        return DashboardData(
            statistics: stats,
            quickActions: [],
            recentActivities: [],
            systemStatus: []
        )
    }
}
