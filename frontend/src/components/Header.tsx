"use client";

import { useEffect, useRef, useState } from "react";
import ThemeSwitcher from "@/components/utils/ThemeSwitcher";
import WifiQrModal from "@/components/modals/WifiQrModal";
import { useGlobal } from "@/contexts/GlobalContext";

export default function Header() {
  const [showWifi, setShowWifi] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { wifiConfig } = useGlobal();

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
        <WifiQrModal onClose={() => setShowWifi(false)} />
      )}
    </header>
  );
}
