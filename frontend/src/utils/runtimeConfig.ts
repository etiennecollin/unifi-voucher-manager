import "server-only";

import fs from "fs";
import path from "path";
import { DEFAULT_RUNTIME_CONFIG, RuntimeConfig } from "@/types/config";
import {
  MIN_VOUCHER_GUESTS,
  MAX_VOUCHER_GUESTS,
  MIN_VOUCHER_DATA_MB,
  MAX_VOUCHER_DATA_MB,
  MIN_VOUCHER_DOWNLOAD_KBPS,
  MAX_VOUCHER_DOWNLOAD_KBPS,
  MIN_VOUCHER_UPLOAD_KBPS,
  MAX_VOUCHER_UPLOAD_KBPS,
} from "./api";
import { PrintConfig, QuickVoucherConfig } from "@/types/print";

let cachedConfig: RuntimeConfig | null = null;

function withDefaults(config: Partial<RuntimeConfig>): RuntimeConfig {
  return {
    ...DEFAULT_RUNTIME_CONFIG,
    ...config,
    PRINT_CONFIG: {
      ...DEFAULT_RUNTIME_CONFIG.PRINT_CONFIG,
      ...config.PRINT_CONFIG,
    },
    QUICK_VOUCHER_CONFIG: {
      ...DEFAULT_RUNTIME_CONFIG.QUICK_VOUCHER_CONFIG,
      ...config.QUICK_VOUCHER_CONFIG,
    },
  };
}

function isWithinBounds(value: unknown, min: number, max: number): boolean {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
  );
}

function isNullOrWithinBounds(
  value: unknown,
  min: number,
  max: number,
): boolean {
  return value === null || isWithinBounds(value, min, max);
}

function isValidQuickVoucherConfig(config: QuickVoucherConfig): boolean {
  return (
    isNullOrWithinBounds(
      config.authorizedGuestLimit,
      MIN_VOUCHER_GUESTS,
      MAX_VOUCHER_GUESTS,
    ) &&
    isNullOrWithinBounds(
      config.dataUsageLimitMBytes,
      MIN_VOUCHER_DATA_MB,
      MAX_VOUCHER_DATA_MB,
    ) &&
    isNullOrWithinBounds(
      config.rxRateLimitKbps,
      MIN_VOUCHER_DOWNLOAD_KBPS,
      MAX_VOUCHER_DOWNLOAD_KBPS,
    ) &&
    isNullOrWithinBounds(
      config.txRateLimitKbps,
      MIN_VOUCHER_UPLOAD_KBPS,
      MAX_VOUCHER_UPLOAD_KBPS,
    )
  );
}

function isValidPrintConfig(config: PrintConfig): boolean {
  return (
    typeof config.showName === "boolean" &&
    typeof config.showLogo === "boolean" &&
    typeof config.showDuration === "boolean" &&
    typeof config.showMaxGuests === "boolean" &&
    typeof config.showDataUsageLimit === "boolean" &&
    typeof config.showRxRateLimit === "boolean" &&
    typeof config.showTxRateLimit === "boolean" &&
    typeof config.showId === "boolean" &&
    typeof config.showPrintTime === "boolean"
  );
}
export function getRuntimeConfig(): RuntimeConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const file = path.join(process.cwd(), "public", "runtime-config.json");

  try {
    const parsedConfig = JSON.parse(
      fs.readFileSync(file, "utf8"),
    ) as Partial<RuntimeConfig>;

    const config = withDefaults(parsedConfig);

    if (typeof config.IS_LOGO_INVERTIBLE !== "boolean") {
      console.warn(
        "Invalid IS_LOGO_INVERTIBLE, falling back to defaults. Invalid config: ",
        config.IS_LOGO_INVERTIBLE,
      );
      config.IS_LOGO_INVERTIBLE = DEFAULT_RUNTIME_CONFIG.IS_LOGO_INVERTIBLE;
    }

    if (!isValidPrintConfig(config.PRINT_CONFIG)) {
      console.warn(
        "Invalid PRINT_CONFIG, falling back to defaults. Invalid config: ",
        config.PRINT_CONFIG,
      );
      config.PRINT_CONFIG = {
        ...DEFAULT_RUNTIME_CONFIG.PRINT_CONFIG,
      };
    }

    if (!isValidQuickVoucherConfig(config.QUICK_VOUCHER_CONFIG)) {
      console.warn(
        "Invalid QUICK_VOUCHER_CONFIG, falling back to defaults. Invalid config: ",
        config.QUICK_VOUCHER_CONFIG,
      );
      config.QUICK_VOUCHER_CONFIG = {
        ...DEFAULT_RUNTIME_CONFIG.QUICK_VOUCHER_CONFIG,
      };
    }

    return config;
  } catch (error) {
    console.warn("Unable to read runtime config:", error);
    return DEFAULT_RUNTIME_CONFIG;
  }
}
