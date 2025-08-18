"use client";

import {
  generateWifiConfig,
  generateWiFiQRString,
  WifiConfig,
} from "@/utils/wifi";
import React, { createContext, useContext, useEffect, useState } from "react";

type GlobalContextType = {
  wifiConfig: WifiConfig | null;
  wifiString: string | null;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [value, setValue] = useState<GlobalContextType>({
    wifiConfig: null,
    wifiString: null,
  });

  useEffect(() => {
    try {
      const wifiConfig = generateWifiConfig();
      const wifiString = wifiConfig ? generateWiFiQRString(wifiConfig) : null;
      setValue({ wifiConfig, wifiString });
    } catch (e) {
      console.warn(`Could not generate WiFi configuration: ${e}`);
    }
  }, []);

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobal must be used within GlobalProvider");
  return ctx;
};
