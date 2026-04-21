import { createClient } from '@/lib/supabase/server'
import { Eye, ShieldCheck, Lock, Globe, Database, UserCheck } from 'lucide-react'
import DocumentLayout from '@/components/legal/DocumentLayout'

export default async function PrivacyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    isAdmin = profile?.is_admin || false
  }

  return (
    <DocumentLayout
      title="Privacy"
      subtitle="Policy"
      iconName="Eye"
      lastUpdated="April 20, 2024"
      user={user}
      isAdmin={isAdmin}
    >
      <section id="collection" className="scroll-mt-32">
        <div className="card glass p-8 sm:p-10 hover:ring-1 ring-cyan-500/30 transition-all group">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">1. Data Collection</h2>
              <div className="space-y-4 text-[var(--color-muted)] leading-relaxed">
                <p>
                  We collect your personal information (Name, Email, and Golfing Scores) solely to manage your 
                  membership and calculate prize draw eligibility.
                </p>
                <p>
                  We also collect technical data like IP addresses to prevent fraudulent score entries and 
                  ensure the platform remains fair for all heroes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="scroll-mt-32">
        <div className="card glass p-8 sm:p-10 hover:ring-1 ring-violet-500/30 transition-all group">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">2. Deep Security</h2>
              <div className="space-y-4 text-[var(--color-muted)] leading-relaxed">
                <p>
                  Your safety is our priority. We use **Supabase Auth** for industry-standard encryption 
                  of your user data.
                </p>
                <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-bold text-white">Stripe Integration</span>
                  </div>
                  <p className="text-xs">
                    All payment processing is handled by Stripe. Digital Heroes never stores your 
                    credit card details on its own servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="rights" className="scroll-mt-32">
        <div className="card glass p-8 sm:p-10 hover:ring-1 ring-amber-500/30 transition-all group">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">3. Your Rights</h2>
              <div className="space-y-4 text-[var(--color-muted)] leading-relaxed">
                <p>
                  Under GDPR, you have the right to access, download, or delete your data at any time. 
                  Digital Heroes guarantees that we will never sell your data to third-party marketing firms.
                </p>
                <p>
                  To exercise your rights, please reach out to our data protection officer at 
                  <span className="text-white font-medium ml-1">privacy@digitalheroes.com</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cookies" className="scroll-mt-32">
        <div className="card glass p-8 sm:p-10 hover:ring-1 ring-pink-500/30 transition-all group">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">4. Cookies & Analytics</h2>
              <p className="text-[var(--color-muted)] leading-relaxed">
                We use essential cookies to keep you logged in and functional cookies to remember your 
                charity preferences. Our analytics tools are anonymized and used only to improve the 
                user experience of our prize draw platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="pt-12 text-center">
        <p className="text-sm text-[var(--color-muted)]">
          Questions about this policy? We're here to help.
        </p>
        <a href="mailto:support@digitalheroes.com" className="text-violet-400 hover:text-violet-300 font-medium text-sm mt-2 inline-block transition-colors underline underline-offset-4">
          Contact Support
        </a>
      </div>
    </DocumentLayout>
  )
}
