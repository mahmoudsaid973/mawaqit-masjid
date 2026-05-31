// ios/MawaqitMasjidTests/EventsAndKhutbahTopicsTests.swift
// XCTest unit tests for "Events and Khutbah Topics" feature (F002)
// Covers: Happy path, Error handling, Boundary cases

import XCTest
import Foundation
@testable import MawaqitMasjid

@MainActor
final class EventsAndKhutbahTopicsTests: XCTestCase {

    private var viewModel: EventsAndKhutbahTopicsViewModel!
    private var mockService: MockEventsAndKhutbahService!

    override func setUp() async throws {
        try await super.setUp()
        mockService = MockEventsAndKhutbahService()
        viewModel = EventsAndKhutbahTopicsViewModel(service: mockService)
    }

    override func tearDown() async throws {
        viewModel = nil
        mockService = nil
        try await super.tearDown()
    }

    // MARK: - Initial State

    func test_initialState_isEmptyAndNotLoading() async {
        // Arrange
        let vm = EventsAndKhutbahTopicsViewModel(service: MockEventsAndKhutbahService())

        // Assert
        XCTAssertTrue(vm.events.isEmpty, "Initial events list should be empty")
        XCTAssertTrue(vm.khutbahTopics.isEmpty, "Initial khutbah topics list should be empty")
        XCTAssertFalse(vm.isLoading, "Initial loading state should be false")
        XCTAssertNil(vm.errorMessage, "Initial error message should be nil")
    }

    // MARK: - Happy Path: Fetch Data

    func test_fetchData_success_populatesLists() async throws {
        // Arrange
        let expectedEvents = [
            EventItem(id: "1", title: "Ramadan Kickoff", date: Date(), location: "Main Hall"),
            EventItem(id: "2", title: "Community Iftar", date: Date(), location: "Courtyard")
        ]
        let expectedTopics = [
            KhutbahTopic(id: "101", title: "Patience in Hardship", summary: "Discussion on Sabr"),
            KhutbahTopic(id: "102", title: "Charity", summary: "Importance of Sadaqah")
        ]
        mockService.stubbedEvents = expectedEvents
        mockService.stubbedTopics = expectedTopics
        mockService.shouldThrowError = false

        // Act
        try await viewModel.fetchData()

        // Assert
        XCTAssertEqual(viewModel.events.count, 2, "Should load exactly 2 events")
        XCTAssertEqual(viewModel.khutbahTopics.count, 2, "Should load exactly 2 topics")
        XCTAssertFalse(viewModel.isLoading, "Loading should finish")
        XCTAssertNil(viewModel.errorMessage, "No error should be present")
        
        XCTAssertEqual(viewModel.events.first?.title, "Ramadan Kickoff")
        XCTAssertEqual(viewModel.khutbahTopics.first?.title, "Patience in Hardship")
    }

    // MARK: - Error Path: Network Failure

    func test_fetchData_failure_setsErrorMessage() async {
        // Arrange
        mockService.shouldThrowError = true
        mockService.errorToThrow = NSError(domain: "NetworkError", code: -1009, userInfo: [NSLocalizedDescriptionKey: "No internet connection"])

        // Act
        do {
            try await viewModel.fetchData()
            XCTFail("Expected fetchData to throw an error")
        } catch {
            // Assert side effects on ViewModel
            XCTAssertTrue(viewModel.events.isEmpty, "Events should remain empty on failure")
            XCTAssertTrue(viewModel.khutbahTopics.isEmpty, "Topics should remain empty on failure")
            XCTAssertFalse(viewModel.isLoading, "Loading state should reset after failure")
            XCTAssertNotNil(viewModel.errorMessage, "Error message should be populated")
            XCTAssertTrue(viewModel.errorMessage?.contains("No internet") ?? false, "Error message should reflect the cause")
        }
    }

    // MARK: - Boundary Case: Empty Server Response

    func test_fetchData_emptyResponse_handlesGracefully() async throws {
        // Arrange
        mockService.stubbedEvents = []
        mockService.stubbedTopics = []
        mockService.shouldThrowError = false

        // Act
        try await viewModel.fetchData()

        // Assert
        XCTAssertEqual(viewModel.events.count, 0, "Should handle empty events list")
        XCTAssertEqual(viewModel.khutbahTopics.count, 0, "Should handle empty topics list")
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.errorMessage)
    }

    // MARK: - Boundary Case: Special Characters in Data

    func test_fetchData_specialCharacters_preservesEncoding() async throws {
        // Arrange
        let specialEvent = EventItem(
            id: "3",
            title: "Eid al-Fitr: Celebration & Prayer (1445 AH)",
            date: Date(),
            location: "Mosque & Online (Zoom ID: 123-456)"
        )
        let specialTopic = KhutbahTopic(
            id: "202",
            title: "The Concept of 'Tawakkul' (Reliance on Allah)",
            summary: "Understanding the balance between effort and trust in Allah's plan."
        )
        
        mockService.stubbedEvents = [specialEvent]
        mockService.stubbedTopics = [specialTopic]
        mockService.shouldThrowError = false

        // Act
        try await viewModel.fetchData()

        // Assert
        XCTAssertEqual(viewModel.events.first?.title, specialEvent.title)
        XCTAssertEqual(viewModel.events.first?.location, specialEvent.location)
        XCTAssertEqual(viewModel.khutbahTopics.first?.title, specialTopic.title)
        XCTAssertEqual(viewModel.khutbahTopics.first?.summary, specialTopic.summary)
    }

    // MARK: - Helper Mock Service

    private final class MockEventsAndKhutbahService: EventsAndKhutbahServiceProtocol {
        var stubbedEvents: [EventItem] = []
        var stubbedTopics: [KhutbahTopic] = []
        var shouldThrowError: Bool = false
        var errorToThrow: Error?

        func fetchEvents() async throws -> [EventItem] {
            if shouldThrowError {
                throw errorToThrow ?? URLError(.notConnectedToInternet)
            }
            return stubbedEvents
        }

        func fetchKhutbahTopics() async throws -> [KhutbahTopic] {
            if shouldThrowError {
                throw errorToThrow ?? URLError(.notConnectedToInternet)
            }
            return stubbedTopics
        }
    }
}
