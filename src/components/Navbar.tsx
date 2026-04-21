'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Menu, X, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navLinks = [
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#charities', label: 'Charities' },
  { href: '/#prizes', label: 'Prizes' },
  { href: '/#pricing', label: 'Pricing' },
]

interface NavbarProps {
  user?: { email?: string } | null
  isAdmin?: boolean
}

export default function Navbar({ user, isAdmin }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="glass border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-violet-500/40 transition-shadow">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight gradient-text">Digital Heroes</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth CTA */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors">
                      Admin
                    </Link>
                  )}
                  <Link href="/dashboard" className="btn-secondary text-sm py-2 px-4">
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
                    Log in
                  </Link>
                  <Link href="/auth/signup" className="btn-primary text-sm py-2 px-4">
                    Get Started <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 text-[var(--color-muted)] hover:text-[var(--color-text)]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass border-b border-[var(--color-border)] md:hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-[var(--color-border)] flex flex-col gap-2">
                {user ? (
                  <>
                    <Link href="/dashboard" className="btn-secondary text-sm py-2" onClick={() => setMobileOpen(false)}>
                      Dashboard
                    </Link>
                    <button onClick={handleSignOut} className="text-sm text-left text-[var(--color-muted)]">
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="btn-secondary text-sm py-2" onClick={() => setMobileOpen(false)}>
                      Log in
                    </Link>
                    <Link href="/auth/signup" className="btn-primary text-sm py-2" onClick={() => setMobileOpen(false)}>
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
