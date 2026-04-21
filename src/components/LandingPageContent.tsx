'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Trophy, Heart, Zap, Shield, ChevronRight, Star, Users, DollarSign } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const steps = [
  { icon: Shield, title: 'Subscribe', desc: 'Choose Monthly or Yearly plan. Your subscription funds the prize pool and charitable causes.', color: '#8b5cf6' },
  { icon: Zap, title: 'Enter Scores', desc: 'Log up to 5 rolling Stableford scores (1–45). Your latest 5 are your entry numbers for the month.', color: '#06b6d4' },
  { icon: Trophy, title: 'Draw Day', desc: 'Every month we draw 5 winning numbers. Match 3, 4, or all 5 to win a share of the prize pool!', color: '#f59e0b' },
  { icon: Heart, title: 'Give Back', desc: 'Min 10% of your subscription goes directly to your chosen charity. You control the percentage.', color: '#ec4899' },
]

const tiers = [
  { match: 3, pool: '25%', label: 'Bronze', color: '#cd7f32' },
  { match: 4, pool: '35%', label: 'Silver', color: '#c0c0c0' },
  { match: 5, pool: '40%', label: 'Gold – Jackpot', color: '#f59e0b' },
]

const charities = [
  { name: 'Macmillan Cancer Support', tag: 'Health', color: '#22c55e' },
  { name: 'Mind', tag: 'Mental Health', color: '#8b5cf6' },
  { name: 'Sport Relief', tag: 'Community', color: '#f59e0b' },
  { name: 'Age UK', tag: 'Elderly Care', color: '#06b6d4' },
  { name: 'Great Ormond Street', tag: 'Children', color: '#ec4899' },
]

const stats = [
  { value: '£50K+', label: 'Total donated to charities', icon: Heart },
  { value: '2,400+', label: 'Active members', icon: Users },
  { value: '£180K', label: 'Total prize pool distributed', icon: Trophy },
  { value: '100%', label: 'Transparent prize draws', icon: Star },
]

