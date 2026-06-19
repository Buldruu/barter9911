import { type FormEvent } from 'react'
import { Search } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { cn } from '../lib/utils'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  onSubmit?: () => void
  placeholder?: string
  className?: string
  size?: 'md' | 'lg'
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  className,
  size = 'md',
}: SearchBarProps) {
  const { t } = useLanguage()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit?.()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/40',
        className
      )}
    >
      <Search className="ml-2 h-5 w-5 shrink-0 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t('c_searchPlaceholder')}
        className={cn(
          'min-w-0 flex-1 bg-transparent px-1 text-navy placeholder:text-slate-400 focus:outline-none',
          size === 'lg' ? 'h-11 text-base' : 'h-9 text-sm'
        )}
      />
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 active:scale-[0.98]"
      >
        {t('c_search')}
      </button>
    </form>
  )
}
