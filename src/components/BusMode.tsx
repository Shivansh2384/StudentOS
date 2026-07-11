"use client";

import { useState, useEffect, useCallback } from "react";

const MORNING = [
  "Check school emails",
  "Check announcements",
  "Review upcoming deadlines",
  "Check opportunities",
  "Review today's schedule",
];

const AFTERNOON = [
  "Review today's assignments",
  "Update notebook",
  "Plan after-school tasks",
  "Write down questions",
  "Review goals",
];

interface Completion { id: number; type: string; itemIndex: number; completedDate: string; }

export default function BusMode() {
  const [mode, setMode] = useState<"morning" | "afternoon">(new Date().getHours() < 14 ? "morning" : "afternoon");
  const [completions, setCompletions] = useState<Completion[]>([]);
  const today = new Date().toISOString().split("T")[0];

  const load = useCallback(async () => {
    const data = await fetch(`/api/bus?date=${today}`).then(r => r.json());
    setCompletions(data);
  }, [today]);

  useEffect(() => { load(); }, [load]);

  const items = mode === "morning" ? MORNING : AFTERNOON;
  const isDone = (i: number) => completions.some(c => c.type === mode && c.itemIndex === i);
  const doneCount = items.filter((_, i) => isDone(i)).length;
  const allDone = doneCount === items.length;

  const toggle = async (i: number) => {
    await fetch("/api/bus", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: mode, itemIndex: i, date: today }),
    });
    load();
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <p className="text-[40px] mb-2">🚌</p>
        <h1 className="text-[24px] font-bold tracking-tight">Bus Mode</h1>
        <p className="text-text3 text-[13px] mt-1">Make every minute count</p>
      </div>

      {/* Toggle */}
      <div className="flex gap-1 bg-surface3 rounded-[10px] p-1 mx-auto w-fit">
        <button onClick={() => setMode("morning")}
          className={`px-5 py-2 rounded-[8px] text-[13px] font-medium transition-all ${
            mode === "morning" ? "bg-surface text-text" : "text-text3"
          }`}>☀ Morning</button>
        <button onClick={() => setMode("afternoon")}
          className={`px-5 py-2 rounded-[8px] text-[13px] font-medium transition-all ${
            mode === "afternoon" ? "bg-surface text-text" : "text-text3"
          }`}>🌙 Afternoon</button>
      </div>

      {/* Progress */}
      <div className="px-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-text3">{doneCount} of {items.length}</span>
          <span className="text-[12px] font-semibold text-accent">{Math.round((doneCount / items.length) * 100)}%</span>
        </div>
        <div className="h-[5px] bg-surface3 rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${(doneCount / items.length) * 100}%` }} />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item, i) => {
          const done = isDone(i);
          return (
            <button key={i} onClick={() => toggle(i)}
              className={`glass w-full flex items-center gap-3.5 px-4 py-4 text-left active:scale-[0.98] transition-all ${
                done ? "bg-green/[0.04]" : ""
              }`}
              style={done ? { borderColor: "rgba(48,209,88,0.15)" } : {}}
            >
              <div className={`w-[22px] h-[22px] rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                done ? "border-green bg-green" : "border-text3"
              }`}>
                {done && <span className="text-black text-[11px] font-bold">✓</span>}
              </div>
              <span className={`text-[15px] font-medium ${done ? "text-text3 line-through" : "text-text"}`}>
                {item}
              </span>
            </button>
          );
        })}
      </div>

      {allDone && (
        <div className="text-center py-6 animate-up">
          <p className="text-[48px] mb-2">✅</p>
          <p className="text-[18px] font-bold text-green">Routine Complete!</p>
          <p className="text-text3 text-[13px] mt-1">You&apos;re ready for the day</p>
        </div>
      )}
    </div>
  );
}
