"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchIcon, BookOpenIcon } from 'lucide-react';

interface Hadith {
  id: string;
  collection: string;
  book: string;
  hadithNumber: number;
  narrator: string;
  englishText: string;
  arabicText: string;
  grade: string;
}

export default function HadithBrowserPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real implementation, this would fetch from an API
  // For now we'll use mock data
  const mockHadiths: Hadith[] = [
    {
      id: '1',
      collection: 'Sahih al-Bukhari',
      book: 'Book of Faith',
      hadithNumber: 1,
      narrator: 'Narrated Abu Huraira',
      englishText: 'Allah\'s Messenger (ﷺ) said, "The example of the one who reads the Qur\'an and memorizes it is like the owner of tied camels. If he takes care of them, they will be tied in his possession, and if he sets them free, their owner will have to go out in search of them."',
      arabicText: 'قال رسول الله صلى الله عليه وسلم "مثل الذي يقرأ القرآن وهو حافظ له كمثل صاحب الإبل الغريبة إن حافظ عليها كانت له وإن أطلقها ذهب主人 في طلبها"',
      grade: 'Sahih'
    },
    {
      id: '2',
      collection: 'Sahih Muslim',
      book: 'The Book of Purification',
      hadithNumber: 5,
      narrator: 'Narrated Abu Huraira',
      englishText: 'The Prophet (ﷺ) said, "If anyone of you performs ablution and does it well, then says: I testify that there is none worthy of worship except Allah, and that Muhammad is the Messenger of Allah, the gates of Paradise will be opened for him, and he will enter Paradise through any of them he wishes."',
      arabicText: 'قال النبي صلى الله عليه وسلم "من توضأ فأحسن الوضوء ثم قال لا إله إلا الله محمد رسول الله فتحت له أبواب الجنة الثمانية يدخل من أيها شاء"',
      grade: 'Sahih'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchHadiths = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real app, this would be:
        // const response = await fetch(`/api/hadiths?search=${searchTerm}`);
        // const data = await response.json();
        // setHadiths(data);
        
        // For demo purposes, we'll filter mock data
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
        
        if (searchTerm) {
          const filtered = mockHadiths.filter(hadith => 
            hadith.englishText.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hadith.arabicText.includes(searchTerm) ||
            hadith.collection.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hadith.book.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setHadiths(filtered);
        } else {
          setHadiths(mockHadiths);
        }
      } catch (err) {
        setError('Failed to fetch hadiths. Please try again later.');
        setHadiths([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHadiths();
  }, [searchTerm]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <BookOpenIcon className="h-8 w-8" />
          Hadith Browser
        </h1>
        <p className="text-muted-foreground">
          Search and browse authentic hadith collections
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search hadiths by keyword, collection, or book..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-6 text-base"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        </div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mb-6 bg-destructive/20 border border-destructive/50 text-destructive rounded-lg p-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading hadiths...</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {hadiths.length === 0 ? (
            <div className="text-center py-12">
              <BookOpenIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No hadiths found</h3>
              <p className="mt-1 text-muted-foreground">
                Try adjusting your search to find what you\'re looking for.
              </p>
            </div>
          ) : (
            hadiths.map((hadith) => (
              <Card key={hadith.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 pb-3">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <CardTitle className="text-lg">
                      {hadith.collection} - {hadith.book} #{hadith.hadithNumber}
                    </CardTitle>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {hadith.grade}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{hadith.narrator}</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-right text-lg leading-loose" dir="rtl">
                        {hadith.arabicText}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground leading-relaxed">
                        {hadith.englishText}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}