"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import Assignments from "@/components/Assignments";
import BusMode from "@/components/BusMode";
import Opportunities from "@/components/Opportunities";
import HabitTracker from "@/components/HabitTracker";
import SettingsPage from "@/components/SettingsPage";

export default function Home() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <Dashboard onNavigate={setActivePage} />;
      case "assignments": return <Assignments />;
      case "bus": return <BusMode />;
      case "opportunities": return <Opportunities />;
      case "habits": return <HabitTracker />;
      case "settings": return <SettingsPage />;
      default: return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="flex-1 pb-24 md:pb-0 md:ml-[220px]">
        <div className="px-5 py-6 md:px-10 md:py-8 max-w-5xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
