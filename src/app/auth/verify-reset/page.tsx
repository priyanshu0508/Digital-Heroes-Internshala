import { ShieldAlert } from 'lucide-react'
import { confirmResetToken } from '../actions'
import { redirect } from 'next/navigation'

export default async function VerifyResetPage(props: { searchParams: Promise<{ token_hash?: string }> }) {
  const searchParams = await props.searchParams
  const token_hash = searchParams?.token_hash

  // If someone just visits this page without a token, kick them to login
  if (!token_hash) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold pb-2">
          Confirm <span className="gradient-text">Identity</span>
        </h2>
        
        <div className="mt-8 glass py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-[var(--color-border)] text-center">
          <p className="text-[var(--color-muted)] mb-8">
            Click the button below to securely confirm your password reset request.
          </p>

          <form action={confirmResetToken}>
            {/* Pass the token_hash safely to the server action */}
            <input type="hidden" name="token_hash" value={token_hash} />
            <button
              type="submit"
              className="btn-primary w-full shadow-lg flex justify-center text-center"
            >
              Verify My Account
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
