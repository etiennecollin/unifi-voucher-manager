"use client";

import "./styles.css";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Voucher } from "@/types/voucher";
import {
  formatBytes,
  formatDuration,
  formatMaxGuests,
  formatSpeed,
} from "@/utils/format";
import { useGlobal } from "@/contexts/GlobalContext";
import { formatCode } from "@/utils/format";
import Spinner from "@/components/utils/Spinner";
import { PrintMode } from "@/types/print";
import { TriState } from "@/types/state";
import WifiQr from "@/components/utils/WifiQr";

// This component represents a single voucher card to be printed
function VoucherPrintCard({ voucher }: { voucher: Voucher }) {
  const { runtimeConfig, wifiConfig, wifiString } = useGlobal();
  const printConfig = runtimeConfig.PRINT_CONFIG;

  const fields = [
    {
      label: "Duration",
      value: formatDuration(voucher.timeLimitMinutes),
      enabled: printConfig.showDuration,
    },
    {
      label: "Max Guests",
      value: formatMaxGuests(voucher.authorizedGuestLimit),
      enabled: printConfig.showMaxGuests,
    },
    {
      label: "Data Limit",
      value: voucher.dataUsageLimitMBytes
        ? formatBytes(voucher.dataUsageLimitMBytes * 1024 * 1024)
        : "Unlimited",
      enabled: printConfig.showDataUsageLimit,
    },
    {
      label: "Down Speed",
      value: formatSpeed(voucher.rxRateLimitKbps),
      enabled: printConfig.showRxRateLimit,
    },
    {
      label: "Up Speed",
      value: formatSpeed(voucher.txRateLimitKbps),
      enabled: printConfig.showTxRateLimit,
    },
  ];

  return (
    <div className="print-voucher">
      <div className="print-header">
        <div className="print-title">WiFi Access Voucher</div>
        <div className="print-voucher-code">{formatCode(voucher.code)}</div>
        {printConfig.showName && voucher.name && (
          <div className="print-name">
            <span className="print-name-label">VOUCHER NAME</span>
            <span className="print-name-value">{voucher.name}</span>
          </div>
        )}
      </div>

      <div className="print-info">
        {fields.map(
          (field) =>
            field.enabled && (
              <div
                key={`${voucher.id}:${field.label}`}
                className="print-info-row"
              >
                <span className="print-label">{field.label}:</span>
                <span className="print-value">{field.value}</span>
              </div>
            ),
        )}
      </div>

      {wifiConfig && wifiConfig.ssid && (
        <div className="print-qr-section">
          {wifiString && (
            <>
              <div className="print-qr-title">Scan to Connect</div>
              <WifiQr
                className="w-full h-50"
                sizeRatio={0.88}
                imageSrc={printConfig.showLogo ? undefined : ""}
              />
            </>
          )}

          <div className="print-network-details">
            <div className="print-credential">
              <span className="print-credential-label">Network</span>
              <span className="print-credential-value">{wifiConfig.ssid}</span>
            </div>

            <div className="print-credential">
              <span className="print-credential-label">Password</span>
              <span className="print-credential-value">
                {wifiConfig.type === "nopass"
                  ? "No password (Open Network)"
                  : wifiConfig.password}
              </span>
            </div>

            {wifiConfig.hidden && (
              <div className="print-network-note">Hidden Network</div>
            )}
          </div>
        </div>
      )}

      {(printConfig.showId || printConfig.showPrintTime) && (
        <div className="print-footer">
          {printConfig.showId && (
            <div className="print-footer-item">
              <span className="print-footer-label">Voucher ID</span>
              <span className="print-footer-value">{voucher.id}</span>
            </div>
          )}

          {printConfig.showPrintTime && (
            <div className="print-footer-item">
              <span className="print-footer-label">Printed On</span>
              <span className="print-footer-value">
                {new Date().toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// This component handles displaying and printing the vouchers
function Vouchers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<TriState>("loading");

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [mode, setMode] = useState<PrintMode>("list");
  const [batchId, setBatchId] = useState<string | null>(null);

  // Load print job
  useEffect(() => {
    setState("loading");

    const id = searchParams.get("batchId");
    if (!id) {
      setState("error");
      return;
    }

    const stored = localStorage.getItem(`print-job-${id}`);
    if (!stored) {
      setState("error");
      return;
    }

    try {
      const { vouchers: storedVouchers, mode: storedMode } = JSON.parse(stored);

      setVouchers(storedVouchers as Voucher[]);
      setMode((storedMode as PrintMode) || "list");
      setBatchId(id);
      setState("ok");
    } catch (error) {
      console.error("Failed to load print job:", error);
      setState("error");
    }
  }, [searchParams]);

  // Print once vouchers exist
  useEffect(() => {
    if (!vouchers.length || !batchId) {
      return;
    }

    const handleAfterPrint = () => {
      localStorage.removeItem(`print-job-${batchId}`);
      router.replace("/");
    };
    window.addEventListener("afterprint", handleAfterPrint);

    const timer = setTimeout(() => {
      window.print();
    }, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [vouchers, batchId]);

  const emptyMessage = (() => {
    switch (state) {
      case "loading":
        return "Loading vouchers... please wait...";
      case "ok":
        return "No vouchers to print, press escape or backspace.";
      case "error":
        return "An error occurred, press escape or backspace.";
    }
  })();

  return !vouchers.length ? (
    <div style={{ textAlign: "center" }}>{emptyMessage}</div>
  ) : (
    <div className={mode === "grid" ? "print-grid" : "print-list"}>
      {vouchers.map((v) => (
        <VoucherPrintCard key={v.id} voucher={v} />
      ))}
    </div>
  );
}

export default function PrintPage() {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Backspace") router.replace("/");
    };
    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <main className="print-wrapper">
      <Suspense fallback={<Spinner />}>
        <Vouchers />
      </Suspense>
    </main>
  );
}
