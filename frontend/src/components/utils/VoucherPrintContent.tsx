"use client";

import { QRCodeSVG } from "qrcode.react";
import { Voucher } from "@/types/voucher";
import {
  formatBytes,
  formatDuration,
  formatGuestUsage,
  formatSpeed,
} from "@/utils/format";
import { RenderInWindow } from "@/components/utils/RenderInWindow";
import { useGlobal } from "@/contexts/GlobalContext";

const baseStyles = `
@media print {
  @page {
    size: 80mm auto;
    margin: 5mm;
  }
}
html, body {
  margin: 0;
  padding: 0;
  background: white !important;
  color: black;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
}
.wrapper {
  max-width: 80mm;
  margin: 0 auto;
  padding: 10px;
}
.header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
.title { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
.voucher-code { font-size: 18px; font-weight: bold; text-align: center; border: 2px solid #000; padding: 10px; margin: 15px 0; }
.info-row { display: flex; justify-content: space-between; margin: 5px 0; border-bottom: 1px dotted #000; }
.label { font-weight: bold; flex: 1; }
.value { flex: 1; text-align: right; }
.qr-section { text-align: center; margin: 20px 0; border-top: 2px solid #000; padding-top: 15px; }
.footer { text-align: center; margin-top: 20px; border-top: 2px solid #000; padding-top: 10px; font-size: 10px; }
`;

type Props = {
  voucher: Voucher;
};

export function VoucherPrintWindow({ voucher }: Props) {
  const { wifiConfig, wifiString } = useGlobal();

  return (
    <RenderInWindow
      title={`Voucher - ${voucher.code}`}
      width={500}
      height={700}
      onReady={(win) => {
        setTimeout(() => win.print(), 100);
      }}
    >
      <div className="wrapper">
        <style>{baseStyles}</style>

        <div className="header">
          <div className="title">WiFi Access Voucher</div>
          <div>UniFi Network</div>
        </div>

        <div className="voucher-code">{voucher.code}</div>

        <div className="info-row">
          <span className="label">Duration:</span>
          <span className="value">
            {formatDuration(voucher.timeLimitMinutes)}
          </span>
        </div>
        <div className="info-row">
          <span className="label">Guests:</span>
          <span className="value">
            {formatGuestUsage(
              voucher.authorizedGuestCount,
              voucher.authorizedGuestLimit,
            )}
          </span>
        </div>
        <div className="info-row">
          <span className="label">Data Limit:</span>
          <span className="value">
            {voucher.dataUsageLimitMBytes
              ? formatBytes(voucher.dataUsageLimitMBytes * 1024 * 1024)
              : "Unlimited"}
          </span>
        </div>
        <div className="info-row">
          <span className="label">Down Speed:</span>
          <span className="value">{formatSpeed(voucher.rxRateLimitKbps)}</span>
        </div>
        <div className="info-row">
          <span className="label">Up Speed:</span>
          <span className="value">{formatSpeed(voucher.txRateLimitKbps)}</span>
        </div>

        {wifiConfig && (
          <div className="qr-section">
            <div className="font-bold mb-2">Scan to Connect</div>
            {wifiString && (
              <QRCodeSVG
                value={wifiString}
                size={140}
                level="H"
                marginSize={4}
                title="Wi-Fi Access QR Code"
              />
            )}
            <div className="wifi-info mt-2 text-xs">
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

        <div className="footer">
          <div>ID: {voucher.id}</div>
          <div>Generated: {new Date().toLocaleString()}</div>
        </div>
      </div>
    </RenderInWindow>
  );
}
