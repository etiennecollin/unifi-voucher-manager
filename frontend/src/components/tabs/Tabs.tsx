"use client";

import CustomCreateTab from "@/components/tabs/CustomCreateTab";
import TestTab from "@/components/tabs/TestTab";
import QuickCreateTab from "@/components/tabs/QuickCreateTab";
import VouchersTab from "@/components/tabs/VouchersTab";
import { useState } from "react";

const TAB_CONFIG = [
  {
    id: "vouchers",
    label: "View Vouchers",
    component: VouchersTab,
    enabled: true,
  },
  {
    id: "quick",
    label: "Quick Create",
    component: QuickCreateTab,
    enabled: true,
  },
  {
    id: "custom",
    label: "Custom Create",
    component: CustomCreateTab,
    enabled: true,
  },
  {
    id: "test",
    label: "Test",
    component: TestTab,
    enabled: false,
  },
] as const;

// Get enabled tabs and derive types
const enabledTabs = TAB_CONFIG.filter((tab) => tab.enabled);
const tabIds = enabledTabs.map((tab) => tab.id);
type TabId = (typeof tabIds)[number];

export default function Tabs() {
  const [tab, setTab] = useState<TabId>(tabIds[0]);

  return (
    <>
      <nav className="bg-surface border-b border-default flex sticky top-16 z-2000 shadow-soft dark:shadow-soft-dark">
        {enabledTabs.map((tabConfig) => (
          <button
            key={tabConfig.id}
            className={`flex-1 px-4 py-3 ${
              tab === tabConfig.id ? "tab-active" : "tab-inactive"
            }`}
            onClick={() => setTab(tabConfig.id)}
          >
            {tabConfig.label}
          </button>
        ))}
      </nav>
      <div className="p-4 overflow-y-auto">
        {enabledTabs.map((tabConfig) => {
          const Component = tabConfig.component;
          return (
            <div
              key={tabConfig.id}
              className={tab === tabConfig.id ? "" : "hidden"}
            >
              <Component />
            </div>
          );
        })}
      </div>
    </>
  );
}
