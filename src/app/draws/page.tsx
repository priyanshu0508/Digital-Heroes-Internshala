import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import { Trophy, Dices, Calendar, ChevronLeft } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default async function DrawsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get Admin Status
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    isAdmin = profile?.is_admin || false
  }

  // Fetch Published Draws
  const { data: draws } = await supabase
    .from('draws')
    .select('*, winners(count)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <>
      <Navbar user={user} isAdmin={isAdmin} />
      
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex justify-start">
            <Link href="/" className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-white transition-colors group">
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Home
            </Link>
          </div>
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mb-6">
              <Dices className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold pb-2">
              Draw <span className="gradient-text">History</span>
            </h1>
            <p className="text-lg text-[var(--color-muted)]">
              Total transparency. See the winning numbers and prize pools for every month we've operated.
            </p>
          </div>

          {!draws || draws.length === 0 ? (
            <div className="card text-center py-16">
              <h3 className="text-xl font-bold mb-2">No draws have been completed yet.</h3>
              <p className="text-[var(--color-muted)] mb-6">Our first draw is coming up soon. Ensure your numbers are locked in!</p>
              <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {draws.map(draw => (
                <div key={draw.id} className="card glass-hover relative overflow-hidden transition-all hover:scale-[1.02]">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 text-violet-400 font-bold mb-1">
                        <Calendar className="w-4 h-4" /> {draw.month_year}
                      </div>
                      <div className="text-3xl font-extrabold text-white">
                        {formatCurrency(draw.prize_pool)}
                      </div>
                      <div className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold">Total Prize Pool</div>
                    </div>
                    <div className="text-right">
                       <div className="text-4xl px-2">🎉</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-[var(--color-muted)] mb-3">Winning Numbers</p>
                    <div className="flex gap-2">
                      {draw.winning_numbers.map((n: number, i: number) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-500/20">
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-[var(--color-border)]">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium">
                      {(draw.winners?.[0]?.count || 0)} Total Winners
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
