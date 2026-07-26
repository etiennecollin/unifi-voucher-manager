"use client";

import { Theme } from "@/components/utils/ThemeSwitcher";
import { useServerEvents } from "@/hooks/useServerEvents";
import { DEFAULT_RUNTIME_CONFIG, RuntimeConfig } from "@/types/config";
import {
  generateWifiConfig,
  generateWiFiQRString,
  WifiConfig,
} from "@/utils/wifi";
import React, { createContext, useContext, useEffect, useState } from "react";

type GlobalContextType = {
  runtimeConfig: RuntimeConfig;
  wifiConfig: WifiConfig | null;
  wifiString: string | null;
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

type GlobalProviderProps = {
  children: React.ReactNode;
};

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [runtimeConfig, setRuntimeConfig] = useState<RuntimeConfig>(
    DEFAULT_RUNTIME_CONFIG,
  );
  const [wifiConfig, setWifiConfig] = useState<WifiConfig | null>(null);
  const [wifiString, setWifiString] = useState<string | null>(null);

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    const stored = localStorage.getItem("theme");

    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }

    return "system";
  });

  useServerEvents();

  // Load runtime configuration once after app startup
  useEffect(() => {
    async function loadRuntimeConfig() {
      try {
        const response = await fetch("/api/runtime-config", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Runtime config request failed: ${response.status}`);
        }

        const config: RuntimeConfig = await response.json();
        setRuntimeConfig(config);

        const generatedWifiConfig = generateWifiConfig(config);
        const generatedWifiString = generateWiFiQRString(generatedWifiConfig);

        setWifiConfig(generatedWifiConfig);
        setWifiString(generatedWifiString);
      } catch (error) {
        console.warn("Could not load runtime configuration:", error);
      }
    }

    loadRuntimeConfig();
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
        runtimeConfig,
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
