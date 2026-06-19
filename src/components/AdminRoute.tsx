import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { FullPageLoader } from './ui/Loader'
import { EmptyState } from './ui/EmptyState'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { firebaseUser, isAdmin, loading } = useAuth()
  const { t } = useLanguage()

  if (loading) return <FullPageLoader />
  if (!firebaseUser) return <Navigate to="/login" replace />
  if (!isAdmin) {
    return (
      <div className="container-app py-20">
        <EmptyState
          title={t('ad_denied')}
          icon={<ShieldAlert className="h-7 w-7" />}
        />
      </div>
    )
  }
  return <>{children}</>
}
