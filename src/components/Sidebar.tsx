"use client";

import { useState } from "react";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const NAV = [
  { id: "dashboard", label: "Home", icon: "⌘" },
  { id: "assignments", label: "Tasks", icon: "☑" },
  { id: "habits", label: "Habits", icon: "◎" },
  { id: "opportunities", label: "Opportunities", icon: "◉" },
  { id: "bus", label: "Bus Mode", icon: "▶" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

const MOBILE_NAV = [
  { id: "dashboard", label: "Home", icon: "⌘" },
  { id: "assignments", label: "Tasks", icon: "☑" },
  { id: "habits", label: "Habits", icon: "◎" },
  { id: "opportunities", label: "Opps", icon: "◉" },
  { id: "more", label: "More", icon: "•••" },
];

const MORE_ITEMS = [
  { id: "bus", label: "Bus Mode", icon: "▶" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  const handleMobileNav = (id: string) => {
    if (id === "more") {
      setMoreOpen(true);
    } else {
      onNavigate(id);
      setMoreOpen(false);
    }
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-[220px] flex-col bg-surface/80 border-r border-border z-30">
        <div className="px-5 pt-7 pb-5">
          <h1 className="text-[15px] font-semibold tracking-tight text-text">StudentOS</h1>
          <p className="text-[11px] text-text3 mt-0.5">Your command center</p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-[9px] rounded-[10px] text-[13px] font-medium transition-all duration-150 ${
                  active
                    ? "bg-white/[0.08] text-text"
                    : "text-text2 hover:bg-white/[0.04] hover:text-text"
                }`}
              >
                <span className="text-[14px] w-5 text-center opacity-70">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/90 border-t border-border backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]">
          {MOBILE_NAV.map(item => {
            const active = activePage === item.id || (item.id === "more" && MORE_ITEMS.some(m => m.id === activePage));
            return (
              <button
                key={item.id}
                onClick={() => handleMobileNav(item.id)}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg min-w-[52px] transition-all ${
                  active ? "text-accent" : "text-text3"
                }`}
              >
                <span className="text-[18px] leading-none">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* More sheet (mobile) */}
      {moreOpen && (
        <>
          <div className="overlay md:hidden" onClick={() => setMoreOpen(false)} />
          <div className="sheet md:hidden px-4 pt-3 pb-8">
            <div className="w-9 h-1 bg-white/10 rounded-full mx-auto mb-5" />
            <div className="space-y-1">
              {MORE_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMoreOpen(false); }}
                  className="touch-row w-full text-left"
                >
                  <span className="text-[18px] w-7 text-center opacity-60">{item.icon}</span>
                  <span className="text-[15px] font-medium text-text">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
