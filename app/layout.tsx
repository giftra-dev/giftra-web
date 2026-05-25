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
  title: "Giftra - AI-Powered Gifting Made Personal",
  description:
    "Transform your gift-giving with AI-powered recommendations, relationship tracking, and a curated marketplace. Never miss another special occasion.",
  keywords: [
    "gift giving",
    "AI gifts",
    "gift recommendations",
    "relationship management",
    "occasion reminders",
    "gift marketplace",
  ],
  authors: [{ name: "Giftra" }],
  openGraph: {
    title: "Giftra - AI-Powered Gifting Made Personal",
    description:
      "Transform your gift-giving with AI-powered recommendations, relationship tracking, and a curated marketplace.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Giftra - AI-Powered Gifting Made Personal",
    description:
      "Transform your gift-giving with AI-powered recommendations, relationship tracking, and a curated marketplace.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f5ff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1625" },
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
