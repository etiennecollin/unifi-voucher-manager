export function formatCode(code: string) {
  return code.length === 10 ? code.replace(/(.{5})(.{5})/, "$1-$2") : code;
}

export function formatDate(d: string) {
  return new Date(d).toLocaleString();
}

export function formatDuration(m: number | null | undefined) {
  if (!m) return "Unlimited";
  const days = Math.floor(m / 1440),
    hours = Math.floor((m % 1440) / 60),
    mins = m % 60;
  return (
    [
      days > 0 ? days + "d" : "",
      hours > 0 ? hours + "h" : "",
      mins > 0 ? mins + "m" : "",
    ]
      .filter(Boolean)
      .join(" ") || "0m"
  );
}

export function formatBytes(b: number | null | undefined) {
  if (!b) return "Unlimited";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = b,
    i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(size < 10 ? 1 : 0)} ${units[i]}`;
}

export function formatSpeed(kbps: number | null | undefined) {
  if (!kbps) return "Unlimited";
  return kbps >= 1024
    ? `${(kbps / 1024).toFixed(kbps < 10240 ? 1 : 0)} Mbps`
    : `${kbps} Kbps`;
}

export function formatGuestUsage(
  usage: number,
  limit: number | null | undefined,
) {
  return limit ? `${usage}/${limit}` : `${usage}/∞`;
}
