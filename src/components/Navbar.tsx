import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Repeat,
  Shield,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import type { Lang } from '../i18n/LanguageContext'
import type { TranslationKey } from '../i18n/translations'
import { logout } from '../firebase/auth'
import { buttonStyles } from './ui/Button'
import { cn } from '../lib/utils'

const NAV_LINKS: { to: string; key: TranslationKey }[] = [
  { to: '/', key: 'nav_home' },
  { to: '/barter', key: 'nav_barter' },
  { to: '/auction', key: 'nav_auction' },
  { to: '/marketplace', key: 'nav_marketplace' },
  { to: '/post', key: 'nav_post' },
  { to: '/about', key: 'nav_about' },
  { to: '/contact', key: 'nav_contact' },
]

function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  const langs: Lang[] = ['mn', 'en']
  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5 text-xs font-bold">
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            'rounded-full px-2.5 py-1 uppercase transition-colors',
            lang === l
              ? 'bg-primary-600 text-white'
              : 'text-slate-500 hover:text-navy'
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="flex items-center gap-2 focus-ring rounded-lg"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
        <Repeat className="h-5 w-5" />
      </span>
      <span className="text-lg font-extrabold tracking-tight text-navy">
        Barter<span className="text-primary-600">9911</span>
        <span className="text-sm font-bold text-slate-400">.mn</span>
      </span>
    </Link>
  )
}

export function Navbar() {
  const { t } = useLanguage()
  const { firebaseUser, isAdmin, profile } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    try {
      await logout()
    } catch {
      /* ignore */
    }
    setOpen(false)
    navigate('/')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-navy'
    )

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <nav className="container-app flex h-16 items-center justify-between gap-2">
        <Brand />

        {/* Desktop links */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {t(l.key)}
            </NavLink>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="hidden items-center gap-2 lg:flex">
          <LanguageToggle />
          {firebaseUser ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={buttonStyles('ghost', 'sm', 'text-amber-600')}
                >
                  <Shield className="h-4 w-4" /> {t('nav_admin')}
                </Link>
              )}
              <Link to="/dashboard" className={buttonStyles('outline', 'sm')}>
                <LayoutDashboard className="h-4 w-4" /> {t('nav_dashboard')}
              </Link>
              <button
                onClick={handleLogout}
                className={buttonStyles('ghost', 'sm')}
                title={t('auth_logout')}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={buttonStyles('ghost', 'sm')}>
                {t('auth_login')}
              </Link>
              <Link to="/register" className={buttonStyles('primary', 'sm')}>
                {t('auth_register')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggle />
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-navy hover:bg-slate-100 focus-ring"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-white shadow-soft"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <Brand onClick={() => setOpen(false)} />
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-ring"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="flex flex-col gap-1">
                  {NAV_LINKS.map((l) => (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      end={l.to === '/'}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'rounded-xl px-4 py-3 text-base font-semibold transition-colors',
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-navy hover:bg-slate-100'
                        )
                      }
                    >
                      {t(l.key)}
                    </NavLink>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 px-4 py-4">
                <Link
                  to="/post"
                  onClick={() => setOpen(false)}
                  className={buttonStyles('primary', 'md', 'w-full mb-2')}
                >
                  <Plus className="h-4 w-4" /> {t('nav_post')}
                </Link>
                {firebaseUser ? (
                  <div className="space-y-2">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className={buttonStyles('outline', 'md', 'w-full')}
                      >
                        <Shield className="h-4 w-4" /> {t('nav_admin')}
                      </Link>
                    )}
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className={buttonStyles('outline', 'md', 'w-full')}
                    >
                      <LayoutDashboard className="h-4 w-4" /> {t('nav_dashboard')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={buttonStyles('ghost', 'md', 'w-full')}
                    >
                      <LogOut className="h-4 w-4" /> {t('auth_logout')}
                    </button>
                    {profile && (
                      <p className="pt-1 text-center text-xs text-slate-400">
                        {profile.name} · {profile.email}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className={buttonStyles('outline', 'md', 'w-full')}
                    >
                      {t('auth_login')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className={buttonStyles('primary', 'md', 'w-full')}
                    >
                      {t('auth_register')}
                    </Link>
                  </div>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
