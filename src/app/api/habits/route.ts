import { db } from "@/db";
import { habits, habitCompletions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const allHabits = await db.select().from(habits).orderBy(habits.createdAt);
  const allCompletions = await db.select().from(habitCompletions);
  return NextResponse.json({ habits: allHabits, completions: allCompletions });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  if (body.action === "toggle") {
    const { habitId, date } = body;
    const existing = await db.select().from(habitCompletions)
      .where(and(eq(habitCompletions.habitId, habitId), eq(habitCompletions.completedDate, date)));
    
    if (existing.length > 0) {
      await db.delete(habitCompletions).where(eq(habitCompletions.id, existing[0].id));
      return NextResponse.json({ toggled: false });
    } else {
      await db.insert(habitCompletions).values({ habitId, completedDate: date });
      return NextResponse.json({ toggled: true });
    }
  }
  
  const result = await db.insert(habits).values({ name: body.name, icon: body.icon || "✅" }).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(habitCompletions).where(eq(habitCompletions.habitId, id));
  await db.delete(habits).where(eq(habits.id, id));
  return NextResponse.json({ success: true });
}
