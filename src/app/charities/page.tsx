import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Heart, ChevronLeft, ShieldCheck, Globe } from 'lucide-react'

export default async function CharitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    isAdmin = profile?.is_admin || false
  }

  const { data: charities } = await supabase.from('charities').select('*').order('name')

  return (
    <>
      <Navbar user={user} isAdmin={isAdmin} />
      
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex justify-start">
            <Link href="/" className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-white transition-colors group">
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Home
            </Link>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Heart className="w-3 h-3 text-pink-500 fill-pink-500" /> Play with Purpose
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold mb-6">
              Our Partner <span className="gradient-text">Charities</span>
            </h1>
            <p className="text-lg text-[var(--color-muted)] leading-relaxed">
              At Digital Heroes, we believe winning is better when it's shared. 
              We've partnered with the UK's leading organizations to ensure your membership 
              makes a real-world impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities?.map((c) => (
              <div key={c.id} className="card glass-hover relative overflow-hidden flex flex-col h-full group">
                <div className="absolute top-0 right-0 p-4">
                   <ShieldCheck className="w-5 h-5 text-green-400 opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h3 className="text-xl font-bold mb-3 pr-8">{c.name}</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed mb-8 flex-grow">
                  {c.description || "A dedicated partner committed to making a difference in the community through sustained support and impactful initiatives."}
                </p>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">Verified Partner</span>
                  </div>
                  {c.website_url && (
                    <a href={c.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                      <Globe className="w-3 h-3" /> Visit Website
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-12 text-center">
             <div className="card max-w-2xl mx-auto py-10 bg-gradient-to-br from-violet-600/5 to-cyan-500/5 ring-1 ring-violet-500/20">
                <h2 className="text-2xl font-bold mb-4">Want to nominate a charity?</h2>
                <p className="text-[var(--color-muted)] mb-8">We are always looking to expand our impact. If you have a cause close to your heart, let us know.</p>
                <Link href="/auth/signup" className="btn-primary px-8">
                  Start Helping Today
                </Link>
             </div>
          </div>
        </div>
      </main>
    </>
  )
}
