import Link from 'next/link'
import { KeyRound, ChevronLeft, AlertCircle } from 'lucide-react'
import { requestPasswordReset } from '../actions'

export default async function ForgotPasswordPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams
  
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-8 left-8">
        <Link href="/auth/login" className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold pb-2">
          Reset <span className="gradient-text">Password</span>
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
          Enter your email and we'll send you a secure recovery link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-[var(--color-border)]">
          <form className="space-y-6" action={requestPasswordReset}>
            {searchParams?.message && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {searchParams.message}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text)]">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field"
                  placeholder="hero@example.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="btn-primary w-full shadow-lg shadow-violet-500/20"
              >
                Send Recovery Link
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
