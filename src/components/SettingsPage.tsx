"use client";

import { useState, useEffect, useCallback } from "react";
import { useNotifications, Notification } from "@/hooks/useNotifications";

interface ScheduleBlock { id: number; time: string; label: string; orderIndex: number; }

export default function SettingsPage() {
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [showNotifForm, setShowNotifForm] = useState(false);
  const [editingNotif, setEditingNotif] = useState<Notification | null>(null);
  const [notifForm, setNotifForm] = useState({ title: "", message: "", time: "08:00", days: "all" });

  const {
    permission,
    notifications,
    requestPermission,
    addNotification,
    updateNotification,
    deleteNotification,
    sendNotification,
    isSupported,
  } = useNotifications();

  const load = useCallback(async () => {
    const s = await fetch("/api/schedule").then(r => r.json());
    setSchedule(s);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveBlock = async (id: number, time: string, label: string) => {
    await fetch("/api/schedule", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, time, label }),
    });
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      sendNotification("Notifications Enabled", "You'll now receive StudentOS alerts");
    }
  };

  const formatTimeForDisplay = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    let hours = parseInt(h);
    const ampm = hours >= 12 ? "PM" : "AM";
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    return `${hours}:${m} ${ampm}`;
  };

  const openNewNotif = () => {
    setEditingNotif(null);
    setNotifForm({ title: "", message: "", time: "08:00", days: "all" });
    setShowNotifForm(true);
  };

  const openEditNotif = (notif: Notification) => {
    setEditingNotif(notif);
    // Convert display time to input time
    const match = notif.time.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    let inputTime = "08:00";
    if (match) {
      let hours = parseInt(match[1]);
      const mins = match[2];
      const ampm = match[3].toUpperCase();
      if (ampm === "PM" && hours !== 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      inputTime = `${hours.toString().padStart(2, "0")}:${mins}`;
    }
    setNotifForm({
      title: notif.title,
      message: notif.message,
      time: inputTime,
      days: notif.days,
    });
    setShowNotifForm(true);
  };

  const saveNotif = async () => {
    if (!notifForm.title || !notifForm.time) return;
    const displayTime = formatTimeForDisplay(notifForm.time);
    
    if (editingNotif) {
      await updateNotification(editingNotif.id, {
        title: notifForm.title,
        message: notifForm.message,
        time: displayTime,
        days: notifForm.days,
      });
    } else {
      await addNotification(notifForm.title, notifForm.message, displayTime, notifForm.days);
    }
    setShowNotifForm(false);
    setEditingNotif(null);
  };

  const DAYS = [
    { value: "all", label: "Every day" },
    { value: "mon,tue,wed,thu,fri", label: "Weekdays" },
    { value: "sat,sun", label: "Weekends" },
    { value: "mon", label: "Mon" },
    { value: "tue", label: "Tue" },
    { value: "wed", label: "Wed" },
    { value: "thu", label: "Thu" },
    { value: "fri", label: "Fri" },
    { value: "sat", label: "Sat" },
    { value: "sun", label: "Sun" },
  ];

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <h1 className="text-[24px] font-bold tracking-tight">Settings</h1>

      {/* ---- NOTIFICATIONS ---- */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[12px] uppercase tracking-widest text-text3 font-semibold">Notifications</p>
          {permission === "granted" && (
            <button onClick={openNewNotif} className="text-accent text-[13px] font-medium">+ Add</button>
          )}
        </div>
        
        {!isSupported ? (
          <div className="glass p-4 text-center">
            <p className="text-text3 text-[13px]">Notifications not supported in this browser</p>
          </div>
        ) : permission === "denied" ? (
          <div className="glass p-4 text-center">
            <p className="text-red text-[13px]">Notifications blocked</p>
            <p className="text-text3 text-[12px] mt-1">Enable in your browser settings</p>
          </div>
        ) : permission !== "granted" ? (
          <button
            onClick={handleEnableNotifications}
            className="glass w-full p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-[20px]">🔔</div>
            <div className="text-left flex-1">
              <p className="text-[15px] font-medium">Enable Notifications</p>
              <p className="text-[12px] text-text3">Get reminders on your device</p>
            </div>
            <span className="text-accent text-[13px] font-medium">Enable</span>
          </button>
        ) : notifications.length === 0 ? (
          <button onClick={openNewNotif} className="glass w-full p-6 text-center active:scale-[0.98] transition-transform">
            <p className="text-[32px] mb-2">🔔</p>
            <p className="text-[14px] font-medium">Create your first notification</p>
            <p className="text-[12px] text-text3 mt-1">Get reminded at the right time</p>
          </button>
        ) : (
          <div className="glass overflow-hidden divide-y divide-border">
            {notifications.map(notif => (
              <div key={notif.id} className="px-4 py-3.5 group">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateNotification(notif.id, { enabled: !notif.enabled })}
                    className={`w-[46px] h-[28px] rounded-full p-[2px] transition-colors flex-shrink-0 ${
                      notif.enabled ? "bg-green" : "bg-surface3"
                    }`}
                  >
                    <div className={`w-[24px] h-[24px] rounded-full bg-white shadow transition-transform ${
                      notif.enabled ? "translate-x-[18px]" : "translate-x-0"
                    }`} />
                  </button>
                  <button onClick={() => openEditNotif(notif)} className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-[14px] font-medium truncate ${!notif.enabled ? "text-text3" : ""}`}>
                        {notif.title}
                      </p>
                      <span className="text-[12px] text-accent font-mono flex-shrink-0">{notif.time}</span>
                    </div>
                    {notif.message && (
                      <p className="text-[12px] text-text3 truncate mt-0.5">{notif.message}</p>
                    )}
                    <p className="text-[10px] text-text3 mt-1">
                      {notif.days === "all" ? "Every day" : 
                       notif.days === "mon,tue,wed,thu,fri" ? "Weekdays" :
                       notif.days === "sat,sun" ? "Weekends" : notif.days.toUpperCase()}
                    </p>
                  </button>
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="opacity-0 group-hover:opacity-100 text-red text-[12px] flex-shrink-0 p-2"
                  >✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {permission === "granted" && notifications.length > 0 && (
          <button
            onClick={() => sendNotification("Test", "This is how your notifications will look!")}
            className="mt-3 text-accent text-[13px] font-medium px-1"
          >
            Send Test
          </button>
        )}
      </section>

      {/* Notification Form Sheet */}
      {showNotifForm && (
        <>
          <div className="overlay" onClick={() => setShowNotifForm(false)} />
          <div className="sheet px-5 pt-4 pb-8 md:pb-6">
            <div className="w-9 h-1 bg-white/10 rounded-full mx-auto mb-5 md:hidden" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-semibold">{editingNotif ? "Edit Notification" : "New Notification"}</h2>
              <button onClick={() => setShowNotifForm(false)} className="text-text3 text-[14px] font-medium">Cancel</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] text-text3 mb-1.5 block">Title</label>
                <input
                  value={notifForm.title}
                  onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                  placeholder="e.g. Time to study!"
                  autoFocus
                  className="w-full bg-surface3 rounded-xl px-4 py-3 text-[15px] text-text placeholder:text-text3 outline-none border border-border focus:border-border-focus"
                />
              </div>
              <div>
                <label className="text-[12px] text-text3 mb-1.5 block">Message (optional)</label>
                <textarea
                  value={notifForm.message}
                  onChange={e => setNotifForm({ ...notifForm, message: e.target.value })}
                  placeholder="e.g. Don't forget to review your notes"
                  rows={2}
                  className="w-full bg-surface3 rounded-xl px-4 py-3 text-[15px] text-text placeholder:text-text3 outline-none border border-border focus:border-border-focus resize-none"
                />
              </div>
              <div>
                <label className="text-[12px] text-text3 mb-1.5 block">Time</label>
                <input
                  type="time"
                  value={notifForm.time}
                  onChange={e => setNotifForm({ ...notifForm, time: e.target.value })}
                  className="w-full bg-surface3 rounded-xl px-4 py-3 text-[15px] text-text outline-none border border-border focus:border-border-focus [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-[12px] text-text3 mb-1.5 block">Repeat</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.slice(0, 3).map(d => (
                    <button
                      key={d.value}
                      onClick={() => setNotifForm({ ...notifForm, days: d.value })}
                      className={`px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                        notifForm.days === d.value
                          ? "bg-accent/15 text-accent border border-accent/20"
                          : "bg-surface3 text-text3 border border-border"
                      }`}
                    >{d.label}</button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {DAYS.slice(3).map(d => (
                    <button
                      key={d.value}
                      onClick={() => setNotifForm({ ...notifForm, days: d.value })}
                      className={`w-10 h-10 rounded-xl text-[11px] font-medium transition-all ${
                        notifForm.days === d.value
                          ? "bg-accent/15 text-accent border border-accent/20"
                          : "bg-surface3 text-text3 border border-border"
                      }`}
                    >{d.label}</button>
                  ))}
                </div>
              </div>
              <button
                onClick={saveNotif}
                className="w-full bg-accent text-white rounded-xl py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform"
              >
                {editingNotif ? "Save Changes" : "Create Notification"}
              </button>
              {editingNotif && (
                <button
                  onClick={() => { deleteNotification(editingNotif.id); setShowNotifForm(false); }}
                  className="w-full text-red text-[14px] font-medium py-2"
                >
                  Delete Notification
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ---- SCHEDULE ---- */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[12px] uppercase tracking-widest text-text3 font-semibold">Daily Schedule</p>
          <button onClick={() => setEditingSchedule(!editingSchedule)}
            className="text-accent text-[13px] font-medium">{editingSchedule ? "Done" : "Edit"}</button>
        </div>
        <div className="glass overflow-hidden divide-y divide-border">
          {schedule.map(block => (
            <div key={block.id} className="flex items-center gap-3 px-4 py-3">
              {editingSchedule ? (
                <>
                  <input defaultValue={block.time}
                    onBlur={e => saveBlock(block.id, e.target.value, block.label)}
                    className="w-[80px] bg-surface3 rounded-lg px-2 py-1.5 text-[13px] text-text font-mono outline-none border border-border focus:border-border-focus flex-shrink-0" />
                  <input defaultValue={block.label}
                    onBlur={e => saveBlock(block.id, block.time, e.target.value)}
                    className="flex-1 bg-surface3 rounded-lg px-2 py-1.5 text-[13px] text-text outline-none border border-border focus:border-border-focus" />
                </>
              ) : (
                <>
                  <span className="text-[13px] font-mono text-text3 w-[72px] flex-shrink-0">{block.time}</span>
                  <span className="text-[14px] text-text2">{block.label}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <div className="text-center py-6">
        <p className="text-[15px] font-semibold">StudentOS</p>
        <p className="text-[12px] text-text3 mt-0.5">Your academic command center</p>
        <p className="text-[11px] text-text3 mt-3">Add to Home Screen for the best experience</p>
      </div>
    </div>
  );
}
