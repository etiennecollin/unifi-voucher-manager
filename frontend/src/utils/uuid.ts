/** Generate a RFC-4122 v4 UUID */
export function generateUUID(): string {
  if (crypto && crypto.randomUUID) {
    // Use crypto.randomUUID() when available
    return crypto.randomUUID();
  } else if (crypto && crypto.getRandomValues) {
    // Fallback to crypto.getRandomValues
    const bytes = crypto.getRandomValues(new Uint8Array(16));

    // Per RFC 4122, set bits for version and `clock_seq_hi_and_reserved`
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10

    const toHex = (b: number) => b.toString(16).padStart(2, "0");

    return [
      toHex(bytes[0]) + toHex(bytes[1]) + toHex(bytes[2]) + toHex(bytes[3]),
      toHex(bytes[4]) + toHex(bytes[5]),
      toHex(bytes[6]) + toHex(bytes[7]),
      toHex(bytes[8]) + toHex(bytes[9]),
      toHex(bytes[10]) +
        toHex(bytes[11]) +
        toHex(bytes[12]) +
        toHex(bytes[13]) +
        toHex(bytes[14]) +
        toHex(bytes[15]),
    ].join("-");
  } else {
    // If crypto is not available, fallback to Math.random based implementation
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
