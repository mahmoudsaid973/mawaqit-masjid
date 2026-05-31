// ios/MawaqitMasjidTests/AzkarTests.swift
import XCTest
@testable import MawaqitMasjid

final class AzkarTests: XCTestCase {
    func test_viewModel_initial_state_is_empty() async throws {
        let vm = await AzkarViewModel()
        await MainActor.run {
            XCTAssertTrue(vm.items.isEmpty)
            XCTAssertFalse(vm.isLoading)
            XCTAssertNil(vm.errorMessage)
        }
    }

    func test_viewModel_loads_azkar_successfully() async throws {
        let vm = await AzkarViewModel()
        await vm.loadAzkar()
        await MainActor.run {
            XCTAssertFalse(vm.items.isEmpty)
            XCTAssertFalse(vm.isLoading)
            XCTAssertNil(vm.errorMessage)
        }
    }

    func test_viewModel_handles_loading_error() async throws {
        let vm = await AzkarViewModel()
        // Simulate a network error by injecting a mock that fails
        await vm.loadAzkar(simulateError: true)
        await MainActor.run {
            XCTAssertTrue(vm.items.isEmpty)
            XCTAssertFalse(vm.isLoading)
            XCTAssertNotNil(vm.errorMessage)
        }
    }

    func test_viewModel_loads_empty_list_when_no_azkar_found() async throws {
        let vm = await AzkarViewModel()
        await vm.loadAzkar(returnEmpty: true)
        await MainActor.run {
            XCTAssertTrue(vm.items.isEmpty)
            XCTAssertFalse(vm.isLoading)
            XCTAssertNil(vm.errorMessage)
        }
    }
}