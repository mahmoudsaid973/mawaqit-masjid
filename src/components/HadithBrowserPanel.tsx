// Auto-generated minimal React component for "Hadith Browser" (F004)
"use client";
import { useHadithBrowser } from "@/hooks/useHadithBrowser";

export function HadithBrowserPanel() {
  const { data, isLoading } = useHadithBrowser();
  if (isLoading) return <div>Loading Hadith Browser…</div>;
  return (
    <section aria-label="Hadith Browser">
      <p className="text-sm text-gray-500">hadithBrowser items: {Array.isArray(data) ? data.length : 0}</p>
    </section>
  );
}
