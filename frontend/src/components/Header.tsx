import ThemeSwitcher from "@/components/utils/ThemeSwitcher";

export default function Header() {
  return (
    <header className="bg-surface border-b border-default safe-top sticky top-0 z-7000">
      <div className="max-w-95/100 mx-auto flex items-center justify-between px-4 py-4">
        <h1 className="text-xl md:text-2xl font-semibold text-brand">
          UniFi Voucher Manager
        </h1>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
