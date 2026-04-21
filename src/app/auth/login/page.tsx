import Link from 'next/link'
import { Trophy, ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react'
import { login } from '../actions'

export default async function LoginPage(props: { searchParams: Promise<{ message?: string, redirectTo?: string }> }) {
  const searchParams = await props.searchParams
  const isSuccessMessage = searchParams?.message?.toLowerCase().includes('check') || searchParams?.message?.toLowerCase().includes('success')

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
          Welcome <span className="gradient-text">Back</span>
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
          Or{' '}
          <Link href="/auth/signup" className="font-medium text-violet-400 hover:text-violet-300">
            start playing today
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass py-8 px-4 shadow sm:rounded-2xl sm:px-10">
          <form className="space-y-6" action={login}>
            {searchParams?.message && (
              <div className={`p-3 border rounded-lg flex items-center gap-2 text-sm ${isSuccessMessage ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {isSuccessMessage ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
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
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text)]">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-surface)] text-violet-600 focus:ring-violet-600 focus:ring-offset-gray-900"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--color-muted)]">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-violet-400 hover:text-violet-300">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="btn-primary w-full shadow-lg shadow-violet-500/20"
              >
                Sign in to Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
