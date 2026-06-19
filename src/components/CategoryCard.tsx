import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CategoryIcon } from './Icon'
import { useLanguage } from '../i18n/LanguageContext'
import type { CategoryDef } from '../lib/constants'

export function CategoryCard({ category }: { category: CategoryDef }) {
  const { lang } = useLanguage()
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link
        to={`/marketplace?category=${category.id}`}
        className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm transition-all hover:border-primary-200 hover:shadow-card focus-ring"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
          <CategoryIcon name={category.icon} className="h-6 w-6" />
        </span>
        <span className="text-sm font-semibold text-navy">
          {lang === 'mn' ? category.mn : category.en}
        </span>
      </Link>
    </motion.div>
  )
}
