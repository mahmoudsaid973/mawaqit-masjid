// Auto-generated minimal XCTest for "Hadith Browser" (F004)
import XCTest
@testable import MawaqitMasjid

final class HadithBrowserTests: XCTestCase {
    func test_viewModel_initial_state_is_empty() async throws {
        let vm = await HadithBrowserViewModel()
        await MainActor.run {
            XCTAssertTrue(vm.items.isEmpty)
            XCTAssertFalse(vm.isLoading)
            XCTAssertNil(vm.errorMessage)
        }
    }
}
