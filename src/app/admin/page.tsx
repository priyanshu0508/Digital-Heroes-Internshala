import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Navbar from '@/components/Navbar'
import { Users, DollarSign, Dices, Gift, CheckCircle, XCircle } from 'lucide-react'
import { formatCurrency, getMonthYear } from '@/lib/utils'
import { calculateSimulationData, publishDraw, processWinnerClaim, addCharity, deleteCharity } from './actions'

export default async function AdminPage({ searchParams }: { searchParams: { simulate?: string, logic?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  // --- ADMIN STATS ---
  // Active Subscribers
  const { count: activeSubs } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('sub_status', 'active')

  // Total Charities
  const { count: charitiesCount } = await supabaseAdmin
    .from('charities')
    .select('*', { count: 'exact', head: true })

  // Total Prize Pool (rough estimate for demo: activeSubs * £9.99 * 50% pot)
  const estimatedPool = (activeSubs || 0) * 999 * 0.5 

  // Recent Draws
  const { data: draws } = await supabaseAdmin
    .from('draws')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // System status
  const currentMonth = getMonthYear()

  // Check if draw already ran for this month
  const { data: currentDraw } = await supabaseAdmin
    .from('draws')
    .select('id')
    .eq('month_year', currentMonth)
    .single()

  // Active Simulation State
  let simulationStr = null
  let sim = null
  if (!currentDraw && searchParams?.simulate === 'true') {
    const logic = (searchParams?.logic === 'algorithmic' ? 'algorithmic' : 'random') as 'random' | 'algorithmic'
    simulationStr = await calculateSimulationData(logic)
    if (simulationStr) sim = JSON.parse(simulationStr)
  }

  // Pending Claims
  const { data: pendingClaims } = await supabaseAdmin
    .from('winners')
    .select('*, profiles(full_name, email), draws(month_year, prize_pool)')
    .eq('payment_status', 'pending')
    .not('proof_url', 'is', null)

  return (
    <>
      <Navbar user={user} isAdmin={true} />
      
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div>
            <h1 className="text-3xl font-extrabold pb-1">System <span className="gradient-text">Admin</span></h1>
            <p className="text-[var(--color-muted)]">Manage draws, users, and charity payouts.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card glass relative overflow-hidden">
              <Users className="w-5 h-5 text-cyan-400 mb-2" />
              <div className="text-2xl font-bold">{activeSubs || 0}</div>
              <div className="text-xs text-[var(--color-muted)]">Active Subscribers</div>
            </div>
            
            <div className="card glass relative overflow-hidden">
              <Gift className="w-5 h-5 text-pink-400 mb-2" />
              <div className="text-2xl font-bold">{charitiesCount || 0}</div>
              <div className="text-xs text-[var(--color-muted)]">Supported Charities</div>
            </div>

            <div className="card glass relative overflow-hidden ring-1 ring-amber-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
              <DollarSign className="w-5 h-5 text-amber-400 mb-2" />
              <div className="text-2xl font-bold text-amber-400">{formatCurrency(estimatedPool)}</div>
              <div className="text-xs text-[var(--color-muted)]">Est. Prize Pool This Month</div>
            </div>

            <div className="card glass relative overflow-hidden border-violet-500/30">
               <Dices className="w-5 h-5 text-violet-400 mb-2" />
               <div className="text-2xl font-bold">{currentMonth}</div>
               <div className="text-xs text-[var(--color-muted)]">Current Draw Period</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Draw Management Engine */ }
            <div className="lg:col-span-1 space-y-6">
              <div className="card border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                  <Dices className="w-4 h-4 text-amber-500" /> Draw Engine Interface
                </h3>
                {currentDraw ? (
                  <div className="bg-green-500/10 border border-green-500/20 p-4 rounded text-center">
                    <p className="text-sm font-bold text-green-400">Current Month Draw Published!</p>
                  </div>
                ) : sim && simulationStr ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-black/30 rounded border border-[var(--color-border)]">
                       <p className="text-xs text-[var(--color-muted)]">Projected Winners ({sim.logic_type} logic):</p>
                       <p className="text-sm font-bold text-violet-400 py-1">Numbers: {sim.winning_numbers.join(', ')}</p>
                       <p className="text-xs text-amber-400 font-bold mb-2">Pool: {formatCurrency(sim.prize_pool)}</p>
                       <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
                         <div className="bg-[var(--color-surface)] p-2 rounded">M5: {sim.metrics.count5}</div>
                         <div className="bg-[var(--color-surface)] p-2 rounded">M4: {sim.metrics.count4}</div>
                         <div className="bg-[var(--color-surface)] p-2 rounded">M3: {sim.metrics.count3}</div>
                       </div>
                    </div>
                    <form action={publishDraw}>
                      <input type="hidden" name="simulationData" value={simulationStr} />
                      <button type="submit" className="btn-primary w-full shadow-lg shadow-violet-500/20 py-2 text-sm font-bold hover:shadow-violet-400/40">
                        Confirm & Publish Draw
                      </button>
                    </form>
                    <a href="/admin" className="block text-center text-xs text-red-400 hover:underline pt-2">Cancel Simulation</a>
                  </div>
                ) : (
                  <form action="/admin" method="GET" className="space-y-4">
                    <input type="hidden" name="simulate" value="true" />
                    <div>
                      <label className="text-xs text-[var(--color-muted)] font-bold mb-1 block">Algorithm Strategy</label>
                      <select name="logic" className="input-field text-sm w-full bg-[var(--color-surface)] border-violet-500/30" defaultValue="random">
                        <option value="random">True Random (Standard Lottery)</option>
                        <option value="algorithmic">Algorithmic (Target frequent scores)</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full py-2 bg-[var(--color-surface)] border border-violet-500 hover:bg-violet-500/20 text-violet-300 transition-colors rounded font-bold text-sm">
                      Run Draw Simulation
                    </button>
                  </form>
                )}
              </div>

              {/* Claims Approval box */}
              <div className="card h-full">
                 <h3 className="font-bold flex items-center gap-2 mb-4">Pending Claims</h3>
                 {(!pendingClaims || pendingClaims.length === 0) ? (
                   <p className="text-[var(--color-muted)] text-sm">No pending claims.</p>
                 ) : (
                   <div className="space-y-4">
                     {pendingClaims.map(claim => (
                       <div key={claim.id} className="p-3 bg-[var(--color-surface)]/50 rounded-lg border border-[var(--color-border)]">
                         <div className="flex justify-between items-start mb-2">
                           <div>
                             <p className="font-semibold text-sm">{claim.profiles?.full_name}</p>
                             <p className="text-xs text-[var(--color-muted)]">{claim.profiles?.email}</p>
                             <p className="text-xs text-amber-400 font-medium">Match {claim.match_tier} · {formatCurrency(claim.prize_amount)}</p>
                           </div>
                           <a href={claim.proof_url} target="_blank" rel="noreferrer" className="text-xs bg-violet-600 px-2 py-1 rounded text-white hover:bg-violet-500">View Proof</a>
                         </div>
                         <div className="flex gap-2">
                           <form action={processWinnerClaim} className="flex-1">
                             <input type="hidden" name="winnerId" value={claim.id} />
                             <input type="hidden" name="action" value="approve" />
                             <button type="submit" className="w-full flex justify-center items-center gap-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 py-1.5 rounded hover:bg-green-500/30 transition-colors">
                               <CheckCircle className="w-3.5 h-3.5" /> Approve
                             </button>
                           </form>
                           <form action={processWinnerClaim} className="flex-1">
                             <input type="hidden" name="winnerId" value={claim.id} />
                             <input type="hidden" name="action" value="reject" />
                             <button type="submit" className="w-full flex justify-center items-center gap-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 py-1.5 rounded hover:bg-red-500/30 transition-colors">
                               <XCircle className="w-3.5 h-3.5" /> Reject
                             </button>
                           </form>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            </div>

            {/* Draw History */}
            <div className="lg:col-span-2">
              <div className="card h-full">
                <h3 className="font-bold mb-4">Recent Draws</h3>
                {(!draws || draws.length === 0) ? (
                  <div className="py-8 text-center text-[var(--color-muted)] border rounded-xl border-[var(--color-border)]">
                    No draws have been executed yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-[var(--color-muted)] uppercase bg-[var(--color-surface)]/50">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg">Period</th>
                          <th className="px-4 py-3">Numbers</th>
                          <th className="px-4 py-3">Pool</th>
                          <th className="px-4 py-3 rounded-tr-lg">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {draws.map((d) => (
                          <tr key={d.id} className="border-b border-[var(--color-border)]/50 last:border-0 hover:bg-[var(--color-surface)]/30">
                            <td className="px-4 py-3 font-semibold text-violet-400">{d.month_year}</td>
                            <td className="px-4 py-3">
                               <div className="flex gap-1">
                                 {d.winning_numbers.map((n: number, i: number) => (
                                   <span key={i} className="w-6 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-xs font-bold">{n}</span>
                                 ))}
                               </div>
                            </td>
                            <td className="px-4 py-3">{formatCurrency(d.prize_pool)}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-1 rounded-full ${d.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                {d.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
          
          {/* Charity Management (CRUD) */}
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Gift className="w-4 h-4 text-pink-400" /> Charity Directory Management
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
               <div className="md:col-span-1 md:border-r border-[var(--color-border)] md:pr-4">
                 <h4 className="text-sm font-bold mb-3 text-[var(--color-muted)]">Add New Charity</h4>
                 <form action={addCharity} className="space-y-3">
                   <input type="text" name="name" required placeholder="Charity Name" className="input-field text-sm" />
                   <textarea name="details" required placeholder="Mission details..." className="input-field text-sm min-h-[80px]" />
                   <input type="url" name="imageUrl" placeholder="Image URL (optional)" className="input-field text-sm" />
                   <button type="submit" className="btn-secondary w-full text-xs py-2 box-border shadow-md">Create Charity</button>
                 </form>
               </div>
               <div className="md:col-span-2">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                   {(await supabaseAdmin.from('charities').select('*').order('name')).data?.map(c => (
                     <div key={c.id} className="p-3 bg-[var(--color-surface)] rounded border border-[var(--color-border)] flex justify-between items-start hover:border-pink-500/30 transition-colors">
                       <div className="pr-4 shrink min-w-0">
                         <p className="font-bold text-sm truncate">{c.name}</p>
                         <p className="text-[10px] text-[var(--color-muted)] line-clamp-2 mt-1">{c.details}</p>
                       </div>
                       <form action={deleteCharity} className="shrink-0">
                         <input type="hidden" name="id" value={c.id} />
                         <button type="submit" className="text-[var(--color-muted)] hover:text-red-400 p-1 rounded hover:bg-red-400/10 transition-colors" title="Remove Charity">
                           <XCircle className="w-4 h-4" />
                         </button>
                       </form>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>

          {/* User Management */}
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> Recent User Signups
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[var(--color-muted)] uppercase bg-[var(--color-surface)]/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">User</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Donation %</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {(await supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false }).limit(10)).data?.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--color-border)]/50 last:border-0 hover:bg-[var(--color-surface)]/30">
                      <td className="px-4 py-3">
                        <div className="font-semibold">{p.full_name}</div>
                        <div className="text-xs text-[var(--color-muted)]">{p.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${p.plan === 'yearly' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {p.plan || 'none'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-pink-400">{p.charity_pct}%</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${p.sub_status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-[var(--color-surface)] text-[var(--color-muted)]'}`}>
                          {p.sub_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--color-muted)]">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
