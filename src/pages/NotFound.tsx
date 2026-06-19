import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { PageTransition } from '../components/PageTransition'
import { buttonStyles } from '../components/ui/Button'
import { useLanguage } from '../i18n/LanguageContext'

export function NotFound() {
  const { t } = useLanguage()
  return (
    <PageTransition>
      <div className="container-app flex min-h-[70vh] flex-col items-center justify-center text-center">
        <p className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-8xl font-black text-transparent">
          404
        </p>
        <h1 className="mt-4 text-2xl font-extrabold text-navy">{t('nf_title')}</h1>
        <p className="mt-2 max-w-sm text-slate-500">{t('nf_desc')}</p>
        <Link to="/" className={buttonStyles('primary', 'lg', 'mt-7')}>
          <Home className="h-5 w-5" /> {t('nf_home')}
        </Link>
      </div>
    </PageTransition>
  )
}
