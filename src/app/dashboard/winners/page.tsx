import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import { Upload, FileCheck, AlertCircle, ArrowLeft } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { uploadWinnerProof } from './actions'

export default async function WinnersPortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  if (!profile) {
    redirect('/auth/login')
  }

  // Fetch only the user's winning entries
  const { data: wins } = await supabase
    .from('winners')
    .select('*, draws(month_year, winning_numbers)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <Navbar user={user} isAdmin={profile.is_admin} />
      
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="flex items-center gap-4 border-b border-[var(--color-border)] pb-6 mb-6">
            <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full glass-hover text-[var(--color-muted)] hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold pb-1">
                Winners <span className="gradient-text-gold">Claim Portal</span>
              </h1>
              <p className="text-[var(--color-muted)]">Upload your scorecard proof to claim your prize money.</p>
            </div>
          </div>

          {!wins || wins.length === 0 ? (
            <div className="card text-center py-16 border-dashed border-2">
              <div className="text-6xl mb-4">⛳</div>
              <h3 className="text-xl font-bold mb-2">No wins just yet!</h3>
              <p className="text-[var(--color-muted)]">Keep logging your Stableford scores each month to increase your chances!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {wins.map((win) => (
                <div key={win.id} className="card relative overflow-hidden glass-hover border-amber-500/30">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-300" />
                  
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    {/* Left: Win Info */}
                    <div className="flex-1">
                       <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full mb-3 inline-block">
                         Match {win.match_tier} Winner
                       </span>
                       <h3 className="text-2xl font-bold mb-1">
                         Draw: {win.draws?.month_year}
                       </h3>
                       <p className="text-[var(--color-muted)] mb-4 text-sm">
                         You won <span className="font-bold text-white">{formatCurrency(win.prize_amount)}</span>!
                       </p>
                       
                       <div className="flex items-center gap-2 mb-6 text-sm">
                         <span className="text-[var(--color-muted)]">Status:</span>
                         <span className={`px-2.5 py-1 rounded-md font-medium capitalize text-xs ${
                           win.payment_status === 'pending' ? 'bg-[var(--color-surface)] text-amber-400 border border-amber-500/30' : 
                           win.payment_status === 'paid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                           'bg-red-500/20 text-red-400 border border-red-500/30'
                         }`}>
                           {win.payment_status}
                         </span>
                       </div>
                    </div>

                    {/* Right: Upload mechanism */}
                    <div className="flex-1 bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
                      {win.proof_url ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                            <FileCheck className="w-6 h-6 text-green-400" />
                          </div>
                          <h4 className="font-bold">Proof Uploaded</h4>
                          <p className="text-xs text-[var(--color-muted)]">Your scorecard has been securely uploaded.</p>
                          <a href={win.proof_url} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:underline">
                            View Uploaded File
                          </a>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                             <Upload className="w-4 h-4 text-violet-400" /> Submit Verification
                          </h4>
                          <p className="text-xs text-[var(--color-muted)] mb-4">
                            Upload a photo or PDF of your verified scorecard. <br/>
                            <span className="text-amber-400/80">Only JPG, PNG, and PDF allowed.</span>
                          </p>
                          
                          <form action={uploadWinnerProof} className="space-y-4">
                            <input type="hidden" name="winnerId" value={win.id} />
                            
                            <label className="block w-full border-2 border-dashed border-[var(--color-border)] rounded-xl px-4 py-8 text-center cursor-pointer hover:bg-[var(--color-border)]/5 transition-colors">
                              <span className="text-sm font-medium text-violet-400">Select file to upload</span>
                              <input 
                                type="file" 
                                name="proofFile" 
                                accept="image/jpeg, image/png, application/pdf"
                                required
                                className="hidden" 
                              />
                            </label>

                            <button type="submit" className="btn-primary w-full text-sm py-2">
                              Upload Proof
                            </button>
                          </form>
                        </div>
                      )}
                    </div>

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
