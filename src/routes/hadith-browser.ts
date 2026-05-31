import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { hadithBrowser } from "@/db/schema/hadith-browser";

/** Zod request body for "hadithBrowser" mutations. */
const HadithBrowserInput = z.object({
  name: z.string().min(1).max(512),
});

/** GET /api/hadith-browser — list rows from the real DB. */
export async function GET(_req: NextRequest): Promise<NextResponse> {
  const rows = await db.select().from(hadithBrowser);
  return NextResponse.json({ data: rows }, { status: 200 });
}

/** POST — Zod-validated insert via the real Drizzle layer. */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const parsed = HadithBrowserInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [row] = await db.insert(hadithBrowser).values(parsed.data).returning();
  return NextResponse.json({ data: row }, { status: 201 });
}

/** DELETE /api/hadith-browser?id=… */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(hadithBrowser).where(and(eq(hadithBrowser.id, id)));
  return NextResponse.json({ ok: true }, { status: 200 });
}
