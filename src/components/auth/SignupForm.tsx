'use client'

import { useState, useMemo } from 'react'
import { AlertCircle, Check, X } from 'lucide-react'
import { signup } from '@/app/auth/actions'

interface Charity {
  id: string
  name: string
}

interface SignupFormProps {
  charities: Charity[] | null
  defaultPlan: string
  message?: string
}

export default function SignupForm({ charities, defaultPlan, message }: SignupFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    charityId: '',
    charityPct: '10',
    plan: defaultPlan
  })

  // Validation states
  const passwordCriteria = useMemo(() => ({
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password)
  }), [formData.password])

  const nameCriteria = useMemo(() => ({
    first: /^[a-zA-Z\s-]*$/.test(formData.firstName) && formData.firstName.length > 0,
    last: /^[a-zA-Z\s-]*$/.test(formData.lastName) && formData.lastName.length > 0
  }), [formData.firstName, formData.lastName])

  const charityPctValid = useMemo(() => {
    const val = parseInt(formData.charityPct)
    return val >= 10 && val <= 100
  }, [formData.charityPct])

  const isValidEmail = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
  }, [formData.email])

  const allValid = useMemo(() => {
    return Object.values(passwordCriteria).every(Boolean) &&
           Object.values(nameCriteria).every(Boolean) &&
           charityPctValid &&
           isValidEmail &&
           formData.charityId !== ''
  }, [passwordCriteria, nameCriteria, charityPctValid, isValidEmail, formData.charityId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePlanChange = (plan: string) => {
    setFormData(prev => ({ ...prev, plan }))
  }

  return (
    <form className="space-y-5" action={signup}>
      {message && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-[var(--color-text)]">
            First name
          </label>
          <div className="mt-1">
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              className={`input-field ${formData.firstName && !nameCriteria.first ? 'border-red-500/50' : ''}`}
              placeholder="Jane"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          {formData.firstName && !nameCriteria.first && (
            <p className="mt-1 text-[10px] text-red-400">Only letters allowed</p>
          )}
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-[var(--color-text)]">
            Last name
          </label>
          <div className="mt-1">
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              className={`input-field ${formData.lastName && !nameCriteria.last ? 'border-red-500/50' : ''}`}
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          {formData.lastName && !nameCriteria.last && (
            <p className="mt-1 text-[10px] text-red-400">Only letters allowed</p>
          )}
        </div>
      </div>

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
            className={`input-field ${formData.email && !isValidEmail ? 'border-red-500/50' : ''}`}
            placeholder="jane@example.com"
            value={formData.email}
            onChange={handleChange}
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
            required
            className={`input-field ${formData.password && !Object.values(passwordCriteria).every(Boolean) ? 'border-amber-500/30' : ''}`}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        
        {/* Password Requirements Checklist */}
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
          <Requirement label="At least 8 characters" met={passwordCriteria.length} active={formData.password.length > 0} />
          <Requirement label="One uppercase letter" met={passwordCriteria.upper} active={formData.password.length > 0} />
          <Requirement label="One lowercase letter" met={passwordCriteria.lower} active={formData.password.length > 0} />
          <Requirement label="One number" met={passwordCriteria.number} active={formData.password.length > 0} />
          <Requirement label="One special char" met={passwordCriteria.special} active={formData.password.length > 0} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="charityId" className="block text-sm font-medium text-[var(--color-text)]">
            Choose a Charity
          </label>
          <div className="mt-1">
            <select
              id="charityId"
              name="charityId"
              required
              className="input-field appearance-none bg-[var(--color-surface)]"
              value={formData.charityId}
              onChange={handleChange}
            >
              <option value="" disabled>Select a charity</option>
              {charities?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="charityPct" className="block text-sm font-medium text-[var(--color-text)]">
            Contribution %
          </label>
          <div className="mt-1">
            <input
              id="charityPct"
              name="charityPct"
              type="number"
              min="10"
              max="100"
              required
              className={`input-field ${!charityPctValid ? 'border-red-500/50' : ''}`}
              value={formData.charityPct}
              onChange={handleChange}
            />
          </div>
          {!charityPctValid && (
            <p className="mt-1 text-[10px] text-red-400">Min 10% Required</p>
          )}
        </div>
      </div>
      <p className="mt-1 text-[10px] text-[var(--color-muted)] text-center">At least 10% of your subscription goes to support your chosen charity.</p>

      <div className="pt-2">
        <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
          Subscription Plan
        </label>
        <div className="grid grid-cols-2 gap-4">
          <PlanCard
            plan="monthly"
            current={formData.plan}
            label="Monthly"
            price="£9.99"
            period="/mo"
            onSelect={handlePlanChange}
          />

          <PlanCard
            plan="yearly"
            current={formData.plan}
            label="Yearly"
            price="£99"
            period="/yr"
            savings="SAVE 17%"
            onSelect={handlePlanChange}
          />
        </div>
        <input type="hidden" name="plan" value={formData.plan} />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="btn-primary w-full shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale hover:scale-[1.02] active:scale-[0.98] transition-all"
          disabled={!allValid}
        >
          {allValid ? 'Continue to Payment' : 'Please complete the form'}
        </button>
      </div>
    </form>
  )
}

function Requirement({ label, met, active }: { label: string, met: boolean, active: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-[10px] transition-colors ${active ? (met ? 'text-green-400' : 'text-red-400') : 'text-[var(--color-muted)]'}`}>
      {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 opacity-50" />}
      {label}
    </div>
  )
}

function PlanCard({ plan, current, label, price, period, savings, onSelect }: any) {
  const isSelected = current === plan
  return (
    <label
      className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center transition-all duration-300 relative ${
        isSelected
          ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.1)]'
          : 'border-[var(--color-border)] hover:bg-[var(--color-surface)]/50'
      }`}
      onClick={() => onSelect(plan)}
    >
      <input type="radio" name="plan_proxy" checked={isSelected} readOnly className="sr-only" />
      {savings && (
        <div className="absolute -top-2.5 bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
          {savings}
        </div>
      )}
      <span className={`text-xs font-semibold mb-1 transition-colors ${isSelected ? 'text-violet-400' : 'text-[var(--color-muted)]'}`}>
        {label}
      </span>
      <span className="text-xl font-bold">
        {price}<span className="text-sm text-[var(--color-muted)] font-normal">{period}</span>
      </span>
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
        </div>
      )}
    </label>
  )
}