export default function LandingPageContent() {
  return (
    <main className="relative overflow-hidden">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 pb-16">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto"
        >
          <motion.div custom={0} variants={fadeUp} className="mb-6 inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-[var(--color-accent)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
            </span>
            Monthly draw is now open — entries close soon
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6">
            Golf{' '}
            <span className="gradient-text glow-text">differently.</span>
            <br />
            Win prizes.{' '}
            <span className="gradient-text-gold">Change lives.</span>
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} className="text-lg sm:text-xl text-[var(--color-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Digital Heroes is the subscription draw where your Stableford scores become lottery numbers,
            prizes go to real winners, and every pound you play helps fund a cause you believe in.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-primary text-base px-8 py-4">
              Start Playing Today <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/#how-it-works" className="btn-secondary text-base px-8 py-4">
              How It Works
            </Link>
          </motion.div>

          <motion.p custom={4} variants={fadeUp} className="mt-6 text-sm text-[var(--color-muted)]">
            From £9.99/month · Cancel anytime · 10%+ goes to your chosen charity
          </motion.p>
        </motion.div>

        {/* Floating score balls */}
        <motion.div
          className="absolute right-[5%] top-1/3 hidden lg:flex flex-col gap-6"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {[
            { n: 34, label: 'Lucky Entry' },
            { n: 28, label: 'Winning Score' },
            { n: 42, label: 'Jackpot Target' },
            { n: 19, label: 'Charity Match' },
            { n: 37, label: 'Player High' }
          ].map((item, i) => (
            <motion.div
              key={item.n}
              className="flex items-center gap-3"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm glass glow-accent text-[var(--color-accent)]">
                {item.n}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] whitespace-nowrap bg-violet-500/5 px-2 py-1 rounded border border-violet-500/10">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card text-center glass-hover"
            >
              <stat.icon className="w-6 h-6 text-[var(--color-accent)] mx-auto mb-3" />
              <div className="text-3xl font-extrabold gradient-text mb-1">{stat.value}</div>
              <div className="text-xs text-[var(--color-muted)]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-4 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-0 w-[350px] h-[350px] bg-cyan-500/6 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">How <span className="gradient-text">it works</span></h2>
            <p className="text-[var(--color-muted)] text-lg max-w-xl mx-auto">
              Four simple steps between you and a prize draw that actually gives back.
            </p>
          </motion.div>

          <div className="section-grid">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card glass-hover relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
                  style={{ background: step.color }}
                />
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${step.color}20` }}
                >
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                </div>
                <div className="text-xs font-bold text-[var(--color-muted)] mb-2 uppercase tracking-wider">Step {i + 1}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIZE TIERS ── */}
      <section id="prizes" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">Prize <span className="gradient-text-gold">Tiers</span></h2>
            <p className="text-[var(--color-muted)] text-lg max-w-xl mx-auto">
              Match more numbers, win a bigger share. Jackpot carries forward if no one hits 5.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.match}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`card text-center relative overflow-hidden glass-hover ${tier.match === 5 ? 'md:scale-105 ring-1 ring-amber-500/40' : ''}`}
              >
                {tier.match === 5 && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />
                )}
                <div className="text-5xl font-black mb-1" style={{ color: tier.color }}>{tier.pool}</div>
                <div className="text-sm text-[var(--color-muted)] mb-3">of the Prize Pool</div>
                <div className="text-2xl font-bold mb-1">Match <span style={{ color: tier.color }}>{tier.match}</span></div>
                <div className="text-sm font-semibold" style={{ color: tier.color }}>{tier.label}</div>
                {tier.match === 5 && (
                  <div className="mt-3 text-xs text-amber-400/80 glass px-3 py-1.5 rounded-full inline-block">
                    ✨ Jackpot rolls over if no winner
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHARITIES ── */}
      <section id="charities" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">Play with <span className="gradient-text">Purpose</span></h2>
            <p className="text-[var(--color-muted)] text-lg max-w-xl mx-auto">
              Choose a charity that matters to you. At least 10% of every subscription goes there — more if you want.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {charities.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card glass-hover flex items-center gap-3 min-w-[220px]"
              >
                <div
                  className="w-2 h-10 rounded-full flex-shrink-0"
                  style={{ background: c.color }}
                />
                <div>
                  <div className="font-semibold text-sm">{c.name}</div>
                  <div className="text-xs text-[var(--color-muted)]">{c.tag}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-10 text-center"
          >
            <Link href="/charities" className="btn-secondary px-6 py-3">
              View All Charities <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">Simple <span className="gradient-text">Pricing</span></h2>
            <p className="text-[var(--color-muted)] text-lg">Choose monthly flexibility or save with a yearly plan.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Monthly */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card glass-hover"
            >
              <div className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4">Monthly</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-extrabold">£9.99</span>
                <span className="text-[var(--color-muted)] mb-2">/mo</span>
              </div>
              <p className="text-sm text-[var(--color-muted)] mb-6">Full access, cancel anytime.</p>
              <ul className="space-y-2 text-sm mb-8">
                {['Monthly prize draw entry', 'Up to 5 rolling scores', 'Charity contribution (min 10%)', 'Winner verification portal'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-[var(--color-muted)]">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup?plan=monthly" className="btn-secondary w-full py-3">
                Get Started
              </Link>
            </motion.div>

            {/* Yearly */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="card relative overflow-hidden ring-1 ring-violet-500/40 glass-hover"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 to-cyan-500" />
              <div className="absolute top-4 right-4 text-xs font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full">SAVE 17%</div>
              <div className="text-sm font-semibold text-[var(--color-accent)] uppercase tracking-wider mb-4">Yearly · Best Value</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-extrabold gradient-text">£99</span>
                <span className="text-[var(--color-muted)] mb-2">/yr</span>
              </div>
              <p className="text-sm text-[var(--color-muted)] mb-6">That's just £8.25/month. Biggest prize entries.</p>
              <ul className="space-y-2 text-sm mb-8">
                {['Everything in Monthly', 'Priority draw entry', 'Exclusive yearly member badge', 'Dedicated support'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-[var(--color-muted)]">
                    <span className="text-violet-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup?plan=yearly" className="btn-primary w-full py-3">
                Get Best Value
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER STRIP ── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card glass relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-violet-600/10 rounded-full blur-[60px]" />
            </div>
            <div className="relative z-10 py-8">
              <DollarSign className="w-12 h-12 text-[var(--color-accent)] mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Ready to play with <span className="gradient-text">purpose?</span>
              </h2>
              <p className="text-[var(--color-muted)] mb-8 max-w-xl mx-auto">
                Join thousands of golfers in the UK's most meaningful prize draw. Your scores. Your charity. Your chance to win.
              </p>
              <Link href="/auth/signup" className="btn-primary px-10 py-4 text-lg">
                Join Digital Heroes <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-4 border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold gradient-text">Digital Heroes</span>
          </div>
          <div className="flex gap-6 text-sm text-[var(--color-muted)]">
            <Link href="/charities" className="hover:text-[var(--color-text)] transition-colors">Charities</Link>
            <Link href="/draws" className="hover:text-[var(--color-text)] transition-colors">Past Draws</Link>
            <Link href="/terms" className="hover:text-[var(--color-text)] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[var(--color-text)] transition-colors">Privacy</Link>
          </div>
          <p className="text-xs text-[var(--color-muted)]">© 2024 Digital Heroes. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
