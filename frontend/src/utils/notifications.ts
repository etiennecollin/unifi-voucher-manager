export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationPayload {
  id: string;
  message: string;
  type: NotificationType;
}

/** Generate a RFC-4122 v4 UUID */
function generateUUID(): string {
  // use crypto.randomUUID() when available
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }

  // fallback to crypto.getRandomValues
  let d = new Date().getTime();
  let d2 = (performance && performance.now && performance.now() * 1000) || 0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r =
      Math.random() * 16 +
      // use high-res entropy if available
      (crypto && crypto.getRandomValues
        ? crypto.getRandomValues(new Uint8Array(1))[0]
        : 0);
    const v = c === "x" ? r % 16 | 0 : (r % 16 & 0x3) | 0x8;
    return v.toString(16);
  });
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
