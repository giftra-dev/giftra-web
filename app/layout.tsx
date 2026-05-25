import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Giftra - Personalized Gifts from Talented Artists",
  description:
    "Connect with skilled artists to create unique, personalized gifts. From custom portraits to handcrafted items, find the perfect gift for every occasion.",
  keywords: [
    "personalized gifts",
    "custom artwork",
    "handmade gifts",
    "artist marketplace",
    "custom portraits",
    "gift marketplace",
    "artisan gifts",
  ],
  authors: [{ name: "Giftra" }],
  openGraph: {
    title: "Giftra - Personalized Gifts from Talented Artists",
    description:
      "Connect with skilled artists to create unique, personalized gifts. From custom portraits to handcrafted items.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Giftra - Personalized Gifts from Talented Artists",
    description:
      "Connect with skilled artists to create unique, personalized gifts. From custom portraits to handcrafted items.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#1a2e1a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.variable} font-sans antialiased`}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
