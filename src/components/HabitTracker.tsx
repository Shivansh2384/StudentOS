"use client";

import { useState, useEffect, useCallback } from "react";

interface Habit { id: number; name: string; icon: string; }
interface HabitCompletion { id: number; habitId: number; completedDate: string; }

const ICONS = ["✅", "📚", "💪", "🧠", "🦷", "📧", "😴", "🏃", "💧", "🎯", "🧘", "📝"];

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("✅");

  const today = new Date().toISOString().split("T")[0];

  const load = useCallback(async () => {
    const data = await fetch("/api/habits").then(r => r.json());
    setHabits(data.habits);
    setCompletions(data.completions);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!newName) return;
    await fetch("/api/habits", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, icon: newIcon }),
    });
    setNewName(""); setNewIcon("✅"); setShowForm(false);
    load();
  };

  const toggle = async (id: number) => {
    await fetch("/api/habits", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", habitId: id, date: today }),
    });
    load();
  };

  const del = async (id: number) => {
    await fetch("/api/habits", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const isDone = (id: number) => completions.some(c => c.habitId === id && c.completedDate === today);

  const getStreak = (id: number) => {
    const dates = completions.filter(c => c.habitId === id).map(c => c.completedDate).sort().reverse();
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const ds = d.toISOString().split("T")[0];
      if (dates.includes(ds)) { streak++; } else if (i > 0) { break; }
      d.setDate(d.getDate() - 1);
    }
    return streak;
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { date: d.toISOString().split("T")[0], label: d.toLocaleDateString("en-US", { weekday: "narrow" }) };
  });

  const doneToday = habits.filter(h => isDone(h.id)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold tracking-tight">Habits</h1>
        <button onClick={() => setShowForm(true)} className="pill bg-accent text-white text-[13px]">+ New</button>
      </div>

      {/* Progress */}
      {habits.length > 0 && (
        <div className="glass p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-text2">Today</span>
            <span className="text-[13px] font-semibold text-accent">{doneToday}/{habits.length}</span>
          </div>
          <div className="h-[5px] bg-surface3 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: habits.length > 0 ? `${(doneToday / habits.length) * 100}%` : "0%" }} />
          </div>
          {doneToday === habits.length && habits.length > 0 && (
            <p className="text-[13px] text-green text-center mt-2 font-medium">All done! 🎉</p>
          )}
        </div>
      )}

      {/* Habits list */}
      {habits.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[40px] mb-3">✨</p>
          <p className="text-text2 text-[15px]">Build your routine</p>
          <p className="text-text3 text-[13px] mt-1">Small habits compound into greatness</p>
        </div>
      ) : (
        <div className="space-y-2">
          {habits.map(h => {
            const done = isDone(h.id);
            const streak = getStreak(h.id);
            return (
              <div key={h.id} className={`glass flex items-center gap-3.5 px-4 py-3.5 group transition-all ${
                done ? "bg-green/[0.04]" : ""
              }`} style={done ? { borderColor: "rgba(48,209,88,0.15)" } : {}}>
                <button onClick={() => toggle(h.id)}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-[20px] flex-shrink-0 transition-all ${
                    done ? "bg-green/15" : "bg-surface3"
                  }`}>
                  {h.icon}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-[14px] font-medium ${done ? "text-text3" : "text-text"}`}>{h.name}</p>
                  {streak > 0 && (
                    <p className="text-[11px] text-orange font-medium mt-0.5">🔥 {streak} day streak</p>
                  )}
                </div>
                {/* Weekly dots */}
                <div className="hidden md:flex gap-[3px] flex-shrink-0">
                  {last7.map(day => {
                    const c = completions.some(c2 => c2.habitId === h.id && c2.completedDate === day.date);
                    return <div key={day.date} className={`w-[7px] h-[7px] rounded-full ${c ? "bg-green" : "bg-surface3"}`} />;
                  })}
                </div>
                <button onClick={() => del(h.id)}
                  className="opacity-0 group-hover:opacity-100 text-text3 hover:text-red text-[12px] flex-shrink-0 ml-1">✕</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <>
          <div className="overlay" onClick={() => setShowForm(false)} />
          <div className="sheet px-5 pt-4 pb-8 md:pb-6">
            <div className="w-9 h-1 bg-white/10 rounded-full mx-auto mb-5 md:hidden" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-semibold">New Habit</h2>
              <button onClick={() => setShowForm(false)} className="text-text3 text-[14px] font-medium">Cancel</button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[12px] text-text3 mb-2">Choose an icon</p>
                <div className="flex gap-2 flex-wrap">
                  {ICONS.map(icon => (
                    <button key={icon} onClick={() => setNewIcon(icon)}
                      className={`w-11 h-11 rounded-2xl text-[20px] flex items-center justify-center transition-all ${
                        newIcon === icon ? "bg-accent/15 ring-2 ring-accent/30" : "bg-surface3"
                      }`}>{icon}</button>
                  ))}
                </div>
              </div>
              <input value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && add()}
                placeholder="Habit name" autoFocus
                className="w-full bg-surface3 rounded-xl px-4 py-3 text-[15px] text-text placeholder:text-text3 outline-none border border-border focus:border-border-focus" />
              <button onClick={add}
                className="w-full bg-accent text-white rounded-xl py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform">
                Add Habit
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
