import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { adminPortal } from "@/db/schema/admin-portal";

/** Zod request body for "adminPortal" mutations. */
const AdminPortalInput = z.object({
  name: z.string().min(1).max(512),
});

/** GET /api/admin-portal — list rows from the real DB. */
export async function GET(_req: NextRequest): Promise<NextResponse> {
  const rows = await db.select().from(adminPortal);
  return NextResponse.json({ data: rows }, { status: 200 });
}

/** POST — Zod-validated insert via the real Drizzle layer. */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const parsed = AdminPortalInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [row] = await db.insert(adminPortal).values(parsed.data).returning();
  return NextResponse.json({ data: row }, { status: 201 });
}

/** DELETE /api/admin-portal?id=… */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(adminPortal).where(and(eq(adminPortal.id, id)));
  return NextResponse.json({ ok: true }, { status: 200 });
}
