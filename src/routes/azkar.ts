import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { azkar } from "@/db/schema/azkar";

/** Zod request body for "azkar" mutations. */
const AzkarInput = z.object({
  name: z.string().min(1).max(512),
});

/** GET /api/azkar — list rows from the real DB. */
export async function GET(_req: NextRequest): Promise<NextResponse> {
  const rows = await db.select().from(azkar);
  return NextResponse.json({ data: rows }, { status: 200 });
}

/** POST — Zod-validated insert via the real Drizzle layer. */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const parsed = AzkarInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [row] = await db.insert(azkar).values(parsed.data).returning();
  return NextResponse.json({ data: row }, { status: 201 });
}

/** DELETE /api/azkar?id=… */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(azkar).where(and(eq(azkar.id, id)));
  return NextResponse.json({ ok: true }, { status: 200 });
}
