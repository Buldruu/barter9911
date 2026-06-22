import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone, Repeat } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { CATEGORIES } from '../lib/constants'

export function Footer() {
  const { t, lang } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="container-app grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
              <Repeat className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold text-navy">
              Barter<span className="text-primary-600">9911</span>
              <span className="text-sm text-slate-400">.mn</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            {t('f_tagline')}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-navy">
            {t('f_quick')}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
            <li><Link to="/barter" className="hover:text-primary-600">{t('nav_barter')}</Link></li>
            <li><Link to="/auction" className="hover:text-primary-600">{t('nav_auction')}</Link></li>
            <li><Link to="/marketplace" className="hover:text-primary-600">{t('nav_marketplace')}</Link></li>
            <li><Link to="/about" className="hover:text-primary-600">{t('nav_about')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-navy">
            {t('f_cats')}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link
                  to={`/marketplace?category=${c.id}`}
                  className="hover:text-primary-600"
                >
                  {lang === 'mn' ? c.mn : c.en}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-navy">
            {t('f_contact')}
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary-600" /> hello@barter9911.mn
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary-600" /> +976 9911 0000
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary-600" />
              {t('co_addressVal')}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="container-app flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-400 sm:flex-row">
          <p>© {year} Barter9911.mn — {t('f_rights')}</p>
          <p>Made with care in Mongolia 🇲🇳</p>
        </div>
      </div>
    </footer>
  )
}
