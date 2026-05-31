import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { eventsAndKhutbahTopics } from "@/db/schema/events-and-khutbah-topics";

/** Zod request body for "eventsAndKhutbahTopics" mutations. */
const EventsAndKhutbahTopicsInput = z.object({
  name: z.string().min(1).max(512),
});

/** GET /api/events-and-khutbah-topics — list rows from the real DB. */
export async function GET(_req: NextRequest): Promise<NextResponse> {
  const rows = await db.select().from(eventsAndKhutbahTopics);
  return NextResponse.json({ data: rows }, { status: 200 });
}

/** POST — Zod-validated insert via the real Drizzle layer. */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const parsed = EventsAndKhutbahTopicsInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [row] = await db.insert(eventsAndKhutbahTopics).values(parsed.data).returning();
  return NextResponse.json({ data: row }, { status: 201 });
}

/** DELETE /api/events-and-khutbah-topics?id=… */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(eventsAndKhutbahTopics).where(and(eq(eventsAndKhutbahTopics.id, id)));
  return NextResponse.json({ ok: true }, { status: 200 });
}
