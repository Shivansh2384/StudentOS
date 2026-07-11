import { db } from "@/db";
import { opportunities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const all = await db.select().from(opportunities).orderBy(opportunities.deadline);
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.deadline) body.deadline = new Date(body.deadline);
  const result = await db.insert(opportunities).values(body).returning();
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  if (data.deadline) data.deadline = new Date(data.deadline);
  const result = await db.update(opportunities).set(data).where(eq(opportunities.id, id)).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(opportunities).where(eq(opportunities.id, id));
  return NextResponse.json({ success: true });
}
