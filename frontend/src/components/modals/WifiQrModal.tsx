"use client";

import { useRef, useState, useEffect } from "react";
import Modal from "@/components/modals/Modal";
import { QRCodeSVG } from "qrcode.react";
import { generateWiFiQRString, WifiConfig } from "@/utils/wifi";

type Props = {
  wifiConfig: WifiConfig;
  onClose: () => void;
};

export default function WifiQrModal({ wifiConfig, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [qrSize, setQrSize] = useState(220);
  const wifiString = wifiConfig && generateWiFiQRString(wifiConfig);
  console.log(wifiString);

  useEffect(() => {
    function updateSize() {
      if (modalRef.current) {
        // Make sure the QR code scales with the size of the modal
        const modalWidth = modalRef.current.offsetWidth;
        const modalHeight = modalRef.current.offsetHeight;
        const sizeFromWidth = modalWidth * 0.8;
        const sizeFromHeight = modalHeight * 0.8;
        setQrSize(Math.floor(Math.min(sizeFromWidth, sizeFromHeight)));
      }
    }
    updateSize();

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <Modal ref={modalRef} onClose={onClose} contentClassName="max-w-md">
      <div className="flex-center flex-col gap-4">
        <h2 className="text-2xl font-bold text-primary text-center">
          Wi‑Fi QR Code
        </h2>
        {wifiString ? (
          <>
            <QRCodeSVG
              value={wifiString}
              size={qrSize}
              level="H"
              bgColor="transparent"
              fgColor="currentColor"
              marginSize={4}
              title="Wi-Fi Access QR Code"
              imageSettings={{
                src: "/unifi.svg",
                height: qrSize / 4,
                width: qrSize / 4,
                excavate: true,
              }}
            />
            <p className="text-sm text-muted">
              Scan this QR code to join the network:{" "}
              <strong>{wifiConfig.ssid}</strong>
            </p>
          </>
        ) : (
          <p className="text-sm text-muted text-center">
            No Wi‑Fi credentials configured.
          </p>
        )}
      </div>
    </Modal>
  );
}
