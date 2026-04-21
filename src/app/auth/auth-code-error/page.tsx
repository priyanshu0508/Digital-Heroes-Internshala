import Link from 'next/link'
import { AlertTriangle, ChevronLeft } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-8 left-8">
        <Link href="/auth/login" className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-lg shadow-red-500/10">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold pb-2">
          Link <span className="text-red-500">Expired</span>
        </h2>
        
        <div className="mt-8 glass py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-[var(--color-border)] text-center">
          <p className="text-[var(--color-muted)] mb-6">
            The security link you clicked was invalid, already used, or has expired. 
            For security reasons, recovery links can only be clicked once.
          </p>
          <p className="text-[var(--color-muted)] mb-6 text-sm italic">
            (Note: If you requested multiple links, make sure you are clicking the newest one).
          </p>
          <Link href="/auth/forgot-password" className="btn-primary w-full shadow-lg flex justify-center text-center">
            Request a New Link
          </Link>
        </div>
      </div>
    </div>
  )
}
