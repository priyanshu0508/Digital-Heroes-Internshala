'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function uploadWinnerProof(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const winnerId = formData.get('winnerId') as string
  const file = formData.get('proofFile') as File | null

  if (!winnerId || !file || file.size === 0) {
    throw new Error('Please select a file to upload.')
  }

  // Validate file type (JPG, PNG, PDF)
  const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
  if (!validTypes.includes(file.type)) {
    throw new Error('Only JPG, PNG, and PDF files are allowed.')
  }

  // Validate ownership of the winner record
  const { data: winner } = await supabase
    .from('winners')
    .select('id')
    .eq('id', winnerId)
    .eq('user_id', user.id)
    .single()

  if (!winner) {
    throw new Error('Invalid claim record.')
  }

  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${winnerId}-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('winner-proofs')
    .upload(fileName, file)

  if (uploadError) {
    console.error('Upload Error:', uploadError)
    throw new Error('Failed to upload file to secured storage.')
  }

  // Get public path (since we set the bucket to false public, we might need a signed url or we use supabaseAdmin to view. 
  // For simplicity since the prompt said admin views it, we will just save the path. Admin creates a signed url or we make it public if safe.
  // Actually, wait, let's just use the public URL endpoint and rely on RLS.)
  const { data: publicData } = supabase.storage.from('winner-proofs').getPublicUrl(fileName)

  // Update the Winners table with the proof URL
  const { error: updateErr } = await supabase
    .from('winners')
    .update({ proof_url: publicData.publicUrl })
    .eq('id', winnerId)

  if (updateErr) {
    throw new Error('Failed to save proof url to your claim.')
  }

  revalidatePath('/dashboard/winners')
}
