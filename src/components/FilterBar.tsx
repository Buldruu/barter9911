import { SlidersHorizontal, X } from 'lucide-react'
import { Select } from './ui/Select'
import { SearchBar } from './SearchBar'
import { useLanguage } from '../i18n/LanguageContext'
import { CATEGORIES, CONDITIONS, LOCATIONS } from '../lib/constants'

interface FilterBarProps {
  search: string
  onSearch: (v: string) => void
  category: string
  onCategory: (v: string) => void
  location: string
  onLocation: (v: string) => void
  condition: string
  onCondition: (v: string) => void
  onClear: () => void
}

export function FilterBar(props: FilterBarProps) {
  const { t, lang } = useLanguage()

  const catOptions = CATEGORIES.map((c) => ({
    value: c.id,
    label: lang === 'mn' ? c.mn : c.en,
  }))
  const locOptions = LOCATIONS.map((l) => ({
    value: l.id,
    label: lang === 'mn' ? l.mn : l.en,
  }))
  const condOptions = CONDITIONS.map((c) => ({
    value: c.id,
    label: lang === 'mn' ? c.mn : c.en,
  }))

  const hasFilters =
    props.category || props.location || props.condition || props.search

  return (
    <div className="card-surface mb-8 p-4">
      <SearchBar value={props.search} onChange={props.onSearch} className="mb-3" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          options={catOptions}
          placeholder={t('c_category')}
          value={props.category}
          onChange={(e) => props.onCategory(e.target.value)}
        />
        <Select
          options={locOptions}
          placeholder={t('c_location')}
          value={props.location}
          onChange={(e) => props.onLocation(e.target.value)}
        />
        <Select
          options={condOptions}
          placeholder={t('c_condition')}
          value={props.condition}
          onChange={(e) => props.onCondition(e.target.value)}
        />
        <button
          onClick={props.onClear}
          disabled={!hasFilters}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          {hasFilters ? (
            <X className="h-4 w-4" />
          ) : (
            <SlidersHorizontal className="h-4 w-4" />
          )}
          {hasFilters ? t('c_clearFilters') : t('c_filters')}
        </button>
      </div>
    </div>
  )
}
