"use client";

import { useEffect, useRef, useState } from "react";
import ThemeSwitcher from "@/components/utils/ThemeSwitcher";
import WifiQrModal from "@/components/modals/WifiQrModal";
import { generateWifiConfig, WifiConfig } from "@/utils/wifi";

export default function Header() {
  const [showWifi, setShowWifi] = useState(false);
  const [wifiConfig, setWifiConfig] = useState<WifiConfig | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Set initial height and update on resize
    function updateHeaderHeight() {
      if (headerRef.current) {
        document.documentElement.style.setProperty(
          "--header-height",
          `${headerRef.current.offsetHeight}px`,
        );
      }
    }

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

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
  }, [generateWifiConfig]);

  return (
    <header
      ref={headerRef}
      className="bg-surface border-b border-default sticky top-0 z-7000"
    >
      <div className="max-w-95/100 mx-auto flex-center-between px-4 py-4">
        <h1 className="text-xl md:text-2xl font-semibold text-brand">
          UniFi Voucher Manager
        </h1>
        <div className="flex-center gap-3">
          <button
            onClick={() => setShowWifi(true)}
            className="btn p-1"
            disabled={!wifiConfig}
            aria-label="Open Wi‑Fi QR code"
            title="Open Wi‑Fi QR code"
          >
            <img
              src="/qr.svg"
              width={45}
              height={45}
              className="dark:invert"
              alt="QR code icon"
            />
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
