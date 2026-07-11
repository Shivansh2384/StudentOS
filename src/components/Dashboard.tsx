"use client";

import { useState, useEffect } from "react";

interface ScheduleBlock {
  id: number; time: string; label: string; orderIndex: number;
}
interface Assignment {
  id: number; name: string; className: string; dueDate: string; status: string; priority: string;
}

function parseTime(t: string): number {
  const m = t.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!m) return 0;
  let h = parseInt(m[1]);
  const mi = parseInt(m[2]);
  if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
  if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
  return h * 60 + mi;
}

export default function Dashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [time, setTime] = useState(new Date());
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/schedule").then(r => r.json()),
      fetch("/api/assignments").then(r => r.json()),
    ]).then(([s, a]) => { setSchedule(s); setAssignments(a); }).catch(() => {});
  }, []);

  const now = time.getHours() * 60 + time.getMinutes();
  let currentIdx = -1;
  for (let i = schedule.length - 1; i >= 0; i--) {
    if (now >= parseTime(schedule[i].time)) { currentIdx = i; break; }
  }
  const current = currentIdx >= 0 ? schedule[currentIdx] : null;
  const next = currentIdx >= 0 && currentIdx < schedule.length - 1 ? schedule[currentIdx + 1] : null;

  const todayStr = new Date().toISOString().split("T")[0];
  const overdue = assignments.filter(a => a.dueDate.split("T")[0] < todayStr && a.status !== "completed");
  const today = assignments.filter(a => a.dueDate.split("T")[0] === todayStr && a.status !== "completed");
  const upcoming = assignments.filter(a => a.dueDate.split("T")[0] > todayStr && a.status !== "completed").slice(0, 3);
  const urgentCount = overdue.length + today.length;

  const greeting = time.getHours() < 12 ? "Good morning" : time.getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="animate-up">
        <p className="text-text2 text-sm">{greeting}</p>
        <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight mt-1 leading-tight">
          {time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </h1>
        <p className="text-text3 text-[13px] mt-1">
          {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Now / Next */}
      <div className="grid grid-cols-2 gap-3 animate-up stagger-1">
        <div className="glass p-4">
          <p className="text-[10px] uppercase tracking-widest text-accent font-semibold mb-2">Now</p>
          <p className="text-[17px] font-semibold leading-snug">{current?.label || "Free Time"}</p>
          <p className="text-text3 text-[12px] mt-1">{current?.time || ""}</p>
        </div>
        <div className="glass p-4">
          <p className="text-[10px] uppercase tracking-widest text-text3 font-semibold mb-2">Next</p>
          <p className="text-[17px] font-semibold leading-snug">{next?.label || "—"}</p>
          <p className="text-text3 text-[12px] mt-1">{next?.time || ""}</p>
        </div>
      </div>

      {/* Urgent alert */}
      {urgentCount > 0 && (
        <button
          onClick={() => onNavigate("assignments")}
          className="glass w-full p-4 flex items-center gap-3 animate-up stagger-2"
          style={{ borderColor: "rgba(255,69,58,0.25)" }}
        >
          <div className="w-9 h-9 rounded-full bg-red/10 flex items-center justify-center text-red text-sm flex-shrink-0">
            {urgentCount}
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-[14px] font-semibold">
              {overdue.length > 0 ? `${overdue.length} overdue` : ""}{overdue.length > 0 && today.length > 0 ? " · " : ""}{today.length > 0 ? `${today.length} due today` : ""}
            </p>
            <p className="text-text3 text-[12px]">Tap to view tasks</p>
          </div>
          <span className="text-text3 text-lg">›</span>
        </button>
      )}

      {/* Timeline */}
      <div className="animate-up stagger-3">
        <p className="text-[12px] uppercase tracking-widest text-text3 font-semibold mb-3 px-1">Timeline</p>
        <div className="glass overflow-hidden divide-y divide-border">
          {schedule.map((block, i) => {
            const isCurrent = i === currentIdx;
            const isPast = currentIdx >= 0 && i < currentIdx;
            return (
              <div
                key={block.id}
                className={`flex items-center gap-3 px-4 py-3 transition-all ${isCurrent ? "bg-accent/[0.06]" : ""}`}
              >
                <div className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${
                  isCurrent ? "bg-accent" : isPast ? "bg-green" : "bg-text3"
                }`} />
                <span className={`text-[13px] font-mono w-[72px] flex-shrink-0 ${
                  isCurrent ? "text-accent" : "text-text3"
                }`}>
                  {block.time}
                </span>
                <span className={`text-[14px] ${isCurrent ? "text-text font-medium" : isPast ? "text-text3" : "text-text2"}`}>
                  {block.label}
                </span>
                {isCurrent && (
                  <span className="ml-auto text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                    NOW
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming tasks */}
      {upcoming.length > 0 && (
        <div className="animate-up stagger-4">
          <p className="text-[12px] uppercase tracking-widest text-text3 font-semibold mb-3 px-1">Coming Up</p>
          <div className="glass overflow-hidden divide-y divide-border">
            {upcoming.map(a => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${
                  a.priority === "high" ? "bg-red" : a.priority === "medium" ? "bg-orange" : "bg-text3"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium truncate">{a.name}</p>
                  <p className="text-[12px] text-text3">{a.className}</p>
                </div>
                <span className="text-[12px] text-text3 font-mono flex-shrink-0">
                  {new Date(a.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 animate-up stagger-5">
        {[
          { id: "bus", emoji: "🚌", label: "Bus Mode" },
          { id: "habits", emoji: "✓", label: "Habits" },
          { id: "opportunities", emoji: "📡", label: "Opportunities" },
        ].map(a => (
          <button
            key={a.id}
            onClick={() => onNavigate(a.id)}
            className="glass flex flex-col items-center justify-center py-4 gap-1.5 active:scale-95 transition-transform"
          >
            <span className="text-[22px]">{a.emoji}</span>
            <span className="text-[11px] text-text2 font-medium">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
