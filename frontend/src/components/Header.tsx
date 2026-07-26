"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ThemeSwitcher from "@/components/utils/ThemeSwitcher";
import WifiQrModal from "@/components/modals/WifiQrModal";
import { useGlobal } from "@/contexts/GlobalContext";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Header() {
  const [showWifi, setShowWifi] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const { wifiConfig, wifiString } = useGlobal();
  const qrAvailable: boolean = useMemo(
    () => !!(wifiConfig && wifiString),
    [wifiConfig, wifiString],
  );

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
      <div className="max-w-95/100 mx-auto flex-center-between px-4 py-4 gap-4">
        <div className="flex-center gap-3">
          <Image
            src="/logo.svg"
            width={35}
            height={35}
            alt="UniFi Voucher Manager logo"
            className="dark:invert shrink-0"
          />
          <h1 className="text-xl md:text-2xl font-semibold text-brand">
            <span className="block sm:hidden">UVM</span>
            <span className="hidden sm:block">UniFi Voucher Manager</span>
          </h1>
        </div>
        <div className="flex-center gap-3">
          <button
            onClick={() => router.push("/kiosk")}
            className="btn text-xl p-1 px-2 shrink-0"
            aria-label="Open Kiosk"
            title="Open Kiosk"
          >
            📺
          </button>
          <button
            onClick={() => setShowWifi(true)}
            className="btn p-1 shrink-0"
            disabled={!qrAvailable}
            aria-label="Open Wi‑Fi QR code"
            title="Open Wi‑Fi QR code"
          >
            <Image
              src="/qr.svg"
              width={28}
              height={28}
              className="dark:invert"
              alt="QR code icon"
            />
          </button>
          <ThemeSwitcher />
        </div>
      </div>
      {qrAvailable && showWifi && (
        <WifiQrModal onClose={() => setShowWifi(false)} />
      )}
    </header>
  );
}
