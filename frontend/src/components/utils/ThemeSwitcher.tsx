import { useGlobal } from "@/contexts/GlobalContext";

export type Theme = "system" | "light" | "dark";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useGlobal();

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as Theme)}
      className="text-sm"
      aria-label="Select theme"
    >
      <option value="system">⚙️ System</option>
      <option value="light">🌞 Light</option>
      <option value="dark">🌙 Dark</option>
    </select>
  );
}
