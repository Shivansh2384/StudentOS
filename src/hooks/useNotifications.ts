"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  enabled: boolean;
  days: string;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const lastFiredRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        setSwRegistration(reg);
      }).catch(console.error);
    }

    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await fetch("/api/notifications").then((r) => r.json());
      setNotifications(data);
    } catch (e) {
      console.error("Failed to load notifications:", e);
    }
  };

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      alert("This browser doesn't support notifications");
      return false;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, []);

  const addNotification = useCallback(async (title: string, message: string, time: string, days?: string) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message, time, days: days || "all" }),
    });
    loadNotifications();
  }, []);

  const updateNotification = useCallback(async (id: number, data: Partial<Notification>) => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    loadNotifications();
  }, []);

  const deleteNotification = useCallback(async (id: number) => {
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadNotifications();
  }, []);

  const sendNotification = useCallback((title: string, body: string, tag?: string) => {
    if (permission !== "granted") return;

    if (swRegistration) {
      swRegistration.showNotification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: tag || "studentos-" + Date.now(),
        requireInteraction: false,
      });
    } else if ("Notification" in window) {
      new Notification(title, { body, icon: "/icon-192.png" });
    }
  }, [permission, swRegistration]);

  // Check scheduled notifications every minute
  useEffect(() => {
    if (permission !== "granted" || notifications.length === 0) return;

    const checkSchedule = () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).toUpperCase().replace(/\s/g, " ");

      const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const today = dayNames[now.getDay()];
      const dateKey = now.toDateString();

      notifications.forEach((notif) => {
        if (!notif.enabled) return;

        // Check if today matches
        if (notif.days !== "all") {
          const allowedDays = notif.days.toLowerCase().split(",").map(d => d.trim());
          if (!allowedDays.includes(today) && !allowedDays.includes("all")) return;
        }

        // Normalize times for comparison
        const notifTime = notif.time.toUpperCase().replace(/\s/g, " ");
        const fireKey = `${notif.id}-${dateKey}-${notifTime}`;

        if (currentTime === notifTime && !lastFiredRef.current.has(fireKey)) {
          lastFiredRef.current.add(fireKey);
          sendNotification(notif.title, notif.message, `notif-${notif.id}`);
        }
      });
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 30000);
    return () => clearInterval(interval);
  }, [permission, notifications, sendNotification]);

  return {
    permission,
    notifications,
    requestPermission,
    addNotification,
    updateNotification,
    deleteNotification,
    sendNotification,
    reload: loadNotifications,
    isSupported: typeof window !== "undefined" && "Notification" in window,
  };
}
