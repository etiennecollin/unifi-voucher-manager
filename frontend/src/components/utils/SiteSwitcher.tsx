import { useGlobal } from "@/contexts/GlobalContext";

export default function SiteSwitcher() {
  const { availableSites, site, setSite, sitesLoaded } = useGlobal();

  return (
    <div className="flex-center gap-2">
      <label
        htmlFor="site-switcher"
        className="hidden sm:block text-sm text-secondary whitespace-nowrap"
      >
        Site
      </label>

      {!sitesLoaded ? (
        <span className="text-sm text-secondary">Loading...</span>
      ) : availableSites.length === 0 ? (
        <span className="text-sm font-semibold text-status-danger">
          None found
        </span>
      ) : (
        <select
          id="site-switcher"
          value={site}
          onChange={(e) => setSite(e.target.value)}
          className="text-sm w-auto"
          aria-label="Select UniFi site"
        >
          {availableSites.map((siteName) => (
            <option key={siteName} value={siteName}>
              {siteName}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
