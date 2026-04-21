import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import LandingPageContent from '@/components/LandingPageContent'

export default async function Home() {
  const supabase = await createClient()
  
  // Get current user session
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if admin
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    isAdmin = profile?.is_admin || false
  }

  return (
    <>
      <Navbar user={user} isAdmin={isAdmin} />
      <LandingPageContent />
    </>
  )
}
