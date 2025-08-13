"use client";

import { useEffect, useState } from "react";
import ThemeSwitcher from "@/components/utils/ThemeSwitcher";
import WifiQrModal from "@/components/modals/WifiQrModal";
import { generateWifiConfig, WifiConfig } from "@/utils/wifi";

export default function Header() {
  const [showWifi, setShowWifi] = useState(false);
  const [wifiConfig, setWifiConfig] = useState<WifiConfig | null>(null);

  useEffect(() => {
    const config: WifiConfig | null = (() => {
      try {
        return generateWifiConfig();
      } catch (e) {
        console.warn(`Could not generate WiFi configuration: ${e}`);
        return null;
      }
    })();

    setWifiConfig(config);
  });

  return (
    <header className="bg-surface border-b border-default sticky top-0 z-7000">
      <div className="max-w-95/100 mx-auto flex-center-between px-4 py-4">
        <h1 className="text-xl md:text-2xl font-semibold text-brand">
          UniFi Voucher Manager
        </h1>
        <div className="flex-center gap-3">
          <button
            onClick={() => setShowWifi(true)}
            className="btn"
            disabled={!wifiConfig}
            aria-label="Open Wi‑Fi QR code"
            title="Open Wi‑Fi QR code"
          >
            {/* TODO: Make content a small QR code SVG */}
            QR
          </button>
          <ThemeSwitcher />
        </div>
      </div>
      {showWifi && wifiConfig && (
        <WifiQrModal
          wifiConfig={wifiConfig}
          onClose={() => setShowWifi(false)}
        />
      )}
    </header>
  );
}
