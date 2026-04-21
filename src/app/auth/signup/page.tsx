import Link from 'next/link'
import { Trophy, ChevronLeft, AlertCircle } from 'lucide-react'
import { signup } from '../actions'
import { createClient } from '@/lib/supabase/server'
import SignupForm from '@/components/auth/SignupForm'

export default async function SignupPage(props: { searchParams: Promise<{ plan?: string, message?: string }> }) {
  const searchParams = await props.searchParams
  const defaultPlan = searchParams?.plan === 'yearly' ? 'yearly' : 'monthly'

  const supabase = await createClient()
  const { data: charities } = await supabase.from('charities').select('id, name').order('name')

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Trophy className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold pb-2">
          Join <span className="gradient-text">Digital Heroes</span>
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-violet-400 hover:text-violet-300">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass py-8 px-4 shadow sm:rounded-2xl sm:px-10">
          <SignupForm 
            charities={charities} 
            defaultPlan={defaultPlan} 
            message={searchParams?.message} 
          />
        </div>
      </div>
    </div>
  )
}
