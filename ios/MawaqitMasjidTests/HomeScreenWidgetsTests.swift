// ios/MawaqitMasjidTests/HomeScreenWidgetsTests.swift
// Unit tests for Home Screen Widgets feature (F006)
import XCTest
@testable import MawaqitMasjid

final class HomeScreenWidgetsTests: XCTestCase {
    func test_viewModel_initialState_isEmpty() async throws {
        let viewModel = HomeScreenWidgetsViewModel()
        
        // Then initial state is empty
        await MainActor.run {
            XCTAssertTrue(viewModel.widgets.isEmpty)
            XCTAssertFalse(viewModel.isLoading)
            XCTAssertNil(viewModel.errorMessage)
        }
    }
    
    func test_viewModel_load_success_populatesWidgets() async throws {
        // Given a mock repository that returns sample data
        let mockRepo = MockHomeScreenWidgetsRepository()
        mockRepo.stubbedWidgets = [
            HomeScreenWidget(title: "Fajr", description: "Next prayer at 5:42 AM"),
            HomeScreenWidget(title: "Dhuhr", description: "Next prayer at 1:15 PM")
        ]
        let viewModel = HomeScreenWidgetsViewModel(repository: mockRepo)
        
        // When loading completes
        await viewModel.load()
        
        // Then widgets are populated
        await MainActor.run {
            XCTAssertEqual(viewModel.widgets.count, 2)
            XCTAssertFalse(viewModel.isLoading)
            XCTAssertNil(viewModel.errorMessage)
        }
    }
    
    func test_viewModel_load_error_setsErrorMessage() async throws {
        // Given a mock repository that throws
        let mockRepo = MockHomeScreenWidgetsRepository()
        mockRepo.shouldThrow = true
        let viewModel = HomeScreenWidgetsViewModel(repository: mockRepo)
        
        // When loading fails
        await viewModel.load()
        
        // Then error message is set
        await MainActor.run {
            XCTAssertTrue(viewModel.widgets.isEmpty)
            XCTAssertFalse(viewModel.isLoading)
            XCTAssertNotNil(viewModel.errorMessage)
            XCTAssertEqual(viewModel.errorMessage, "Failed to load widgets")
        }
    }
    
    func test_viewModel_load_emptyResult_showsEmptyState() async throws {
        // Given a mock repository that returns no data
        let mockRepo = MockHomeScreenWidgetsRepository()
        mockRepo.stubbedWidgets = []
        let viewModel = HomeScreenWidgetsViewModel(repository: mockRepo)
        
        // When loading completes with empty result
        await viewModel.load()
        
        // Then empty state is shown
        await MainActor.run {
            XCTAssertTrue(viewModel.widgets.isEmpty)
            XCTAssertFalse(viewModel.isLoading)
            XCTAssertNil(viewModel.errorMessage)
        }
    }
}

// MARK: - Mock Repository

private class MockHomeScreenWidgetsRepository: HomeScreenWidgetsRepository {
    var stubbedWidgets: [HomeScreenWidget] = []
    var shouldThrow = false
    
    func fetchWidgets() async throws -> [HomeScreenWidget] {
        if shouldThrow {
            throw HomeScreenWidgetsError.networkFailure
        }
        return stubbedWidgets
    }
}

private enum HomeScreenWidgetsError: Error {
    case networkFailure
}
