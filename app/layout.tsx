import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.giftra.co.in'),
  title: {
    default: 'Giftra - Custom Gifts from Real Artists',
    template: '%s | Giftra',
  },
  description: 'Browse custom gift artwork, compare anonymous artist portfolios, save favorites, and raise personalized gift requests through a protected marketplace workflow.',
  applicationName: 'Giftra',
  keywords: ['custom gifts', 'personalized gifts', 'artist marketplace', 'handmade gifts', 'custom portraits', 'gift artists'],
  openGraph: {
    type: 'website',
    url: 'https://www.giftra.co.in',
    siteName: 'Giftra',
    title: 'Giftra - Custom Gifts from Real Artists',
    description: 'Explore custom gift samples by category and artist, then request a personalized version for your occasion.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Giftra - Custom Gifts from Real Artists',
    description: 'Browse, favorite, and request custom gifts from curated artists.',
  },
  generator: 'Giftra',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased min-h-screen">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
