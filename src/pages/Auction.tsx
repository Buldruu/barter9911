import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageTransition } from '../components/PageTransition'
import { buttonStyles } from '../components/ui/Button'
import { AuctionCard } from '../components/AuctionCard'
import { ConfigNotice } from '../components/ConfigNotice'
import { CardGridSkeleton } from '../components/ui/LoadingSkeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { fetchAuctions } from '../firebase/firestore'
import { cn } from '../lib/utils'

export function Auction() {
  const { t } = useLanguage()
  const { configured } = useAuth()
  const [tab, setTab] = useState<'active' | 'ended'>('active')

  const { data, loading } = useAsyncData(
    () => (configured ? fetchAuctions(200) : Promise.resolve([])),
    [configured]
  )

  const { active, ended } = useMemo(() => {
    const list = (data ?? []).filter((a) => a.status !== 'cancelled')
    return {
      active: list.filter((a) => a.status === 'active' && Date.now() < a.endTime),
      ended: list.filter((a) => a.status !== 'active' || Date.now() >= a.endTime),
    }
  }, [data])

  const shown = tab === 'active' ? active : ended

  return (
    <PageTransition>
      <div className="container-app py-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
              {t('a_title')}
            </h1>
            <p className="mt-2 text-slate-500">{t('a_subtitle')}</p>
          </div>
          <Link to="/post/auction" className={buttonStyles('primary', 'md')}>
            <Plus className="h-4 w-4" /> {t('nav_post')}
          </Link>
        </div>

        <div className="mb-8 inline-flex rounded-xl border border-slate-200 bg-white p-1">
          {(['active', 'ended'] as const).map((tb) => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                tab === tb
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-500 hover:text-navy'
              )}
            >
              {tb === 'active' ? t('h_activeAuctions') : t('a_ended')}
              <span className="ml-2 rounded-full bg-black/10 px-1.5 text-xs">
                {tb === 'active' ? active.length : ended.length}
              </span>
            </button>
          ))}
        </div>

        {!configured ? (
          <ConfigNotice />
        ) : loading ? (
          <CardGridSkeleton count={8} />
        ) : shown.length === 0 ? (
          <EmptyState title={t('c_noResults')} description={t('c_noResultsDesc')} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((a) => (
              <AuctionCard key={a.id} auction={a} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
