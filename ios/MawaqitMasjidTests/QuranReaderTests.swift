// ios/MawaqitMasjidTests/QuranReaderTests.swift
import XCTest
@testable import MawaqitMasjid

class QuranReaderTests: XCTestCase {
    func testInitialStateIsEmpty() async throws {
        let viewModel = await QuranReaderViewModel()
        await MainActor.run {
            XCTAssertTrue(viewModel.verses.isEmpty, "Initial verses should be empty")
            XCTAssertFalse(viewModel.isLoading, "Loading state should be false initially")
            XCTAssertNil(viewModel.errorMessage, "Error message should be nil initially")
        }
    }

    func testLoadVersesSuccess() async throws {
        let mockService = MockQuranService()
        mockService.stubbedVerses = [
            QuranVerse(id: "1", surahNumber: 1, verseNumber: 1, text: "Alhamdu lillahi Rabbil Alameen"),
            QuranVerse(id: "2", surahNumber: 1, verseNumber: 2, text: "Ar-Rahmanir Raheem")
        ]
        
        let viewModel = await QuranReaderViewModel(quranService: mockService)
        await viewModel.loadVerses(surahNumber: 1)
        
        await MainActor.run {
            XCTAssertFalse(viewModel.isLoading, "Loading should complete")
            XCTAssertTrue(viewModel.verses.count == 2, "Should load 2 verses")
            XCTAssertNil(viewModel.errorMessage, "No error should occur")
        }
    }

    func testLoadVersesFailure() async throws {
        let mockService = MockQuranService()
        mockService.stubbedError = NSError(domain: "QuranServiceError", code: 1001, userInfo: [NSLocalizedDescriptionKey: "Network unavailable"])
        
        let viewModel = await QuranReaderViewModel(quranService: mockService)
        await viewModel.loadVerses(surahNumber: 777) // Invalid surah
        
        await MainActor.run {
            XCTAssertFalse(viewModel.isLoading, "Loading should complete even on error")
            XCTAssertTrue(viewModel.verses.isEmpty, "Verses should remain empty on error")
            XCTAssertNotNil(viewModel.errorMessage, "Error message should be set")
        }
    }
}

// MARK: - Mocks

actor MockQuranService: QuranServiceProtocol {
    private(set) var stubbedVerses: [QuranVerse] = []
    private(set) var stubbedError: Error? = nil
    
    func fetchVerses(for surah: Int) async throws -> [QuranVerse] {
        if let error = stubbedError {
            throw error
        }
        return stubbedVerses
    }
}

// MARK: - Supporting Types (Normally from shared model)

struct QuranVerse: Equatable, Identifiable {
    let id: String
    let surahNumber: Int
    let verseNumber: Int
    let text: String
}

@MainActor
final class QuranReaderViewModel: ObservableObject {
    @Published private(set) var verses: [QuranVerse] = []
    @Published private(set) var isLoading: Bool = false
    @Published private(set) var errorMessage: String? = nil
    
    private let quranService: any QuranServiceProtocol
    
    init(quranService: any QuranServiceProtocol = QuranAPIService()) async {
        self.quranService = quranService
    }
    
    func loadVerses(surahNumber: Int) async {
        await MainActor.run { self.isLoading = true }
        defer { Task { @MainActor in self.isLoading = false } }
        
        do {
            let results = try await quranService.fetchVerses(for: surahNumber)
            await MainActor.run {
                self.verses = results
                self.errorMessage = nil
            }
        } catch {
            await MainActor.run {
                self.verses = []
                self.errorMessage = error.localizedDescription
            }
        }
    }
}

protocol QuranServiceProtocol {
    func fetchVerses(for surah: Int) async throws -> [QuranVerse]
}

class QuranAPIService: QuranServiceProtocol {
    func fetchVerses(for surah: Int) async throws -> [QuranVerse] {
        // In a real implementation, this would call an API
        throw NSError(domain: "NotImplemented", code: 0, userInfo: nil)
    }
}