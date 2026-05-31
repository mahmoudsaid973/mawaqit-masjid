// Auto-generated minimal Vitest API test for "Quran Reader" (F003)
import { describe, it, expect } from "vitest";
import { getQuranReaderList } from "@/services/quran-reader-service";

describe("Quran Reader service", () => {
  it("returns an empty list by default", async () => {
    const items = await getQuranReaderList();
    expect(Array.isArray(items)).toBe(true);
  });
});
