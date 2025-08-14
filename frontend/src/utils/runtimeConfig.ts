export const getRuntimeConfig = (): Record<string, string | undefined> => {
  if (typeof window === "undefined") return {};
  return window.__RUNTIME_CONFIG__ ?? {};
};
