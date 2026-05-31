// Auto-generated minimal service layer for "Hadith Browser" (F004)
// Extend with real repository access as the feature evolves.

export async function getHadithBrowserList(): Promise<Array<{ id: string; name: string }>> {
  return [];
}

export async function createHadithBrowser(input: { name: string }): Promise<{ id: string; name: string }> {
  return { id: crypto.randomUUID(), name: input.name };
}
