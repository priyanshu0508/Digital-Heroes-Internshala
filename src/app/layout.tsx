import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Digital Heroes | Monthly Prize Draw for Golfers & Charity',
    template: '%s | Digital Heroes',
  },
  description:
    'Join Digital Heroes – the subscription-based monthly prize draw where golfers compete with Stableford scores, win life-changing prizes, and give back to charity.',
  keywords: ['golf prize draw', 'charity golf', 'Stableford', 'monthly draw', 'golf subscription'],
  openGraph: {
    type: 'website',
    title: 'Digital Heroes | Monthly Prize Draw',
    description: 'Win prizes. Change lives. Play for a cause.',
    siteName: 'Digital Heroes',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
        {children}
      </body>
    </html>
  )
}
