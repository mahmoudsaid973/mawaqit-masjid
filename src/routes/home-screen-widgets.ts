import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { homeScreenWidgets } from "@/db/schema/home-screen-widgets";

/** Zod request body for "homeScreenWidgets" mutations. */
const HomeScreenWidgetsInput = z.object({
  name: z.string().min(1).max(512),
});

/** GET /api/home-screen-widgets — list rows from the real DB. */
export async function GET(_req: NextRequest): Promise<NextResponse> {
  const rows = await db.select().from(homeScreenWidgets);
  return NextResponse.json({ data: rows }, { status: 200 });
}

/** POST — Zod-validated insert via the real Drizzle layer. */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const parsed = HomeScreenWidgetsInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [row] = await db.insert(homeScreenWidgets).values(parsed.data).returning();
  return NextResponse.json({ data: row }, { status: 201 });
}

/** DELETE /api/home-screen-widgets?id=… */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(homeScreenWidgets).where(and(eq(homeScreenWidgets.id, id)));
  return NextResponse.json({ ok: true }, { status: 200 });
}
