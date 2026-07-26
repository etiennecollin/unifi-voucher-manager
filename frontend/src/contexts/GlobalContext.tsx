"use client";

import { Theme } from "@/components/utils/ThemeSwitcher";
import { useServerEvents } from "@/hooks/useServerEvents";
import { WifiConfig } from "@/utils/wifi";
import React, { createContext, useContext, useEffect, useState } from "react";

type GlobalContextType = {
  wifiConfig: WifiConfig | null;
  wifiString: string | null;
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

type GlobalProviderProps = {
  children: React.ReactNode;
  wifiConfig: WifiConfig | null;
  wifiString: string | null;
};

export const GlobalProvider = ({
  children,
  wifiConfig,
  wifiString,
}: GlobalProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    const stored = localStorage.getItem("theme");

    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }

    return "system";
  });
  useServerEvents();

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
