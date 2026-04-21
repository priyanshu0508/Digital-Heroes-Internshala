'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateWinningNumbers, countMatches, getMonthYear } from '@/lib/utils'
import { sendDrawPublishedAlert, sendWinnerAlert, sendPayoutClearedAlert } from '@/lib/notifications'

async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('Unauthorized')
  return user
}

export async function calculateSimulationData(logicType: 'random' | 'algorithmic') {
  try {
    const adminUser = await getAdminUser()
    const currentMonth = getMonthYear()

    // 1. Check existing
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('draws')
      .select('id')
      .eq('month_year', currentMonth)
      .maybeSingle()
    
    if (checkError) {
      console.error("Simulation database check error:", checkError)
      return { success: false, error: `Database check failed: ${checkError.message}` }
    }
    
    if (existing) {
      return { success: false, error: `A draw has already been published for ${currentMonth}.` }
    }

    // 2. Active Subs Pool
    const { count: activeSubs, error: subsError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('sub_status', 'active')

    if (subsError) return { success: false, error: "Failed to fetch active subscribers." }
    let prizePool = (activeSubs || 0) * 500 // 500 pence per subscriber

    // 3. Rollover Logic
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    const prevMonth = getMonthYear(d)
    
    const { data: prevDraw } = await supabaseAdmin
      .from('draws')
      .select('id, prize_pool')
      .eq('month_year', prevMonth)
      .maybeSingle()

    if (prevDraw) {
       const { count: prev5Match } = await supabaseAdmin
         .from('winners')
         .select('*', { count: 'exact', head: true })
         .eq('draw_id', prevDraw.id)
         .eq('match_tier', 5)
         
       if (prev5Match === 0) {
         prizePool += Math.floor(prevDraw.prize_pool * 0.40)
       }
    }

    // 4. Score Logic
    const { data: allScores, error: scoreError } = await supabaseAdmin.from('scores').select('score, user_id')
    if (scoreError) return { success: false, error: "Failed to fetch user scores." }

    let winningNumbers: number[] = []
    if (logicType === 'algorithmic' && allScores && allScores.length > 0) {
       const freqMap = new Map<number, number>()
       allScores.forEach(s => freqMap.set(s.score, (freqMap.get(s.score) || 0) + 1))
       const sortedFreq = Array.from(freqMap.entries()).sort((a,b) => b[1] - a[1]).map(e => e[0])
       const topTargets = sortedFreq.slice(0, 3)
       const standardRng = generateWinningNumbers(5, 1, 45)
       winningNumbers = Array.from(new Set([...topTargets, ...standardRng])).slice(0, 5).sort((a, b) => a - b)
    } else {
       winningNumbers = generateWinningNumbers(5, 1, 45)
    }

    // 5. Evaluate Matches
    const { data: activeUsers } = await supabaseAdmin.from('profiles').select('id').eq('sub_status', 'active')
    const activeIds = new Set(activeUsers?.map(u => u.id) || [])
    const userScoreMap = new Map<string, number[]>()
    allScores?.forEach(s => {
      if (activeIds.has(s.user_id)) {
        const arr = userScoreMap.get(s.user_id) || []
        arr.push(s.score)
        userScoreMap.set(s.user_id, arr)
      }
    })

    let count3 = 0, count4 = 0, count5 = 0
    const winnersList: { userId: string, match: 3 | 4 | 5 }[] = []

    userScoreMap.forEach((scores, userId) => {
      const matches = countMatches(scores, winningNumbers)
      if (matches >= 3) {
        winnersList.push({ userId, match: matches as 3 | 4 | 5 })
        if (matches === 3) count3++
        else if (matches === 4) count4++
        else if (matches === 5) count5++
      }
    })

    const bronzePool = Math.floor(prizePool * 0.25)
    const silverPool = Math.floor(prizePool * 0.35)
    const goldPool = Math.floor(prizePool * 0.40)

    return {
      success: true,
      data: {
        month_year: currentMonth,
        logic_type: logicType,
        prize_pool: prizePool,
        winning_numbers: winningNumbers,
        metrics: { count3, count4, count5 },
        payouts: {
          bronze: count3 > 0 ? Math.floor(bronzePool / count3) : 0,
          silver: count4 > 0 ? Math.floor(silverPool / count4) : 0,
          gold: count5 > 0 ? Math.floor(goldPool / count5) : 0
        },
        winnersList
      }
    }
  } catch (err: any) {
    console.error("Simulation critical failure:", err)
    return { success: false, error: err.message || "An unexpected error occurred during simulation." }
  }
}

export async function publishDraw(formData: FormData) {
  await getAdminUser()
  
  const simulationStr = formData.get('simulationData') as string
  if (!simulationStr) throw new Error('No simulation data provided')
  
  const sim = JSON.parse(simulationStr)

  // Double check it hasn't been published in a race condition
  const { data: existing } = await supabaseAdmin
    .from('draws')
    .select('id')
    .eq('month_year', sim.month_year)
    .single()
  
  if (existing) throw new Error('Already published!')

  // 1. Insert Draw
  const { data: newDraw, error: drawErr } = await supabaseAdmin
    .from('draws')
    .insert({
      month_year: sim.month_year,
      winning_numbers: sim.winning_numbers,
      status: 'published',
      prize_pool: sim.prize_pool
    })
    .select('id')
    .single()

  if (drawErr) throw new Error('Failed to save draw')

  // 2. Insert Winners
  const winnerInserts = sim.winnersList.map((w: any) => ({
    user_id: w.userId,
    draw_id: newDraw.id,
    match_tier: w.match,
    prize_amount: w.match === 3 ? sim.payouts.bronze : w.match === 4 ? sim.payouts.silver : sim.payouts.gold,
    payment_status: 'pending' as 'pending'
  }))

  if (winnerInserts.length > 0) {
    await supabaseAdmin.from('winners').insert(winnerInserts)
  }

  // 3. Trigger Global Notification
  await sendDrawPublishedAlert(['all-users-stub'], sim.month_year, sim.winning_numbers, sim.prize_pool)
  
  // 4. Trigger Direct Winner Notifications
  for (const wInst of winnerInserts) {
    const { data: uInfo } = await supabaseAdmin.from('profiles').select('email, full_name').eq('id', wInst.user_id).single()
    if (uInfo) {
      await sendWinnerAlert(uInfo.email, uInfo.full_name, wInst.match_tier, wInst.prize_amount)
    }
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  revalidatePath('/draws')
}

export async function processWinnerClaim(formData: FormData) {
  await getAdminUser()

  const winnerId = formData.get('winnerId') as string
  const action = formData.get('action') as string 

  if (!winnerId || !action) throw new Error('Missing params')
  const status = action === 'approve' ? 'paid' : 'rejected'

  const { data: wDoc } = await supabaseAdmin.from('winners').update({ payment_status: status }).eq('id', winnerId).select('prize_amount, profiles(email)').single()
  
  const profileData = wDoc?.profiles as any
  if (wDoc && status === 'paid' && profileData?.email) {
    await sendPayoutClearedAlert(profileData.email, wDoc.prize_amount)
  }

  revalidatePath('/admin')
}

// === PHASE 3: CHARITY CRUD ===
export async function addCharity(formData: FormData) {
  await getAdminUser()
  const name = formData.get('name') as string
  const details = formData.get('details') as string
  const imageUrl = formData.get('imageUrl') as string || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?w=800&q=80'

  if (!name || !details) redirect('/admin?charityError=Name+and+Mission+are+required')

  const { error } = await supabaseAdmin.from('charities').insert({ name, details, image_url: imageUrl })
  
  if (error) {
    console.error("Add charity failed:", error)
    redirect(`/admin?charityError=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/admin')
  redirect('/admin')
}

export async function deleteCharity(formData: FormData) {
  await getAdminUser()
  const id = formData.get('id') as string
  
  const { error } = await supabaseAdmin.from('charities').delete().eq('id', id)
  
  if (error) {
    console.error("Delete charity failed:", error)
    redirect(`/admin?charityError=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/admin')
  redirect('/admin')
}
