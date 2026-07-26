import { GlobalProvider } from "@/contexts/GlobalContext";
import "./globals.css";
import type { Metadata } from "next";

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
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="antialiased">
        <GlobalProvider>{children}</GlobalProvider>
      </body>
    </html>
  );
}
