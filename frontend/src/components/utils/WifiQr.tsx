"use client";

import React, { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useGlobal } from "@/contexts/GlobalContext";

type Props = {
  className?: string;
  /** Fraction of the smaller parent dimension to use for the QR (0 < n <= 1). Default 0.8 */
  sizeRatio?: number;
  /** Fixed size override (in px). If provided, this takes precedence over automatic sizing. */
  overrideSize?: number;
  /** URL for the logo inside the QR. Default uses /logo.svg. */
  imageSrc?: string;
};

export default function WifiQr({
  className,
  sizeRatio = 0.8,
  overrideSize,
  imageSrc = "/logo.svg",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [qrSize, setQrSize] = useState<number>(220);
  const { wifiConfig, wifiString } = useGlobal();

  useEffect(() => {
    if (overrideSize && overrideSize > 0) {
      setQrSize(Math.floor(overrideSize));
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    function updateFromRect(width: number, height: number) {
      const fromWidth = width * sizeRatio;
      const fromHeight = height * sizeRatio;
      const newSize = Math.max(32, Math.floor(Math.min(fromWidth, fromHeight)));
      setQrSize(newSize);
    }

    // Initial measurement
    const rect = element.getBoundingClientRect();
    updateFromRect(rect.width, rect.height);

    // Observe size changes of the parent container
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const contentRect = entry.contentRect;
        updateFromRect(contentRect.width, contentRect.height);
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [sizeRatio, overrideSize]);

  const imageSettings = imageSrc
    ? {
        src: imageSrc,
        height: Math.floor(qrSize / 4),
        width: Math.floor(qrSize / 4),
        excavate: true,
      }
    : undefined;

  return (
    <div ref={containerRef} className={`flex-center ${className}`}>
      <div className="flex-center flex-col gap-4 text-center">
        {wifiConfig && wifiString ? (
          <>
            <QRCodeSVG
              value={wifiString}
              size={qrSize}
              level="H"
              bgColor="transparent"
              fgColor="currentColor"
              title={`Wi-Fi access: ${wifiConfig.ssid}`}
              imageSettings={imageSettings}
            />
            <p className="text-sm text-muted">
              Scan to join <strong>{wifiConfig.ssid}</strong>
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">No Wi‑Fi credentials configured.</p>
        )}
      </div>
    </div>
  );
}
