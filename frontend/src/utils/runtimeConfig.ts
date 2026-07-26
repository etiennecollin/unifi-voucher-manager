import { PrintConfig } from "@/types/print";
import fs from "fs";
import path from "path";

export type RuntimeConfig = {
  WIFI_SSID?: string;
  WIFI_PASSWORD?: string;
  WIFI_TYPE?: string;
  WIFI_HIDDEN?: string;
  PRINT_CONFIG: PrintConfig;
};

const defaultConfig: RuntimeConfig = {
  PRINT_CONFIG: {
    duration: true,
    maxGuests: true,
    dataUsageLimit: true,
    rxRateLimit: true,
    txRateLimit: true,
    id: true,
    printTime: true,
  },
};

function withDefaults(config: Partial<RuntimeConfig>): RuntimeConfig {
  return {
    ...defaultConfig,
    ...config,
    PRINT_CONFIG: {
      ...defaultConfig.PRINT_CONFIG,
      ...config.PRINT_CONFIG,
    },
  };
}

export function getRuntimeConfig(): RuntimeConfig {
  const file = path.join(process.cwd(), "public", "runtime-config.json");

  try {
    const config = JSON.parse(fs.readFileSync(file, "utf8"));
    return withDefaults(config);
  } catch (error) {
    console.warn("Unable to read runtime config:", error);
    return defaultConfig;
  }
}
