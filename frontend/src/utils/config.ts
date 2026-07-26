import { DEFAULT_RUNTIME_CONFIG, RuntimeConfig } from "@/types/config";
import fs from "fs";
import path from "path";

function withDefaults(config: Partial<RuntimeConfig>): RuntimeConfig {
  return {
    ...DEFAULT_RUNTIME_CONFIG,
    ...config,
    PRINT_CONFIG: {
      ...DEFAULT_RUNTIME_CONFIG.PRINT_CONFIG,
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
    return DEFAULT_RUNTIME_CONFIG;
  }
}
