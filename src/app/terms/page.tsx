import { createClient } from '@/lib/supabase/server'
import { ShieldCheck, Scale, CreditCard, Dices, Info } from 'lucide-react'
import DocumentLayout from '@/components/legal/DocumentLayout'

export default async function TermsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    isAdmin = profile?.is_admin || false
  }

  const sections = [
    { id: 'eligibility', title: '1. Eligibility' },
    { id: 'subscription', title: '2. The Subscription' },
    { id: 'draws', title: '3. Prize Draws & Winning' },
    { id: 'scores', title: '4. Rolling Scores' },
  ]

  return (
    <DocumentLayout
      title="Terms of"
      subtitle="Service"
      iconName="Scale"
      lastUpdated="April 20, 2024"
      user={user}
      isAdmin={isAdmin}
    >
      <section id="eligibility" className="scroll-mt-32">
        <div className="card glass p-8 sm:p-10 hover:ring-1 ring-violet-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6">
            <ShieldCheck className="w-5 h-5 text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">1. Eligibility</h2>
          <p className="text-[var(--color-muted)] leading-relaxed">
            Digital Heroes is a premium subscription platform designed specifically for golfers aged **18 and over**
            residing in the United Kingdom. By creating an account and subscribing, you legally confirm that you meet
            these age requirements and that participating in prize draws is permitted by the laws of your jurisdiction.
          </p>
        </div>
      </section>

      <section id="subscription" className="scroll-mt-32">
        <div className="card glass p-8 sm:p-10 hover:ring-1 ring-cyan-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6">
            <CreditCard className="w-5 h-5 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">2. The Subscription</h2>
          <div className="space-y-4 text-[var(--color-muted)] leading-relaxed">
            <p>
              Your subscription provides you with 5 monthly entries into the Digital Heroes prize draw.
              Subscription fees help maintain the platform, fund the prize pools, and support charitable initiatives.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="font-bold text-white mb-1">Monthly Plan</div>
                <div className="text-sm">£9.99 billed every 30 days</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="font-bold text-white mb-1">Yearly Plan</div>
                <div className="text-sm">£99 billed annually</div>
              </div>
            </div>
            <p className="text-sm italic pt-2">
              ⚠️ Note: At least 10% of every payment is automatically allocated to your chosen charity partner.
            </p>
          </div>
        </div>
      </section>

      <section id="draws" className="scroll-mt-32">
        <div className="card glass p-8 sm:p-10 hover:ring-1 ring-amber-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6">
            <Dices className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">3. Prize Draws & Winning</h2>
          <p className="text-[var(--color-muted)] leading-relaxed">
            All draws take place on the **1st of every month**. Winning numbers are generated using a
            fully transparent, cryptographically secure random number generator (RNG). Winners are
            automatically notified via email, and cash prizes are distributed to verified accounts
            within 14 business days.
          </p>
        </div>
      </section>

      <section id="scores" className="scroll-mt-32">
        <div className="card glass p-8 sm:p-10 hover:ring-1 ring-pink-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center mb-6">
            <Info className="w-5 h-5 text-pink-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">4. Rolling Scores</h2>
          <p className="text-[var(--color-muted)] leading-relaxed">
            Participants are responsible for logging their 5 latest Stableford scores. These scores
            serve as your unique "ticket numbers" for the month. To maintain fairness, any empty
            slots in your entry profile will be filled by the system with random numbers (1-45)
            prior to the draw deadline.
          </p>
        </div>
      </section>

      <div className="pt-12 text-center text-sm text-[var(--color-muted)] border-t border-[var(--color-border)]">
        Digital Heroes is a platform operated by DH Platforms Ltd.
        Registration No: 12345678. Registered in England & Wales.
      </div>
    </DocumentLayout>
  )
}
