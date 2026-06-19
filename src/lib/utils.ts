// Tiny className combiner (no extra deps).
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

// Format a number as Mongolian Tögrög.
export function formatMNT(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('mn-MN').format(Math.round(value)) + '₮'
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('mn-MN').format(value)
}

// Relative-ish date for cards (locale aware-ish, safe fallback).
export function formatDate(ms: number, locale: string = 'mn-MN'): string {
  try {
    return new Date(ms).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return new Date(ms).toDateString()
  }
}

export interface TimeParts {
  total: number
  days: number
  hours: number
  minutes: number
  seconds: number
  ended: boolean
}

export function getTimeLeft(endTime: number, now: number = Date.now()): TimeParts {
  const total = Math.max(0, endTime - now)
  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  return { total, days, hours, minutes, seconds, ended: total <= 0 }
}

export function pad2(n: number): string {
  return n.toString().padStart(2, '0')
}

// Map a duration token to milliseconds.
export function durationToMs(token: string): number {
  const map: Record<string, number> = {
    '12h': 12 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '14d': 14 * 24 * 60 * 60 * 1000,
    '1m': 30 * 24 * 60 * 60 * 1000,
  }
  return map[token] ?? 24 * 60 * 60 * 1000
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isValidPhone(phone: string): boolean {
  // Mongolian mobile numbers are 8 digits; allow an optional +976 prefix.
  const cleaned = phone.replace(/[\s-]/g, '')
  return /^(\+?976)?\d{8}$/.test(cleaned)
}

export function classForStatus(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
    case 'pending':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    case 'sold':
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
    case 'exchanged':
      return 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
    case 'rejected':
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
    case 'ended':
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
    default:
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
  }
}

// Deterministic placeholder image when a listing has no photos.
export function placeholderImage(seed: string): string {
  const hue = Math.abs(hashCode(seed)) % 360
  const hue2 = (hue + 40) % 360
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='hsl(${hue},70%,72%)'/>
      <stop offset='1' stop-color='hsl(${hue2},72%,55%)'/>
    </linearGradient></defs>
    <rect width='600' height='400' fill='url(#g)'/>
    <text x='50%' y='52%' font-family='Inter,sans-serif' font-size='34' font-weight='700'
      fill='rgba(255,255,255,0.92)' text-anchor='middle'>Barter9911.mn</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}
