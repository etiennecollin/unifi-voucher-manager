"use client";

import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  type themeType = "system" | "light" | "dark";
  const [theme, setTheme] = useState<themeType>("system");

  // Load saved theme
  useEffect(() => {
    const stored = localStorage.getItem("theme") as themeType | null;
    setTheme(stored || "system");
  }, []);

  // Apply theme class
  useEffect(() => {
    const html = document.documentElement;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    const apply = () => {
      // Only disable transitions on Safari
      if (isSafari) {
        html.classList.add("transition-disabled");
      }

      const isDark = theme === "dark" || (theme === "system" && mql.matches);
      html.classList.toggle("dark", isDark);
      localStorage.setItem("theme", theme);

      // Re-enable transitions after a brief delay (Safari only)
      if (isSafari) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            html.classList.remove("transition-disabled");
          }, 50);
        });
      }
    };

    apply();

    // For system mode, listen to changes
    mql.addEventListener("change", apply);

    return () => {
      mql.removeEventListener("change", apply);
    };
  }, [theme]);

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as any)}
      className="text-sm"
    >
      <option value="system">⚙️ System</option>
      <option value="light">🌞 Light</option>
      <option value="dark">🌙 Dark</option>
    </select>
  );
}
