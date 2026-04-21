import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'GBP') {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100)
}

export function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr))
}

export function getMonthYear(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** Generate N unique random numbers within [min, max] inclusive */
export function generateWinningNumbers(count: number, min: number, max: number): number[] {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min)
  const shuffled = pool.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).sort((a, b) => a - b)
}

/** Count how many numbers from userScores appear in winningNumbers */
export function countMatches(userScores: number[], winningNumbers: number[]): number {
  const winningSet = new Set(winningNumbers)
  return userScores.filter((s) => winningSet.has(s)).length
}
