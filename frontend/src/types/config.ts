import { PrintConfig, QuickVoucherConfig } from "@/types/print";

export type RuntimeConfig = {
  IS_LOGO_INVERTIBLE: boolean;
  WIFI_SSID?: string;
  WIFI_PASSWORD?: string;
  WIFI_TYPE?: string;
  WIFI_HIDDEN?: string;
  PRINT_CONFIG: PrintConfig;
  QUICK_VOUCHER_CONFIG: QuickVoucherConfig;
};

export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  IS_LOGO_INVERTIBLE: false,
  PRINT_CONFIG: {
    showName: true,
    showLogo: true,
    showDuration: true,
    showMaxGuests: true,
    showDataUsageLimit: true,
    showRxRateLimit: true,
    showTxRateLimit: true,
    showId: true,
    showPrintTime: true,
  },
  QUICK_VOUCHER_CONFIG: {
    authorizedGuestLimit: 1,
    dataUsageLimitMBytes: null,
    rxRateLimitKbps: null,
    txRateLimitKbps: null,
  },
};
