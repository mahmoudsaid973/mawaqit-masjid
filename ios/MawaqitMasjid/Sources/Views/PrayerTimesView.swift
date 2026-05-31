//
// PrayerTimesView.swift
// MawaqitMasjid
//

import SwiftUI

/// A view that displays prayer times with loading and error states.
public struct PrayerTimesView: View {
    @ObservedObject private var viewModel: PrayerTimesViewModel
    
    public init(viewModel: PrayerTimesViewModel) {
        self.viewModel = viewModel
    }
    
    public var body: some View {
        NavigationView {
            content
                .navigationTitle("Prayer Times")
                .refreshable {
                    await viewModel.fetchPrayerTimes()
                }
                .task {
                    await viewModel.fetchPrayerTimes()
                }
                .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
                    Button("OK") {
                        viewModel.errorMessage = nil
                    }
                } message: {
                    Text(viewModel.errorMessage ?? "")
                }
        }
    }
    
    @ViewBuilder
    private var content: some View {
        if viewModel.isLoading && viewModel.prayerTimes.isEmpty {
            ProgressView("Loading prayer times...")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else if viewModel.prayerTimes.isEmpty {
            ContentUnavailableView(
                "No Prayer Times",
                systemImage: "clock.badge.questionmark",
                description: Text("Prayer times are not available for this location.")
            )
        } else {
            prayerTimesList
        }
    }
    
    private var prayerTimesList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(viewModel.prayerTimes) { time in
                    PrayerTimeRow(prayerTime: time)
                }
            }
            .padding()
        }
    }
}

/// Individual prayer time row component.
private struct PrayerTimeRow: View {
    let prayerTime: PrayerTime
    
    var body: some View {
        HStack {
            Text(prayerTime.prayerName)
                .font(.title3)
                .fontWeight(.semibold)
            
            Spacer()
            
            Text(prayerTime.time)
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            if prayerTime.isNext {
                Image(systemName: "bell.fill")
                    .foregroundColor(.accentColor)
                    .font(.caption)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(prayerTime.isNext ? Color.accentColor.opacity(0.1) : Color(.secondarySystemBackground))
        )
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(prayerTime.prayerName) at \(prayerTime.time)\(prayerTime.isNext ? ", next prayer" : "")")
    }
}

#Preview {
    NavigationView {
        PrayerTimesView(
            viewModel: PrayerTimesViewModel(
                service: PreviewPrayerTimesService()
            )
        )
    }
}

/// Preview service returning mock data.
private final class PreviewPrayerTimesService: PrayerTimesServiceProtocol {
    func fetchPrayerTimes() async throws -> [PrayerTime] {
        return [
            PrayerTime(id: "fajr", prayerName: "Fajr", time: "05:30 AM", isNext: false),
            PrayerTime(id: "dhuhr", prayerName: "Dhuhr", time: "12:30 PM", isNext: true),
            PrayerTime(id: "asr", prayerName: "Asr", time: "03:45 PM", isNext: false),
            PrayerTime(id: "maghrib", prayerName: "Maghrib", time: "06:15 PM", isNext: false),
            PrayerTime(id: "isha", prayerName: "Isha", time: "07:45 PM", isNext: false)
        ]
    }
}
