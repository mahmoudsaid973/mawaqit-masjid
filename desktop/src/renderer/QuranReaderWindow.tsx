import React, { useState, useEffect } from 'react';

/**
 * Quran Reader Window Component
 * Displays the Quran reader interface in a desktop window
 * @component
 */
export default function QuranReaderWindow() {
  const [chapter, setChapter] = useState(1);
  const [verse, setVerse] = useState(1);
  const [verseText, setVerseText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for Quran verses (in a real app, this would come from a database or API)
  const quranData = [
    { chapter: 1, verse: 1, text: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' },
    { chapter: 1, verse: 2, text: 'Praise be to Allah, Lord of all worlds.' },
    // Additional verses would be included in a real implementation
  ];

  useEffect(() => {
    // Simulate fetching data
    const quranVerse = quranData.find(v => v.chapter === chapter && v.verse === verse);
    if (quranVerse) {
      setVerseText(quranVerse.text);
    }
    setIsLoading(false);
  }, [chapter, verse]);

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChapter(Number(e.target.value));
  };

  const handleVerseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVerse(Number(e.target.value));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Quran Reader</h1>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="chapter">
            Select Chapter
          </label>
          <select 
            id="chapter"
            value={chapter} 
            onChange={handleChapterChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
              <option key={num} value={num}>Chapter {num}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="verse">
            Select Verse
          </label>
          <select 
            id="verse"
            value={verse} 
            onChange={handleVerseChange}
            className="shadow appearance-only border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            <option value={1}>Verse 1</option>
            <option value={2}>Verse 2</option>
            <option value={3}>Verse 3</option>
          </select>
        </div>
        
        <div className="text-center mb-4 p-4">
          <p className="text-xl text-gray-800">{verseText}</p>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          <p>Chapter {chapter}, Verse {verse}</p>
        </div>
      </div>
    </div>
  );
}
