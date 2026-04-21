'use client'

import { useState, useMemo } from 'react'
import { completeProfile } from '@/app/dashboard/actions'
import { Check, X, AlertCircle } from 'lucide-react'

interface Charity {
  id: string
  name: string
}

interface CompleteProfileFormProps {
  charities: Charity[] | null
}

export default function CompleteProfileForm({ charities }: CompleteProfileFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    charityId: '',
    charityPct: '10',
    plan: 'monthly'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = useMemo(() => {
    return (
      formData.firstName.length >= 2 &&
      formData.lastName.length >= 2 &&
      formData.charityId !== '' &&
      parseInt(formData.charityPct) >= 10
    )
  }, [formData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, val]) => data.append(key, val))
      await completeProfile(data)
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card max-w-xl mx-auto w-full p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold gradient-text">Complete Your Hero Profile</h1>
        <p className="text-sm text-[var(--color-muted)] mt-2">
          We noticed your profile details are missing. Please fill them in to access your dashboard.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              required
              className="input-field text-sm"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              required
              className="input-field text-sm"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Select Charity</label>
          <select
            name="charityId"
            required
            className="input-field text-sm appearance-none bg-[var(--color-surface)]"
            value={formData.charityId}
            onChange={handleChange}
          >
            <option value="" disabled>Choose your cause...</option>
            {charities?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Donation %</label>
            <input
              type="number"
              name="charityPct"
              min="10"
              max="100"
              required
              className="input-field text-sm"
              value={formData.charityPct}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Plan</label>
            <select
              name="plan"
              required
              className="input-field text-sm appearance-none bg-[var(--color-surface)]"
              value={formData.plan}
              onChange={handleChange}
            >
              <option value="monthly">Monthly (£9.99)</option>
              <option value="yearly">Yearly (£99)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="btn-primary w-full py-3 mt-4 disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.01]"
        >
          {isSubmitting ? 'Finalizing...' : 'Complete Setup & Enter Dashboard'}
        </button>
      </form>
    </div>
  )
}
