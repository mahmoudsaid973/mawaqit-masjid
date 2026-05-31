//
// HadithBrowser.swift
// MawaqitMasjid
//
// SwiftData Model for Hadith Browser feature
//

import Foundation
import SwiftData

@Model
final class Hadith {
    var hadithId: String
    var source: String
    var text: String
    var narrator: String
    var book: String
    var bookRef: String
    var hadithNo: String
    var chapter: String
    var volume: String
    var chapterNo: String
    var bookNo: String
    var kitab: String
    var inBook: String
    var on: String

    init(
        hadithId: String = "",
        source: String = "",
        text: String = "",
        narrator: String = "",
        book: String = "",
        bookRef: String = "",
        hadithNo: String = "",
        chapter: String = "",
        volume: String = "",
        chapterNo: String = "",
        bookNo: String = "",
        kitab: String = "",
        inBook: String = "",
        on: String = ""
    ) {
        self.hadithId = hadithId
        self.source = source
        self.text = text
        self.narrator = narrator
        self.book = book
        self.bookRef = bookRef
        self.hadithNo = hadithNo
        self.chapter = chapter
        self.volume = volume
        self.chapterNo = chapterNo
        self.bookNo = bookNo
        self.kitab = kitab
        self.inBook = inBook
        self.on = on
    }
}
