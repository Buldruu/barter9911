import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Facebook, Lock, LogIn, Mail } from 'lucide-react'
import { AuthShell, GoogleIcon } from '../components/AuthShell'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import {
  authErrorMessage,
  loginWithEmail,
  loginWithFacebook,
  loginWithGoogle,
} from '../firebase/auth'
import { isValidEmail } from '../lib/utils'

export function Login() {
  const { t } = useLanguage()
  const { firebaseUser, configured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }
  const from = location.state?.from ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [social, setSocial] = useState<'' | 'google' | 'facebook'>('')

  useEffect(() => {
    if (firebaseUser) navigate(from, { replace: true })
  }, [firebaseUser, from, navigate])

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    if (!isValidEmail(email)) return setError(t('au_invalidEmail'))
    if (!password) return setError(t('au_fillAll'))
    setLoading(true)
    setError('')
    try {
      await loginWithEmail(email, password)
      navigate(from, { replace: true })
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
      navigate(from, { replace: true })
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setSocial('')
    }
  }

  return (
    <AuthShell
      title={t('au_loginTitle')}
      subtitle={t('au_loginSub')}
      footer={
        <>
          {t('au_noAccount')}{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:underline">
            {t('au_signUp')}
          </Link>
        </>
      }
    >
      {!configured && (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
          {t('c_configNeeded')}
        </p>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
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
          type="password"
          label={t('au_password')}
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && (
          <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600">
            {error}
          </p>
        )}
        <Button type="submit" fullWidth size="lg" loading={loading}>
          <LogIn className="h-5 w-5" /> {t('au_signIn')}
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
