"use client";

import NotificationItem from "@/components/notifications/NotificationItem";
import { NotificationPayload } from "@/utils/notifications";
import { useEffect, useState, useCallback } from "react";

export default function NotificationContainer() {
  const [notes, setNotes] = useState<NotificationPayload[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<NotificationPayload>).detail;
      setNotes((prev) => [...prev, detail]);
    };
    window.addEventListener("notify", handler as any);
    return () => window.removeEventListener("notify", handler as any);
  }, []);

  const remove = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-9000 overflow-visible">
      {notes.map((n) => (
        <NotificationItem key={n.id} {...n} onDone={remove} />
      ))}
    </div>
  );
}
