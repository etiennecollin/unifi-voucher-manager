import fs from "fs";
import path from "path";

export type RuntimeConfig = {
  WIFI_SSID?: string;
  WIFI_PASSWORD?: string;
  WIFI_TYPE?: string;
  WIFI_HIDDEN?: string;
};

export function getRuntimeConfig(): RuntimeConfig {
  const file = path.join(process.cwd(), "public", "runtime-config.json");

  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    console.warn("Unable to read runtime config:", error);
    return {};
  }
}
