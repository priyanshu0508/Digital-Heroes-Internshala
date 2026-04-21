'use client'

import { useState, useMemo } from 'react'
import { ShieldCheck, AlertCircle, Check, X, Eye, EyeOff } from 'lucide-react'
import { updatePassword } from '../actions'

// Reusing Requirement from signup, but keeping it localized for simplicity here
function Requirement({ label, met, active }: { label: string, met: boolean, active: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-[10px] transition-colors ${active ? (met ? 'text-green-400' : 'text-red-400') : 'text-[var(--color-muted)]'}`}>
      {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 opacity-50" />}
      {label}
    </div>
  )
}

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Using URL params on client to grab dynamic server messages without async page props if possible,
  // but let's just keep it simple and grab the query string directly
  const [errorMessage, setErrorMessage] = useState('') // This would usually come from server, but handled via redirect

  // Validation criteria
  const passwordCriteria = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  }), [password])

  const allValid = Object.values(passwordCriteria).every(Boolean)

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-green-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold pb-2">
          Update <span className="gradient-text">Password</span>
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
          Please enter your secure new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-[var(--color-border)]">
          <form className="space-y-6" action={updatePassword}>
            {/* The server action redirects to this page with ?message=... on failure */}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text)]">
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className={`input-field pr-10 ${password && !allValid ? 'border-amber-500/30' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-muted)] hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password Requirements Checklist */}
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                <Requirement label="At least 8 characters" met={passwordCriteria.length} active={password.length > 0} />
                <Requirement label="One uppercase letter" met={passwordCriteria.upper} active={password.length > 0} />
                <Requirement label="One lowercase letter" met={passwordCriteria.lower} active={password.length > 0} />
                <Requirement label="One number" met={passwordCriteria.number} active={password.length > 0} />
                <Requirement label="One special char" met={passwordCriteria.special} active={password.length > 0} />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={!allValid}
                className="btn-primary w-full shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale transition-all"
              >
                Set New Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
