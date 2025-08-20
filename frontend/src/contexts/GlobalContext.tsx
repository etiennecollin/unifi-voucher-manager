"use client";

import { Theme } from "@/components/utils/ThemeSwitcher";
import {
  generateWifiConfig,
  generateWiFiQRString,
  WifiConfig,
} from "@/utils/wifi";
import React, { createContext, useContext, useEffect, useState } from "react";

type GlobalContextType = {
  wifiConfig: WifiConfig | null;
  wifiString: string | null;
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wifiConfig, setWifiConfig] = useState<WifiConfig | null>(null);
  const [wifiString, setWifiString] = useState<string | null>(null);

  const [theme, setTheme] = useState<Theme>("system");

  // WiFi setup
  useEffect(() => {
    try {
      const cfg = generateWifiConfig();
      const str = cfg ? generateWiFiQRString(cfg) : null;
      setWifiConfig(cfg);
      setWifiString(str);
    } catch (e) {
      console.warn(`Could not generate WiFi configuration: ${e}`);
    }
  }, []);

  // Load theme on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  // Apply theme when changed
  useEffect(() => {
    const html = document.documentElement;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    const apply = () => {
      if (isSafari) html.classList.add("transition-disabled");

      const isDark = theme === "dark" || (theme === "system" && mql.matches);
      html.classList.toggle("dark", isDark);
      localStorage.setItem("theme", theme);

      if (isSafari) {
        requestAnimationFrame(() => {
          setTimeout(() => html.classList.remove("transition-disabled"), 150);
        });
      }
    };

    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [theme]);

  return (
    <GlobalContext.Provider
      value={{
        wifiConfig,
        wifiString,
        theme,
        setTheme,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobal must be used within GlobalProvider");
  return ctx;
};
