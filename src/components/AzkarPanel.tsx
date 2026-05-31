// Auto-generated minimal React component for "Azkar" (F005)
"use client";
import { useAzkar } from "@/hooks/useAzkar";

export function AzkarPanel() {
  const { data, isLoading } = useAzkar();
  if (isLoading) return <div>Loading Azkar…</div>;
  return (
    <section aria-label="Azkar">
      <p className="text-sm text-gray-500">azkar items: {Array.isArray(data) ? data.length : 0}</p>
    </section>
  );
}
