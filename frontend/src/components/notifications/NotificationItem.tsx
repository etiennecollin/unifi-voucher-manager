"use client";

import { NotificationPayload } from "@/utils/notifications";
import { useEffect, useState } from "react";

type Props = NotificationPayload & {
  onDone: (id: string) => void;
};

const NOTIFICATION_DURATION_MS = 4000;

export default function NotificationItem({ id, message, type, onDone }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // slide in next tick
    const showTimer = setTimeout(() => setVisible(true), 10);
    // slide out after 4s
    const hideTimer = setTimeout(
      () => setVisible(false),
      NOTIFICATION_DURATION_MS,
    );
    // remove after animation
    const removeTimer = setTimeout(
      () => onDone(id),
      NOTIFICATION_DURATION_MS + 500,
    );

    return () => [showTimer, hideTimer, removeTimer].forEach(clearTimeout);
  }, [id, onDone]);

  const getNotificationClasses = () => {
    switch (type) {
      case "success":
        return "border-status-success text-status-success";
      case "error":
        return "border-status-danger text-status-danger";
      case "warning":
        return "border-status-warning text-status-warning";
      default:
        return "border-status-info text-status-info";
    }
  };

  return (
    <div
      className={`
        slide-in-right ${visible ? "slide-in-right-visible" : ""}
        bg-surface shadow-lg border px-4 py-3 rounded-lg max-w-xs
        ${getNotificationClasses()}
      `}
    >
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
