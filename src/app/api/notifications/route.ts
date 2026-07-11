import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const all = await db.select().from(notifications).orderBy(notifications.time);
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await db.insert(notifications).values({
    title: body.title,
    message: body.message || "",
    time: body.time,
    enabled: body.enabled ?? true,
    days: body.days || "all",
  }).returning();
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const result = await db.update(notifications).set(data).where(eq(notifications.id, id)).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(notifications).where(eq(notifications.id, id));
  return NextResponse.json({ success: true });
}
