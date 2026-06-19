import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Facebook, Lock, Mail, Phone, User, UserPlus } from 'lucide-react'
import { AuthShell, GoogleIcon } from '../components/AuthShell'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import {
  authErrorMessage,
  loginWithFacebook,
  loginWithGoogle,
  registerWithEmail,
} from '../firebase/auth'
import { isValidEmail, isValidPhone } from '../lib/utils'

export function Register() {
  const { t } = useLanguage()
  const { firebaseUser, configured } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [social, setSocial] = useState<'' | 'google' | 'facebook'>('')

  useEffect(() => {
    if (firebaseUser) navigate('/dashboard', { replace: true })
  }, [firebaseUser, navigate])

  async function handleRegister(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email || !phone || !password || !confirm)
      return setError(t('au_fillAll'))
    if (!isValidEmail(email)) return setError(t('au_invalidEmail'))
    if (!isValidPhone(phone)) return setError(t('au_invalidPhone'))
    if (password.length < 6) return setError(t('au_weakPassword'))
    if (password !== confirm) return setError(t('au_passwordsNoMatch'))

    setLoading(true)
    setError('')
    try {
      await registerWithEmail({
        name: name.trim(),
        email,
        password,
        phone: phone.trim(),
        facebookUrl: facebookUrl.trim() || undefined,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleSocial(kind: 'google' | 'facebook') {
    setSocial(kind)
    setError('')
    try {
      if (kind === 'google') await loginWithGoogle()
      else await loginWithFacebook()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setSocial('')
    }
  }

  return (
    <AuthShell
      title={t('au_registerTitle')}
      subtitle={t('au_registerSub')}
      footer={
        <>
          {t('au_haveAccount')}{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:underline">
            {t('au_signIn')}
          </Link>
        </>
      }
    >
      {!configured && (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
          {t('c_configNeeded')}
        </p>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <Input
          label={t('au_name')}
          leftIcon={<User className="h-4 w-4" />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        <Input
          type="email"
          label={t('au_email')}
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          type="tel"
          label={t('au_phone')}
          placeholder="9911XXXX"
          leftIcon={<Phone className="h-4 w-4" />}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
        <Input
          label={`${t('au_facebook')} (${t('c_optional')})`}
          leftIcon={<Facebook className="h-4 w-4" />}
          placeholder="https://facebook.com/username"
          value={facebookUrl}
          onChange={(e) => setFacebookUrl(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            type="password"
            label={t('au_password')}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Input
            type="password"
            label={t('au_confirm')}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        {error && (
          <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600">
            {error}
          </p>
        )}
        <Button type="submit" fullWidth size="lg" loading={loading}>
          <UserPlus className="h-5 w-5" /> {t('au_signUp')}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        {t('au_or')}
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          fullWidth
          size="lg"
          loading={social === 'google'}
          onClick={() => handleSocial('google')}
        >
          <GoogleIcon /> {t('au_google')}
        </Button>
        <Button
          variant="outline"
          fullWidth
          size="lg"
          loading={social === 'facebook'}
          onClick={() => handleSocial('facebook')}
        >
          <Facebook className="h-5 w-5 text-[#1877F2]" /> {t('au_facebookBtn')}
        </Button>
      </div>
    </AuthShell>
  )
}
