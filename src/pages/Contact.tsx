import { useState, type FormEvent } from 'react'
import { CheckCircle2, Mail, MapPin, Phone, Send } from 'lucide-react'
import { PageTransition } from '../components/PageTransition'
import { Input, Textarea } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useLanguage } from '../i18n/LanguageContext'
import { isValidEmail } from '../lib/utils'

export function Contact() {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !isValidEmail(email) || !message.trim()) {
      setError(t('au_fillAll'))
      return
    }
    setError('')
    setSent(true)
  }

  const info = [
    { icon: Mail, label: t('au_email'), value: 'hello@barter9911.mn' },
    { icon: Phone, label: t('co_phone'), value: '+976 9911 0000' },
    { icon: MapPin, label: t('co_address'), value: t('co_addressVal') },
  ]

  return (
    <PageTransition>
      <div className="container-app py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            {t('co_title')}
          </h1>
          <p className="mt-2 text-slate-500">{t('co_subtitle')}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Info */}
          <div className="space-y-4 lg:col-span-2">
            {info.map((i) => (
              <div
                key={i.label}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <i.icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {i.label}
                  </p>
                  <p className="font-semibold text-navy">{i.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-soft lg:col-span-3">
            {sent ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <p className="text-lg font-bold text-navy">{t('co_sent')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label={t('co_name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  type="email"
                  label={t('co_email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Textarea
                  label={t('co_message')}
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                {error && (
                  <p className="text-sm font-medium text-rose-600">{error}</p>
                )}
                <Button type="submit" size="lg" fullWidth>
                  <Send className="h-5 w-5" /> {t('co_send')}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
