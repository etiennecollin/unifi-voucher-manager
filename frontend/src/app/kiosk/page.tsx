"use client";

import SiteSwitcher from "@/components/utils/SiteSwitcher";
import Spinner from "@/components/utils/Spinner";
import WifiQr from "@/components/utils/WifiQr";
import { TriState } from "@/types/state";
import { Voucher } from "@/types/voucher";
import { api } from "@/utils/api";
import { formatCode } from "@/utils/format";
import { useCallback, useEffect, useState } from "react";
import { useGlobal } from "@/contexts/GlobalContext";

export default function KioskPage() {
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [state, setState] = useState<TriState | null>(null);
  const { wifiConfig, wifiString } = useGlobal();

  const load = useCallback(async () => {
    if (state === "loading") return;
    try {
      setState("loading");
      await api.getRollingVoucher().then(setVoucher);
      setState("ok");
    } catch (error: any) {
      if (error?.status !== 404) {
        setState("error");
        return;
      }
      try {
        await api.createRollingVoucher().then(setVoucher);
        setState("ok");
      } catch {
        setState("error");
      }
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener("vouchersUpdated", load);
    return () => window.removeEventListener("vouchersUpdated", load);
  }, [load]);

  const renderContent = useCallback(() => {
    switch (state) {
      case null:
      case "loading":
        return <Spinner />;
      case "error":
        return (
          <div className="text-center text-5xl sm:text-6xl md:text-7xl text-status-danger">
            Could not load rolling voucher
          </div>
        );
      case "ok":
        const qrAvailable = wifiConfig && wifiString;
        return (
          <div
            className={`grid grid-cols-1 ${qrAvailable && "md:grid-cols-2 "} gap-8 items-center`}
          >
            {qrAvailable && <WifiQr className="w-full sm:h-80 md:h-96 " />}
            <div className={`text-center ${qrAvailable && "md:text-left"}`}>
              <h2 className="font-medium mb-4 text-3xl sm:text-4xl md:text-5xl">
                Voucher Code
              </h2>
              <div className="voucher-code tracking-widest text-5xl sm:text-6xl md:text-7xl">
                {voucher ? formatCode(voucher.code) : "No voucher available"}
              </div>
            </div>
          </div>
        );
    }
  }, [voucher, state, wifiConfig, wifiString]);

  return (
    <main className="flex-center flex-col h-screen w-full px-4">
      <div className="flex-center flex-1 w-full">{renderContent()}</div>
      <div className="flex-center pb-4 w-full">
        <SiteSwitcher />
      </div>
    </main>
  );
}
