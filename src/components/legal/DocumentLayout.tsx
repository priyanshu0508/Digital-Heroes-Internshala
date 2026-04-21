'use client'

import { motion } from 'framer-motion'
import { 
  ChevronLeft, 
  LucideIcon, 
  Scale, 
  ShieldCheck, 
  CreditCard, 
  Dices, 
  Info, 
  Eye, 
  Lock, 
  Globe, 
  Database, 
  UserCheck 
} from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const ICON_MAP: Record<string, LucideIcon> = {
  Scale,
  ShieldCheck,
  CreditCard,
  Dices,
  Info,
  Eye,
  Lock,
  Globe,
  Database,
  UserCheck
}

interface DocumentLayoutProps {
  title: string
  subtitle: string
  iconName: string
  lastUpdated: string
  user: any
  isAdmin: boolean
  children: React.ReactNode
}

export default function DocumentLayout({
  title,
  subtitle,
  iconName,
  lastUpdated,
  user,
  isAdmin,
  children
}: DocumentLayoutProps) {
  const Icon = ICON_MAP[iconName] || Info

  return (
    <>
      <Navbar user={user} isAdmin={isAdmin} />
      
      <main className="min-h-screen pt-32 pb-24 px-4 relative">
        {/* Decorative Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Back to Home Button (Top Left) */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-white transition-colors group">
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl ring-1 ring-white/10"
            >
              <Icon className="w-8 h-8 text-violet-400" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl font-extrabold mb-4"
            >
              {title} <span className="gradient-text">{subtitle}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[var(--color-muted)]"
            >
              Last updated: {lastUpdated}
            </motion.p>
          </div>

          {/* Content Area (Single Column Centered) */}
          <div className="space-y-12">
            {children}
          </div>
        </div>
      </main>
    </>
  )
}
