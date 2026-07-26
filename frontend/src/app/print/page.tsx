"use client";

import "./styles.css";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
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

// This component represents a single voucher card to be printed
function VoucherPrintCard({ voucher }: { voucher: Voucher }) {
  const { wifiConfig, wifiString } = useGlobal();

  const fields = [
    {
      label: "Duration",
      value: formatDuration(voucher.timeLimitMinutes),
    },
    {
      label: "Max Guests",
      value: formatMaxGuests(voucher.authorizedGuestLimit),
    },
    {
      label: "Data Limit",
      value: voucher.dataUsageLimitMBytes
        ? formatBytes(voucher.dataUsageLimitMBytes * 1024 * 1024)
        : "Unlimited",
    },
    {
      label: "Down Speed",
      value: formatSpeed(voucher.rxRateLimitKbps),
    },
    {
      label: "Up Speed",
      value: formatSpeed(voucher.txRateLimitKbps),
    },
  ];

  return (
    <div className="print-voucher">
      <div className="print-header">
        <div className="print-title">WiFi Access Voucher</div>
      </div>

      <div className="print-voucher-code">{formatCode(voucher.code)}</div>

      {fields.map((field) => (
        <div key={`${voucher.id}:${field.label}`} className="print-info-row">
          <span className="print-label">{field.label}:</span>
          <span className="print-value">{field.value}</span>
        </div>
      ))}

      {wifiConfig && (
        <div className="print-qr-section">
          {wifiString && (
            <>
              <div className="font-bold mb-2">Scan to Connect</div>
              <QRCodeSVG
                value={wifiString}
                size={140}
                level="H"
                marginSize={4}
                title="Wi-Fi Access QR Code"
              />
            </>
          )}
          <div className="print-qr-text">
            <strong>Network:</strong> {wifiConfig.ssid}
            <br />
            {wifiConfig.type === "nopass" ? (
              "No Password"
            ) : (
              <>
                <strong>Password:</strong> {wifiConfig.password}
              </>
            )}
            {wifiConfig.hidden && <div>(Hidden Network)</div>}
          </div>
        </div>
      )}

      <div className="print-footer">
        <div>
          <strong className="text-sm">ID:</strong> {voucher.id}
        </div>
        <div>
          <strong className="text-sm">Printed:</strong>{" "}
          {new Date().toUTCString()}
        </div>
      </div>
    </div>
  );
}

// This component handles displaying and printing the vouchers
function Vouchers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<TriState | null>("loading");

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
      default:
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

// This sets up the print page itself
export default function PrintPage() {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Backspace") router.replace("/");
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [router]);

  return (
    <main className="print-wrapper">
      <Suspense fallback={<Spinner />}>
        <Vouchers />
      </Suspense>
    </main>
  );
}
