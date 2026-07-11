"use client";

import { useState, useEffect, useCallback } from "react";

interface Opportunity {
  id: number; name: string; category: string; deadline: string | null;
  priority: string; status: string; description: string; link: string;
}

const CATEGORIES = [
  { value: "competition", label: "Competition", icon: "🏆" },
  { value: "scholarship", label: "Scholarship", icon: "💰" },
  { value: "club", label: "Club", icon: "🎯" },
  { value: "event", label: "Event", icon: "📅" },
  { value: "volunteer", label: "Volunteer", icon: "🤝" },
  { value: "announcement", label: "Announcement", icon: "📢" },
];

const STATUSES = ["found", "researching", "submitted", "completed"];

export default function Opportunities() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "event", deadline: "", priority: "medium",
    status: "found", description: "", link: "",
  });

  const load = useCallback(async () => {
    const data = await fetch("/api/opportunities").then(r => r.json());
    setItems(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.name) return;
    await fetch("/api/opportunities", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, deadline: form.deadline || null }),
    });
    setForm({ name: "", category: "event", deadline: "", priority: "medium", status: "found", description: "", link: "" });
    setShowForm(false);
    load();
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/opportunities", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  };

  const del = async (id: number) => {
    await fetch("/api/opportunities", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const getIcon = (cat: string) => CATEGORIES.find(c => c.value === cat)?.icon || "📋";

  const getCountdown = (d: string | null) => {
    if (!d) return null;
    const diff = new Date(d).getTime() - Date.now();
    if (diff < 0) return { text: "Passed", urgent: true };
    const days = Math.floor(diff / 86400000);
    if (days === 0) return { text: "Today", urgent: true };
    if (days === 1) return { text: "Tomorrow", urgent: true };
    return { text: `${days}d left`, urgent: days <= 3 };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold tracking-tight">Opportunities</h1>
        <button onClick={() => setShowForm(true)} className="pill bg-accent text-white text-[13px]">+ New</button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[40px] mb-3">📡</p>
          <p className="text-text2 text-[15px]">Your radar is clear</p>
          <p className="text-text3 text-[13px] mt-1">Add opportunities to never miss them</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(opp => {
            const countdown = getCountdown(opp.deadline);
            return (
              <div key={opp.id} className="glass p-4 group">
                <div className="flex items-start gap-3">
                  <span className="text-[24px]">{getIcon(opp.category)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-semibold truncate">{opp.name}</p>
                      {opp.priority === "critical" && <span className="w-2 h-2 rounded-full bg-red flex-shrink-0" />}
                    </div>
                    {opp.description && (
                      <p className="text-[13px] text-text3 mt-0.5 line-clamp-1">{opp.description}</p>
                    )}
                    {countdown && (
                      <p className={`text-[12px] mt-1.5 font-medium ${countdown.urgent ? "text-red" : "text-text3"}`}>
                        {countdown.text}
                      </p>
                    )}
                  </div>
                  <button onClick={() => del(opp.id)}
                    className="opacity-0 group-hover:opacity-100 text-text3 hover:text-red text-[13px] flex-shrink-0">✕</button>
                </div>
                {/* Status row */}
                <div className="flex gap-1 mt-3">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => updateStatus(opp.id, s)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all capitalize ${
                        opp.status === s ? "bg-accent/15 text-accent" : "text-text3"
                      }`}
                    >{s}</button>
                  ))}
                </div>
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
              <h2 className="text-[17px] font-semibold">New Opportunity</h2>
              <button onClick={() => setShowForm(false)} className="text-text3 text-[14px] font-medium">Cancel</button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Opportunity name" autoFocus
                className="w-full bg-surface3 rounded-xl px-4 py-3 text-[15px] text-text placeholder:text-text3 outline-none border border-border focus:border-border-focus" />
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(c => (
                  <button key={c.value} onClick={() => setForm({ ...form, category: c.value })}
                    className={`py-2.5 rounded-xl text-[12px] font-medium transition-all ${
                      form.category === c.value ? "bg-accent/15 text-accent border border-accent/20" : "bg-surface3 text-text3 border border-border"
                    }`}
                  >{c.icon} {c.label}</button>
                ))}
              </div>
              <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
                className="w-full bg-surface3 rounded-xl px-4 py-3 text-[15px] text-text outline-none border border-border focus:border-border-focus [color-scheme:dark]" />
              <div className="flex gap-2">
                {(["low", "medium", "high", "critical"] as const).map(p => (
                  <button key={p} onClick={() => setForm({ ...form, priority: p })}
                    className={`flex-1 py-2.5 rounded-xl text-[12px] font-medium transition-all capitalize ${
                      form.priority === p ? "bg-accent/15 text-accent border border-accent/20" : "bg-surface3 text-text3 border border-border"
                    }`}
                  >{p}</button>
                ))}
              </div>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Description (optional)" rows={2}
                className="w-full bg-surface3 rounded-xl px-4 py-3 text-[15px] text-text placeholder:text-text3 outline-none border border-border focus:border-border-focus resize-none" />
              <button onClick={submit}
                className="w-full bg-accent text-white rounded-xl py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform">
                Add Opportunity
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
