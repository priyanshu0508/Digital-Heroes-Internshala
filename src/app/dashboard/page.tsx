import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import CompleteProfileForm from '@/components/auth/CompleteProfileForm'
import { Trophy, Clock, Star, Zap, Edit, Gift, Upload, CheckCircle2 } from 'lucide-react'
import { addScore, updateCharity, submitWinnerProof } from './actions'
import { getMonthYear, formatCurrency } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch all charities (useful for both dashboard and recovery)
  const { data: charitiesList } = await supabase.from('charities').select('id, name').order('name')

  // Fetch Profile and Charity
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*, charities(name, image_url)')
    .eq('id', user.id)
    .single()
    
  if (!profile) {
    return (
      <>
        <Navbar user={user} isAdmin={false} />
        <main className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
          <CompleteProfileForm charities={charitiesList} />
        </main>
      </>
    )
  }

  // Fetch Scores
  const { data: scores } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5)

  // Format Date constraint (max = today)
  const today = new Date().toISOString().split('T')[0]

  // Check Current Draw & Winnings
  const currentMonth = getMonthYear()
  const { data: currentDraw } = await supabase
    .from('draws')
    .select('*')
    .eq('month_year', currentMonth)
    .single()

  let winRecord = null
  if (currentDraw) {
    const { data: w } = await supabase
      .from('winners')
      .select('*')
      .eq('user_id', user.id)
      .eq('draw_id', currentDraw.id)
      .single()
    winRecord = w
  }

  return (
    <>
      <Navbar user={user} isAdmin={profile.is_admin} />
      
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* WINNER BANNER */}
          {winRecord && (
            <div className="card border-green-500 bg-gradient-to-br from-green-500/10 to-cyan-500/10 mb-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Gift className="w-48 h-48 text-green-500" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold text-green-400 flex items-center gap-2 mb-2">
                    <Trophy className="w-8 h-8" /> YOU WON!
                  </h2>
                  <p className="text-[var(--color-text)]">
                    Congratulations! You matched <strong className="text-white">{winRecord.match_tier} numbers</strong> in the {currentMonth} draw and won <strong className="text-green-400 text-xl">{formatCurrency(winRecord.prize_amount)}</strong>!
                  </p>
                </div>
                <div className="w-full md:w-auto bg-[var(--color-surface)]/50 p-4 rounded-xl border border-green-500/30">
                  {winRecord.payment_status === 'paid' ? (
                     <div className="flex items-center gap-2 text-green-400 font-bold justify-center px-4 py-2">
                       <CheckCircle2 className="w-6 h-6" /> Prize Paid Out!
                     </div>
                  ) : winRecord.proof_url ? (
                     <div className="flex flex-col items-center gap-1 text-amber-400 px-4">
                       <Clock className="w-5 h-5 mb-1" />
                       <span className="font-bold">Claim Under Review</span>
                       <span className="text-xs text-[var(--color-muted)] text-center min-w-[200px]">Verifying your uploaded proof.</span>
                     </div>
                  ) : (
                     <form action={submitWinnerProof} className="space-y-2 min-w-[220px]">
                       <input type="hidden" name="winnerId" value={winRecord.id} />
                       <label className="text-xs font-semibold text-[var(--color-muted)] block">Submit Payment Link / ID Link:</label>
                       <input type="url" name="proofUrl" required placeholder="https://..." className="input-field text-xs py-1.5 bg-black/50 w-full" />
                       <button type="submit" className="w-full py-1.5 flex justify-center items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold text-xs rounded transition-colors shadow-lg shadow-green-500/20 mt-2">
                         <Upload className="w-3.5 h-3.5" /> Submit Claim
                       </button>
                     </form>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold pb-1">
                Welcome back, <span className="gradient-text">{profile.full_name || 'Hero'}</span>
              </h1>
              <p className="text-[var(--color-muted)]">Manage your entries, scores, and charity giving.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`badge-${profile.sub_status === 'active' ? 'active' : profile.sub_status === 'trialing' ? 'pending' : 'inactive'} px-4 py-2`}>
                <span className="w-2 h-2 rounded-full bg-current opacity-70"></span>
                Subscription: {profile.sub_status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: Actions & Settings */}
            <div className="md:col-span-1 space-y-6">
              
              {/* Add Score Box */}
              <div className="card glass-hover relative overflow-hidden ring-1 ring-violet-500/20">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 to-cyan-500" />
                <h3 className="font-bold flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-violet-400" /> Log a Score
                </h3>
                <p className="text-xs text-[var(--color-muted)] mb-4">
                  Log your latest 18-hole Stableford score. Only your 5 most recent scores count towards the draw map!
                </p>
                <form action={addScore} className="space-y-3">
                  <div>
                    <input 
                      type="number" 
                      name="score" 
                      min="1" 
                      max="45" 
                      required 
                      placeholder="Stableford Score (1-45)" 
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <input 
                      type="date" 
                      name="date" 
                      max={today} 
                      required 
                      className="input-field text-sm"
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full text-sm py-2">
                    Submit Score
                  </button>
                </form>
              </div>

              {/* Charity Management */}
              <div className="card glass-hover">
                <h3 className="font-bold flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-amber-500" /> Giving Back
                </h3>
                {profile.charities ? (
                  <div className="mb-4">
                    <p className="text-sm font-semibold">{profile.charities.name}</p>
                    <p className="text-xs text-[var(--color-muted)]">{profile.charity_pct}% of your sub goes here</p>
                  </div>
                ) : (
                  <p className="text-sm text-red-400 mb-4">No charity selected!</p>
                )}
                
                <form action={updateCharity} className="space-y-3 pt-2 border-t border-[var(--color-border)]">
                  <label className="text-xs font-semibold text-[var(--color-muted)]">Change Charity:</label>
                  <select key={profile.charity_id} name="charityId" required defaultValue={profile.charity_id || ''} className="input-field text-sm bg-[var(--color-surface)]">
                    <option value="" disabled>Select a charity</option>
                     {charitiesList?.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                  </select>
                  <button type="submit" className="btn-secondary w-full text-sm py-1.5 flex items-center justify-center gap-1">
                    <Edit className="w-3.5 h-3.5" /> Update
                  </button>
                </form>
              </div>
              
              {/* Stripe Billing Portal / Checkout */}
              <div className="card glass-hover">
                 <h3 className="font-bold mb-2 text-sm flex justify-between items-center">
                   Billing & Plan
                   {profile.plan === 'yearly' && <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">Yearly</span>}
                 </h3>
                 
                 {profile.sub_status === 'active' ? (
                   <>
                     <p className="text-xs text-[var(--color-muted)] mb-4">Manage your subscription, update payment methods, or cancel.</p>
                     <a href="/api/stripe/portal" className="btn-secondary w-full text-sm py-2 block text-center">
                        Manage Subscription
                     </a>
                   </>
                 ) : (
                   <div className="space-y-3">
                     <p className="text-xs text-[var(--color-muted)] mb-2">Activate your subscription to lock in your charity and start winning!</p>
                     <a href="/api/stripe/checkout?plan=monthly" className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20">
                        <Zap className="w-4 h-4" /> Subscribe (£9.99/mo)
                     </a>
                     <a href="/api/stripe/checkout?plan=yearly" className="w-full text-sm py-2 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20">
                        <Star className="w-4 h-4" /> Go Yearly (£99/yr)
                     </a>
                   </div>
                 )}
              </div>

            </div>

            {/* RIGHT COLUMN: Scores & History */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Active Draw Numbers */}
              <div className="card glass-hover">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400" /> Your Numbers for this Month
                  </h3>
                  {currentDraw ? (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]">Draw Executed</span>
                  ) : (
                    <span className="text-xs bg-violet-500/20 text-violet-300 px-2.5 py-1 rounded-full font-medium">Draw closes soon</span>
                  )}
                </div>
                
                {(!scores || scores.length === 0) ? (
                  <div className="py-8 text-center border-2 border-dashed border-[var(--color-border)] rounded-xl">
                    <p className="text-[var(--color-muted)] text-sm mb-2">You haven't logged any scores yet.</p>
                    <p className="text-xs text-[var(--color-accent)] font-medium">Log your first score to enter the draw!</p>
                  </div>
                ) : (
                  <div>
                    {currentDraw && (
                       <div className="mb-4 p-3 bg-[var(--color-surface)]/50 rounded-lg border border-[var(--color-border)] text-center">
                         <p className="text-xs text-[var(--color-muted)] mb-2 uppercase font-bold tracking-wider">Official Winning Numbers</p>
                         <div className="flex gap-2 justify-center">
                           {currentDraw.winning_numbers.map((n: number, i: number) => (
                              <span key={i} className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-xs font-bold shadow-inner">{n}</span>
                           ))}
                         </div>
                       </div>
                    )}

                    <div className="flex gap-3 mt-4 mb-6 justify-center sm:justify-start">
                      {/* Show current scores as balls */}
                      {Array.from({ length: 5 }).map((_, i) => {
                        const s = scores[i]
                        const isMatch = s && currentDraw?.winning_numbers?.includes(s.score)
                        
                        let ballClasses = 'bg-[var(--color-surface)] text-[var(--color-muted)] border border-dashed border-[var(--color-border)] opacity-50'
                        if (s) {
                          if (currentDraw) {
                             ballClasses = isMatch 
                               ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-green-500/30 ring-2 ring-white/20' 
                               : 'bg-[var(--color-surface)] text-[var(--color-muted)] border border-[var(--color-border)] opacity-40'
                          } else {
                             ballClasses = 'bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-violet-500/30 ring-2 ring-white/10'
                          }
                        }

                        return (
                          <div key={i} className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all ${ballClasses}`}>
                            {s ? s.score : '?'}
                          </div>
                        )
                      })}
                    </div>
                    {scores.length < 5 && !currentDraw && (
                      <p className="text-xs text-amber-400/80">
                        * You need {5 - scores.length} more scores to maximize your chances! Missing slots won't match any numbers.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Score History */}
              <div className="card">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-cyan-400" /> Recent History
                </h3>
                
                {(!scores || scores.length === 0) ? (
                   <p className="text-sm text-[var(--color-muted)] italic">No history available.</p>
                ) : (
                   <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                       <thead className="text-xs text-[var(--color-muted)] uppercase bg-[var(--color-surface)]/50">
                         <tr>
                           <th className="px-4 py-3 rounded-tl-lg">Date Played</th>
                           <th className="px-4 py-3">Score</th>
                           <th className="px-4 py-3 rounded-tr-lg">Logged On</th>
                         </tr>
                       </thead>
                       <tbody>
                         {scores.map((s) => (
                           <tr key={s.id} className="border-b border-[var(--color-border)]/50 last:border-0 hover:bg-[var(--color-surface)]/30 transition-colors">
                             <td className="px-4 py-3 text-[var(--color-text)]">{s.date}</td>
                             <td className="px-4 py-3 font-bold text-violet-400">{s.score} pts</td>
                             <td className="px-4 py-3 text-[var(--color-muted)] text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </main>
    </>
  )
}
