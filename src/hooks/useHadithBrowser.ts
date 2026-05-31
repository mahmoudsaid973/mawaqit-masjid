// Auto-generated minimal TanStack Query hook for "Hadith Browser" (F004)
import { useQuery } from "@tanstack/react-query";

export function useHadithBrowser() {
  return useQuery({
    queryKey: ["hadith-browser"],
    queryFn: async () => {
      const res = await fetch("/api/hadith-browser");
      if (!res.ok) throw new Error("Failed to load Hadith Browser");
      return res.json() as Promise<unknown[]>;
    },
    staleTime: 30_000,
  });
}
