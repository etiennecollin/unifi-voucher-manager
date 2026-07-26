import { GlobalProvider } from "@/contexts/GlobalContext";
import "./globals.css";
import type { Metadata } from "next";
import { getRuntimeConfig } from "@/utils/config";
import { generateWifiConfig, generateWiFiQRString } from "@/utils/wifi";

export const metadata: Metadata = {
  title: "UniFi Voucher Manager",
  description: "Manage WiFi vouchers with ease",
  authors: [{ name: "etiennecollin", url: "https://etiennecollin.com" }],
  creator: "Etienne Collin",
  robots: {
    index: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = getRuntimeConfig();

  let wifiConfig = null;
  let wifiString = null;

  try {
    wifiConfig = generateWifiConfig(config);
    wifiString = generateWiFiQRString(wifiConfig);
  } catch (error) {
    console.warn("Could not generate WiFi QR configuration:", error);
  }

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="antialiased">
        <GlobalProvider wifiConfig={wifiConfig} wifiString={wifiString}>
          {children}
        </GlobalProvider>
      </body>
    </html>
  );
}
