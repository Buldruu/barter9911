import { Database } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

// Shown on data pages when Firebase keys are not yet configured, so the app
// communicates clearly instead of silently failing.
export function ConfigNotice() {
  const { t } = useLanguage()
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary-200 bg-primary-50/60 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
        <Database className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-navy">{t('c_configNeeded')}</h3>
      <p className="mt-1.5 max-w-md text-sm text-slate-600">
        {t('c_configNeededDesc')}
      </p>
      <code className="mt-4 rounded-lg bg-white px-3 py-1.5 text-xs text-primary-700 ring-1 ring-primary-100">
        cp .env.example .env
      </code>
    </div>
  )
}
