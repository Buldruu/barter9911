import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { BadgeCheck, Gavel, Repeat, Store } from 'lucide-react'
import { PageTransition } from './PageTransition'
import { useLanguage } from '../i18n/LanguageContext'

export function GoogleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

interface AuthShellProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  const { t } = useLanguage()
  const perks = [
    { icon: Repeat, label: t('nav_barter') },
    { icon: Gavel, label: t('nav_auction') },
    { icon: Store, label: t('nav_marketplace') },
  ]

  return (
    <PageTransition>
      <div className="container-app grid min-h-[82vh] items-center gap-10 py-12 lg:grid-cols-2">
        {/* Brand panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative order-2 hidden overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 to-primary-500 p-10 text-white lg:order-1 lg:block"
        >
          <div className="absolute inset-0 bg-hero-grid [background-size:20px_20px] opacity-20" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Repeat className="h-6 w-6" />
              </span>
              <span className="text-xl font-extrabold">Barter9911.mn</span>
            </div>
            <h2 className="mt-10 text-3xl font-black leading-tight">
              {t('ab_subtitle')}
            </h2>
            <p className="mt-3 max-w-sm text-primary-50">{t('f_tagline')}</p>
            <ul className="mt-8 space-y-3">
              {perks.map((p) => (
                <li key={p.label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <span className="font-semibold">{p.label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-10 flex items-center gap-2 text-sm text-primary-100">
              <BadgeCheck className="h-5 w-5" /> {t('h_trust1')}
            </p>
          </div>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="order-1 mx-auto w-full max-w-md lg:order-2"
        >
          <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-soft sm:p-9">
            <h1 className="text-2xl font-extrabold text-navy">{title}</h1>
            <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
          <div className="mt-5 text-center text-sm text-slate-500">{footer}</div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
