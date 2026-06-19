import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'
import { getTimeLeft, pad2 } from '../lib/utils'
import { cn } from '../lib/utils'

interface CountdownTimerProps {
  endTime: number
  onEnd?: () => void
  variant?: 'default' | 'compact'
}

export function CountdownTimer({
  endTime,
  onEnd,
  variant = 'default',
}: CountdownTimerProps) {
  const { t } = useLanguage()
  const [parts, setParts] = useState(() => getTimeLeft(endTime))

  useEffect(() => {
    setParts(getTimeLeft(endTime))
    const id = setInterval(() => {
      const p = getTimeLeft(endTime)
      setParts(p)
      if (p.ended) {
        clearInterval(id)
        onEnd?.()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [endTime, onEnd])

  if (parts.ended) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
        ● {t('a_ended')}
      </span>
    )
  }

  const urgent = parts.total < 60 * 60 * 1000 // under 1 hour

  if (variant === 'compact') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums',
          urgent
            ? 'bg-rose-50 text-rose-600 animate-pulse-ring'
            : 'bg-primary-50 text-primary-700'
        )}
      >
        ⏱{' '}
        {parts.days > 0 && `${parts.days}d `}
        {pad2(parts.hours)}:{pad2(parts.minutes)}:{pad2(parts.seconds)}
      </span>
    )
  }

  const segs = [
    { v: parts.days, l: 'D' },
    { v: parts.hours, l: 'H' },
    { v: parts.minutes, l: 'M' },
    { v: parts.seconds, l: 'S' },
  ]

  return (
    <div className="flex items-center gap-2">
      {segs.map((s) => (
        <div
          key={s.l}
          className={cn(
            'flex min-w-[3.25rem] flex-col items-center rounded-xl px-2 py-2',
            urgent ? 'bg-rose-50 text-rose-600' : 'bg-navy text-white'
          )}
        >
          <motion.span
            key={`${s.l}-${s.v}`}
            initial={{ y: -8, opacity: 0.4 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="text-xl font-extrabold tabular-nums"
          >
            {pad2(s.v)}
          </motion.span>
          <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
            {s.l}
          </span>
        </div>
      ))}
    </div>
  )
}
