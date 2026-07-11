import { db } from "@/db";
import { busCompletions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0];
  const completions = await db.select().from(busCompletions)
    .where(eq(busCompletions.completedDate, date));
  return NextResponse.json(completions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, itemIndex, date } = body;
  
  const existing = await db.select().from(busCompletions)
    .where(and(
      eq(busCompletions.type, type),
      eq(busCompletions.itemIndex, itemIndex),
      eq(busCompletions.completedDate, date)
    ));
  
  if (existing.length > 0) {
    await db.delete(busCompletions).where(eq(busCompletions.id, existing[0].id));
    return NextResponse.json({ toggled: false });
  } else {
    await db.insert(busCompletions).values({ type, itemIndex, completedDate: date });
    return NextResponse.json({ toggled: true });
  }
}
