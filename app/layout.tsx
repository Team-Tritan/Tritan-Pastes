import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PlausibleProvider from "next-plausible";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#18181b",
};

export const metadata: Metadata = {
  title: "tritan pastes",
  description: "securely share code, text, messages, with anyone.",
  keywords: ["pastebin", "code sharing", "encrypted paste", "secure paste", "text sharing"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "https://bin.tritan.gg",
    siteName: "tritan pastes",
    title: "tritan pastes",
    description: "securely share code, text, messages, with anyone.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PlausibleProvider
      domain="tritan.gg"
      customDomain="https://bin.tritan.gg"
      selfHosted={true}
      trackLocalhost={true}
      trackOutboundLinks={true}
      enabled={true}
    >
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
      </html>
    </PlausibleProvider>
  );
}
