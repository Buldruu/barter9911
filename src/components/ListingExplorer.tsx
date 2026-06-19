import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageTransition } from './PageTransition'
import { FilterBar } from './FilterBar'
import { ListingCard } from './ListingCard'
import { ConfigNotice } from './ConfigNotice'
import { CardGridSkeleton } from './ui/LoadingSkeleton'
import { EmptyState } from './ui/EmptyState'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { fetchListings } from '../firebase/firestore'
import type { Condition, ListingType } from '../types'

interface ListingExplorerProps {
  type: ListingType
  title: string
  subtitle: string
}

export function ListingExplorer({ type, title, subtitle }: ListingExplorerProps) {
  const { t } = useLanguage()
  const { configured } = useAuth()
  const [params] = useSearchParams()

  const [search, setSearch] = useState(params.get('search') ?? '')
  const [category, setCategory] = useState(params.get('category') ?? '')
  const [location, setLocation] = useState('')
  const [condition, setCondition] = useState('')

  const { data, loading } = useAsyncData(
    () =>
      configured
        ? fetchListings({ type, status: 'active', max: 200 })
        : Promise.resolve([]),
    [configured, type]
  )

  const items = useMemo(() => {
    let arr = data ?? []
    if (category) arr = arr.filter((l) => l.category === category)
    if (location) arr = arr.filter((l) => l.location === location)
    if (condition) arr = arr.filter((l) => l.condition === (condition as Condition))
    if (search) {
      const s = search.toLowerCase().trim()
      arr = arr.filter(
        (l) =>
          l.title.toLowerCase().includes(s) ||
          l.description.toLowerCase().includes(s) ||
          (l.wantedExchange ?? '').toLowerCase().includes(s)
      )
    }
    return arr
  }, [data, category, location, condition, search])

  function clear() {
    setSearch('')
    setCategory('')
    setLocation('')
    setCondition('')
  }

  return (
    <PageTransition>
      <div className="container-app py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-slate-500">{subtitle}</p>
        </div>

        <FilterBar
          search={search}
          onSearch={setSearch}
          category={category}
          onCategory={setCategory}
          location={location}
          onLocation={setLocation}
          condition={condition}
          onCondition={setCondition}
          onClear={clear}
        />

        {!configured ? (
          <ConfigNotice />
        ) : loading ? (
          <CardGridSkeleton count={8} />
        ) : items.length === 0 ? (
          <EmptyState title={t('c_noResults')} description={t('c_noResultsDesc')} />
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {items.length} {t('c_all').toLowerCase()}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  )
}
