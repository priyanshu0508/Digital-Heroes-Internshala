'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function addScore(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const scoreStr = formData.get('score') as string
  const dateStr = formData.get('date') as string
  const score = parseInt(scoreStr, 10)

  if (isNaN(score) || score < 1 || score > 45) {
    throw new Error('Score must be between 1 and 45')
  }

  if (!dateStr) {
    throw new Error('Date is required')
  }

  const { error } = await supabase.from('scores').insert({
    user_id: user.id,
    score: score,
    date: dateStr,
  })

  if (error) {
    if (error.code === '23505') {
      throw new Error('A score for this date already exists.')
    }
    console.error('Error inserting score:', error)
    throw new Error('Failed to add score. Please try again.')
  }

  revalidatePath('/dashboard')
}

export async function updateCharity(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const charityId = formData.get('charityId') as string
  
  if (!charityId) {
    throw new Error('Charity ID required')
  }

  const { error } = await supabase.from('profiles').update({
    charity_id: charityId
  }).eq('id', user.id)

  if (error) {
    throw new Error('Failed to update charity selection')
  }

  revalidatePath('/dashboard')
}

export async function completeProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const charityId = formData.get('charityId') as string
  const charityPct = parseInt(formData.get('charityPct') as string, 10)
  const plan = formData.get('plan') as string

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email!,
    full_name: `${firstName} ${lastName}`.trim(),
    charity_id: charityId,
    charity_pct: charityPct || 10,
    plan: plan,
    sub_status: 'inactive'
  })

  if (error) {
    console.error('Error completing profile:', error)
    throw new Error('Failed to complete profile setup')
  }

  revalidatePath('/dashboard')
}

export async function submitWinnerProof(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const winnerId = formData.get('winnerId') as string
  const proofUrl = formData.get('proofUrl') as string

  if (!winnerId || !proofUrl || proofUrl.trim().length === 0) {
    throw new Error('Proof URL is required')
  }

  // Ensure this row belongs to the user
  const { error } = await supabase
    .from('winners')
    .update({ proof_url: proofUrl.trim() })
    .eq('id', winnerId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error('Failed to submit proof.')
  }

  revalidatePath('/dashboard')
}
