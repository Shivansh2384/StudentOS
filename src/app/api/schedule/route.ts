import { db } from "@/db";
import { scheduleBlocks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_SCHEDULE = [
  { time: "8:00 AM", label: "Wake Up", orderIndex: 0 },
  { time: "8:40 AM", label: "Bus", orderIndex: 1 },
  { time: "9:10 AM", label: "School Starts", orderIndex: 2 },
  { time: "3:29 PM", label: "Leave School", orderIndex: 3 },
  { time: "4:05 PM", label: "Productivity Block", orderIndex: 4 },
  { time: "4:37 PM", label: "Exercise", orderIndex: 5 },
  { time: "5:15 PM", label: "Free Time", orderIndex: 6 },
  { time: "11:30 PM", label: "Prepare Sleep", orderIndex: 7 },
  { time: "12:00 AM", label: "Sleep", orderIndex: 8 },
];

export async function GET() {
  let blocks = await db.select().from(scheduleBlocks).orderBy(scheduleBlocks.orderIndex);
  if (blocks.length === 0) {
    // Seed default schedule
    for (const block of DEFAULT_SCHEDULE) {
      await db.insert(scheduleBlocks).values(block);
    }
    blocks = await db.select().from(scheduleBlocks).orderBy(scheduleBlocks.orderIndex);
  }
  return NextResponse.json(blocks);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const result = await db.update(scheduleBlocks).set(data).where(eq(scheduleBlocks.id, id)).returning();
  return NextResponse.json(result[0]);
}
