import { generateUUID } from "./uuid";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationPayload {
  id: string;
  message: string;
  type: NotificationType;
}

/**
 * Dispatch a notification event. Listeners (e.g. NotificationContainer)
 * will pick this up and render it.
 */
export function notify(message: string, type: NotificationType = "info") {
  const id = generateUUID();
  window.dispatchEvent(
    new CustomEvent<NotificationPayload>("notify", {
      detail: { id, message, type },
    }),
  );
}
