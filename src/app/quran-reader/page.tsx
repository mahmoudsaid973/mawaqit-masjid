import { logger } from "@/lib/logger";
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  verses: number;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export default function QuranReaderPage() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setSurahLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(18);

  // Fetch surahs on component mount
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setSurahLoading(true);
        // In a real implementation, this would be an API call
        // const response = await fetch('/api/quran/surahs');
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockSurahs: Surah[] = [
          {
            number: 1,
            name: 'الفاتحة',
            englishName: 'Al-Fatihah',
            englishNameTranslation: 'The Opening',
            revelationType: 'Meccan',
            verses: 7
          },
          {
            number: 2,
            name: 'البقرة',
            englishName: 'Al-Baqarah',
            englishNameTranslation: 'The Cow',
            revelationType: 'Medinan',
            verses: 286
          },
          {
            number: 3,
            name: 'آل عمران',
            englishName: 'Ali \'Imran',
            englishNameTranslation: 'Family of Imran',
            revelationType: 'Medinan',
            verses: 200
          }
        ];
        
        setSurahs(mockSurahs);
      } catch (err) {
        setError('Failed to load surahs');
        logger.error(err);
      } finally {
        setSurahLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  // Fetch ayahs when a surah is selected
  useEffect(() => {
    if (!selectedSurah) return;

    const fetchAyahs = async () => {
      try {
        setSurahLoading(true);
        // In a real implementation, this would be an API call
        // const response = await fetch(`/api/quran/surahs/${selectedSurah.number}/ayahs`);
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockAyahs: Ayah[] = Array.from({ length: selectedSurah.verses }, (_, i) => ({
          number: (selectedSurah.number - 1) * 100 + i + 1,
          text: `آية ${i + 1} من سورة ${selectedSurah.englishName}`,
          numberInSurah: i + 1,
          juz: Math.floor(i / 10) + 1,
          manzil: Math.floor(i / 50) + 1,
          page: Math.floor(i / 20) + 1,
          ruku: Math.floor(i / 5) + 1,
          hizbQuarter: Math.floor(i / 2) + 1,
          sajda: i === 15 && selectedSurah.number === 7 // Sajda in Surah Al-A'raf
        }));
        
        setAyahs(mockAyahs);
      } catch (err) {
        setError('Failed to load ayahs');
        logger.error(err);
      } finally {
        setSurahLoading(false);
      }
    };

    fetchAyahs();
  }, [selectedSurah]);

  const handleSurahSelect = (value: string) => {
    const surah = surahs.find(s => s.number.toString() === value);
    if (surah) {
      setSelectedSurah(surah);
    }
  };

  const filteredSurahs = surahs.filter(surah =>
    surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.name.includes(searchTerm)
  );

  return (
    <div className="container py-8 mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Quran Reader</h1>
        <p className="text-muted-foreground">
          Read and navigate through the chapters of the Quran
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Surah Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Surahs</Label>
                <Input
                  id="search"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Font Size</Label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                  >
                    A-
                  </Button>
                  <span className="text-sm">{fontSize}px</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
                  >
                    A+
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="surah-select">Select Surah</Label>
                <Select onValueChange={handleSurahSelect}>
                  <SelectTrigger id="surah-select">
                    <SelectValue placeholder="Select a surah" />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : filteredSurahs.length === 0 ? (
                      <SelectItem value="no-results" disabled>
                        No surahs found
                      </SelectItem>
                    ) : (
                      filteredSurahs.map((surah) => (
                        <SelectItem key={surah.number} value={surah.number.toString()}>
                          {surah.number}. {surah.englishName} ({surah.name})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedSurah && (
                <div className="p-4 rounded-md bg-muted">
                  <h3 className="font-semibold">{selectedSurah.englishName} ({selectedSurah.name})</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedSurah.englishNameTranslation} • {selectedSurah.revelationType} • {selectedSurah.verses} verses
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Quran Text</CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="p-4 text-red-500 bg-red-50 rounded-md">
                  Error: {error}
                </div>
              ) : loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : ayahs.length > 0 ? (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {ayahs.map((ayah) => (
                      <div 
                        key={ayah.number} 
                        className="flex items-start gap-4"
                        dir="rtl"
                      >
                        <div 
                          className={cn(
                            "flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground",
                            {
                              "w-8 h-8 text-sm": fontSize <= 16,
                              "w-10 h-10 text-base": fontSize > 16 && fontSize <= 20,
                              "w-12 h-12 text-lg": fontSize > 20
                            }
                          )}
                        >
                          {ayah.numberInSurah}
                        </div>
                        <p 
                          className="leading-relaxed"
                          style={{ fontSize: `${fontSize}px` }}
                        >
                          {ayah.text}
                          {ayah.sajda && (
                            <span className="inline-block mx-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                              Sajda
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Select a surah to begin reading
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}