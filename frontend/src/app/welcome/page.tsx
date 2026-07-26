"use client";

import { useGlobal } from "@/contexts/GlobalContext";
import { api } from "@/utils/api";
import { useCallback, useEffect, useState } from "react";

export default function WelcomePage() {
  const [visited, setVisited] = useState(false);
  const { wifiConfig } = useGlobal();

  const rotateVoucher = useCallback(async () => {
    try {
      await api.createRollingVoucher();
    } catch (error: any) {
      // Error 403 is expected if the user already created a rolling voucher
      if (error?.status !== 403) {
        console.error("Failed to create rolling voucher", error);
      }
    }
  }, []);

  useEffect(() => {
    if (visited) return;

    rotateVoucher();
    setVisited(true);
  }, [rotateVoucher, visited]);

  return (
    <main className="flex-center h-screen w-full px-4">
      <div className="w-full text-center font-bold text-4xl sm:text-5xl md:text-7xl lg:text-9xl leading-snug">
        {wifiConfig?.ssid ? (
          <>
            Welcome to{" "}
            <span className="text-brand font-mono">{wifiConfig.ssid}</span>!
          </>
        ) : (
          "Welcome!"
        )}
      </div>
    </main>
  );
}
