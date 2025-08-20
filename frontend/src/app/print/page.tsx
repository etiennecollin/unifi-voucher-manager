"use client";

import "./styles.css";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
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

export type PrintMode = "list" | "grid";

function VoucherBlock({ voucher }: { voucher: Voucher }) {
  const { wifiConfig, wifiString } = useGlobal();

  return (
    <div className="print-voucher">
      <div className="print-header">
        <div className="print-title">WiFi Access Voucher</div>
      </div>

      <div className="print-voucher-code">{formatCode(voucher.code)}</div>

      <div className="print-info-row">
        <span className="print-label">Duration:</span>
        <span className="print-value">
          {formatDuration(voucher.timeLimitMinutes)}
        </span>
      </div>
      <div className="print-info-row">
        <span className="print-label">Max Guests:</span>
        <span className="print-value">
          {formatMaxGuests(voucher.authorizedGuestLimit)}
        </span>
      </div>
      <div className="print-info-row">
        <span className="print-label">Data Limit:</span>
        <span className="print-value">
          {voucher.dataUsageLimitMBytes
            ? formatBytes(voucher.dataUsageLimitMBytes * 1024 * 1024)
            : "Unlimited"}
        </span>
      </div>
      <div className="print-info-row">
        <span className="print-label">Down Speed:</span>
        <span className="print-value">
          {formatSpeed(voucher.rxRateLimitKbps)}
        </span>
      </div>
      <div className="print-info-row">
        <span className="print-label">Up Speed:</span>
        <span className="print-value">
          {formatSpeed(voucher.txRateLimitKbps)}
        </span>
      </div>

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

function Vouchers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [mode, setMode] = useState<PrintMode>("list");
  const lastSearchParams = useRef<string | null>(null);

  useEffect(() => {
    const paramString = searchParams.toString();
    if (lastSearchParams.current === paramString) {
      return;
    }
    lastSearchParams.current = paramString;

    const vouchersParam = searchParams.get("vouchers");
    const modeParam = searchParams.get("mode");

    if (!vouchersParam || !modeParam) {
      return;
    }

    try {
      const parsedVouchers = JSON.parse(decodeURIComponent(vouchersParam));
      setVouchers(parsedVouchers);
      setMode(modeParam as PrintMode);

      setTimeout(() => {
        window.print();
        router.replace("/");
      }, 100);
    } catch (error) {
      console.error("Failed to parse vouchers:", error);
    }
  }, [searchParams, router]);

  return !vouchers.length ? (
    <div style={{ textAlign: "center" }}>
      No vouchers to print, press backspace
    </div>
  ) : (
    <div className={mode === "grid" ? "print-grid" : "print-list"}>
      {vouchers.map((v) => (
        <VoucherBlock key={v.id} voucher={v} />
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

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [router]);

  return (
    <div className="print-wrapper">
      <Suspense
        fallback={<div style={{ textAlign: "center" }}>Loading...</div>}
      >
        <Vouchers />
      </Suspense>
    </div>
  );
}
