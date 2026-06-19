import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, Repeat, Tag } from 'lucide-react'
import { FadeImage } from './FadeImage'
import { useLanguage } from '../i18n/LanguageContext'
import { categoryLabel, conditionLabel, locationLabel } from '../lib/constants'
import {
  classForStatus,
  cn,
  formatMNT,
  placeholderImage,
} from '../lib/utils'
import type { Listing } from '../types'

const TYPE_BADGE: Record<string, string> = {
  barter: 'bg-primary-600 text-white',
  sale: 'bg-emerald-500 text-white',
  auction: 'bg-amber-500 text-white',
}

export function ListingCard({ listing }: { listing: Listing }) {
  const { t, lang } = useLanguage()
  const cover = listing.imageUrls[0] || placeholderImage(listing.id || listing.title)

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="group h-full"
    >
      <Link
        to={`/item/${listing.id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-card focus-ring"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <FadeImage
            src={cover}
            alt={listing.title}
            className="transition-transform duration-500 group-hover:scale-105"
          />
          <span
            className={cn(
              'absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm',
              TYPE_BADGE[listing.type]
            )}
          >
            {t(
              listing.type === 'barter'
                ? 'p_typeBarter'
                : listing.type === 'sale'
                  ? 'p_typeSale'
                  : 'p_typeAuction'
            )}
          </span>
          {listing.status !== 'active' && (
            <span
              className={cn(
                'absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize',
                classForStatus(listing.status)
              )}
            >
              {listing.status}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-1 font-bold text-navy">{listing.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            {locationLabel(listing.location, lang)}
            <span className="text-slate-300">·</span>
            {categoryLabel(listing.category, lang)}
          </p>

          <div className="mt-3 flex-1">
            {listing.type === 'barter' ? (
              <div className="rounded-xl bg-primary-50 px-3 py-2">
                <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-primary-600">
                  <Repeat className="h-3 w-3" /> {t('b_wants')}
                </p>
                <p className="line-clamp-1 text-sm font-medium text-navy">
                  {listing.wantedExchange || '—'}
                </p>
              </div>
            ) : (
              <p className="flex items-center gap-1 text-lg font-extrabold text-navy">
                <Tag className="h-4 w-4 text-emerald-500" />
                {formatMNT(listing.fixedPrice)}
              </p>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-3">
            <span className="text-xs text-slate-400">
              {conditionLabel(listing.condition, lang)}
            </span>
            <span className="text-xs font-semibold text-primary-600 group-hover:underline">
              {t('c_viewDetails')}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
