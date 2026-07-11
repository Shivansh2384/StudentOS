"use client";

import { useState, useEffect, useCallback } from "react";

interface Assignment {
  id: number; name: string; className: string; dueDate: string;
  priority: string; estimatedTime: number; difficulty: string;
  status: string; description: string;
}

export default function Assignments() {
  const [items, setItems] = useState<Assignment[]>([]);
  const [tab, setTab] = useState<"active" | "done">("active");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", className: "", dueDate: "", priority: "medium",
    estimatedTime: 30, difficulty: "medium", description: "",
  });

  const load = useCallback(async () => {
    const data = await fetch("/api/assignments").then(r => r.json());
    setItems(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const todayStr = new Date().toISOString().split("T")[0];
  const active = items.filter(a => a.status !== "completed");
  const done = items.filter(a => a.status === "completed");
  const overdue = active.filter(a => a.dueDate.split("T")[0] < todayStr);
  const todayTasks = active.filter(a => a.dueDate.split("T")[0] === todayStr);
  const upcomingTasks = active.filter(a => a.dueDate.split("T")[0] > todayStr);

  const submit = async () => {
    if (!form.name || !form.dueDate) return;
    await fetch("/api/assignments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", className: "", dueDate: "", priority: "medium", estimatedTime: 30, difficulty: "medium", description: "" });
    setShowForm(false);
    load();
  };

  const cycle = async (id: number, current: string) => {
    const next = current === "not_started" ? "working" : current === "working" ? "completed" : "not_started";
    await fetch("/api/assignments", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    load();
  };

  const del = async (id: number) => {
    await fetch("/api/assignments", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const renderGroup = (label: string, list: Assignment[], color: string) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-6">
        <p className="text-[12px] uppercase tracking-widest font-semibold mb-2 px-1" style={{ color }}>{label}</p>
        <div className="glass overflow-hidden divide-y divide-border">
          {list.map(a => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3.5 group">
              <button
                onClick={() => cycle(a.id, a.status)}
                className={`w-[22px] h-[22px] rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  a.status === "completed" ? "border-green bg-green" :
                  a.status === "working" ? "border-orange" : "border-text3"
                }`}
              >
                {a.status === "completed" && <span className="text-black text-[11px] font-bold">✓</span>}
                {a.status === "working" && <div className="w-2 h-2 bg-orange rounded-full" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-[14px] font-medium truncate ${a.status === "completed" ? "line-through text-text3" : ""}`}>
                  {a.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {a.className && <span className="text-[11px] text-text3">{a.className}</span>}
                  <span className="text-[11px] text-text3">{a.estimatedTime}m</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[12px] text-text3 font-mono">
                  {new Date(a.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <button
                  onClick={() => del(a.id)}
                  className="opacity-0 group-hover:opacity-100 text-text3 hover:text-red text-[13px] transition-opacity"
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold tracking-tight">Tasks</h1>
        <button onClick={() => setShowForm(true)} className="pill bg-accent text-white text-[13px]">+ New</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface3 rounded-[10px] p-1 w-fit">
        {(["active", "done"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-[8px] text-[13px] font-medium transition-all ${
              tab === t ? "bg-surface text-text" : "text-text3"
            }`}
          >{t === "active" ? `Active (${active.length})` : `Done (${done.length})`}</button>
        ))}
      </div>

      {tab === "active" ? (
        active.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[40px] mb-3">🎯</p>
            <p className="text-text2 text-[15px]">You&apos;re all caught up</p>
            <p className="text-text3 text-[13px] mt-1">Add a task to get started</p>
          </div>
        ) : (
          <div>
            {renderGroup("Overdue", overdue, "var(--color-red)")}
            {renderGroup("Today", todayTasks, "var(--color-orange)")}
            {renderGroup("Upcoming", upcomingTasks, "var(--color-text3)")}
          </div>
        )
      ) : (
        done.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text3 text-[14px]">No completed tasks yet</p>
          </div>
        ) : (
          <div className="glass overflow-hidden divide-y divide-border">
            {done.map(a => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3 group">
                <button onClick={() => cycle(a.id, a.status)}
                  className="w-[22px] h-[22px] rounded-full border-2 border-green bg-green flex-shrink-0 flex items-center justify-center">
                  <span className="text-black text-[11px] font-bold">✓</span>
                </button>
                <p className="text-[14px] text-text3 line-through truncate flex-1">{a.name}</p>
                <button onClick={() => del(a.id)}
                  className="opacity-0 group-hover:opacity-100 text-text3 hover:text-red text-[13px]">✕</button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Form sheet */}
      {showForm && (
        <>
          <div className="overlay" onClick={() => setShowForm(false)} />
          <div className="sheet px-5 pt-4 pb-8 md:pb-6">
            <div className="w-9 h-1 bg-white/10 rounded-full mx-auto mb-5 md:hidden" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-semibold">New Task</h2>
              <button onClick={() => setShowForm(false)} className="text-text3 text-[14px] font-medium">Cancel</button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="What needs to be done?" autoFocus
                className="w-full bg-surface3 rounded-xl px-4 py-3 text-[15px] text-text placeholder:text-text3 outline-none border border-border focus:border-border-focus" />
              <input value={form.className} onChange={e => setForm({ ...form, className: e.target.value })}
                placeholder="Class (optional)"
                className="w-full bg-surface3 rounded-xl px-4 py-3 text-[15px] text-text placeholder:text-text3 outline-none border border-border focus:border-border-focus" />
              <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full bg-surface3 rounded-xl px-4 py-3 text-[15px] text-text outline-none border border-border focus:border-border-focus [color-scheme:dark]" />
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map(p => (
                  <button key={p} onClick={() => setForm({ ...form, priority: p })}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                      form.priority === p
                        ? p === "high" ? "bg-red/15 text-red border border-red/20"
                        : p === "medium" ? "bg-orange/15 text-orange border border-orange/20"
                        : "bg-blue/15 text-blue border border-blue/20"
                        : "bg-surface3 text-text3 border border-border"
                    }`}
                  >{p.charAt(0).toUpperCase() + p.slice(1)}</button>
                ))}
              </div>
              <button onClick={submit}
                className="w-full bg-accent text-white rounded-xl py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform">
                Add Task
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
