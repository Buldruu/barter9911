import type { ReactNode } from 'react'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  action?: ReactNode
  center?: boolean
}

export function SectionHeading({
  title,
  subtitle,
  action,
  center = false,
}: SectionHeadingProps) {
  return (
    <div
      className={
        center
          ? 'mb-8 flex flex-col items-center text-center'
          : 'mb-8 flex flex-wrap items-end justify-between gap-3'
      }
    >
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1.5 text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
