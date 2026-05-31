"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, ClockIcon, MapPinIcon, RefreshCwIcon, AlertCircleIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

interface PrayerTime {
  name: string;
  time: string;
  isNext: boolean;
}

interface LocationData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface PrayerTimesData {
  date: string;
  location: LocationData;
  prayers: PrayerTime[];
  nextPrayer: string;
  timeToNext: string;
}

const DEFAULT_LOCATION: LocationData = {
  city: "Mecca",
  country: "Saudi Arabia",
  latitude: 21.3891,
  longitude: 39.8579,
};

export default function PrayerTimesPage() {
  const [location, setLocation] = useState<LocationData>(DEFAULT_LOCATION);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchPrayerTimes = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulating API call - in production this would hit your backend
      // const response = await fetch(`/api/prayer-times?city=${location.city}&date=${selectedDate}`);
      // const data = await response.json();
      
      // Mock data for demonstration
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const mockData: PrayerTimesData = {
        date: selectedDate,
        location: location,
        prayers: [
          { name: "Fajr", time: "05:23", isNext: false },
          { name: "Dhuhr", time: "12:15", isNext: false },
          { name: "Asr", time: "15:45", isNext: true },
          { name: "Maghrib", time: "18:32", isNext: false },
          { name: "Isha", time: "20:01", isNext: false },
        ],
        nextPrayer: "Asr",
        timeToNext: "02:15:30",
      };
      
      setPrayerData(mockData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch prayer times";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
    
    if (autoRefresh) {
      const interval = setInterval(fetchPrayerTimes, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [location, selectedDate, autoRefresh]);

  const handleLocationChange = (field: keyof LocationData, value: string | number) => {
    setLocation((prev) => ({ ...prev, [field]: value }));
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            city: "Current Location",
            country: "Detected",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (geoError) => {
          setError(`Geolocation error: ${geoError.message}`);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <ClockIcon className="h-8 w-8 text-primary" />
          Prayer Times
        </h1>
        <p className="text-muted-foreground">
          View accurate prayer times for your location
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5" />
              Location Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={location.city}
                onChange={(e) => handleLocationChange("city", e.target.value)}
                placeholder="Enter city name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={location.country}
                onChange={(e) => handleLocationChange("country", e.target.value)}
                placeholder="Enter country"
              />
            </div>
            <Button onClick={handleGetLocation} variant="outline" className="w-full">
              <MapPinIcon className="h-4 w-4 mr-2" />
              Use Current Location
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Date Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Select Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="autoRefresh">Auto Refresh</Label>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <Button onClick={fetchPrayerTimes} className="w-full" disabled={loading}>
              {loading ? (
                <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCwIcon className="h-4 w-4 mr-2" />
              )}
              {loading ? "Loading..." : "Refresh Times"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {prayerData && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Next Prayer</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {prayerData.timeToNext} remaining
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-primary mb-2">
                  {prayerData.nextPrayer}
                </p>
                <p className="text-muted-foreground">
                  {format(parseISO(prayerData.date), "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {prayerData.location.city}, {prayerData.location.country}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Prayer Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prayerData.prayers.map((prayer) => (
                  <div
                    key={prayer.name}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      prayer.isNext
                        ? "bg-primary/10 border-primary"
                        : "bg-card border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          prayer.isNext ? "bg-primary animate-pulse" : "bg-muted"
                        }`}
                      />
                      <span className="font-medium">{prayer.name}</span>
                    </div>
                    <span className="text-lg font-semibold">{prayer.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!prayerData && !loading && !error && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <ClockIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No prayer times loaded. Click refresh to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
