import { db } from "@/db";
import { assignments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const all = await db.select().from(assignments).orderBy(assignments.dueDate);
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await db.insert(assignments).values({
    ...body,
    dueDate: new Date(body.dueDate),
  }).returning();
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  if (data.dueDate) data.dueDate = new Date(data.dueDate);
  const result = await db.update(assignments).set(data).where(eq(assignments.id, id)).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(assignments).where(eq(assignments.id, id));
  return NextResponse.json({ success: true });
}
