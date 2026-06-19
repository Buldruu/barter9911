import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Gavel, MapPin } from 'lucide-react'
import { FadeImage } from './FadeImage'
import { CountdownTimer } from './CountdownTimer'
import { useLanguage } from '../i18n/LanguageContext'
import { categoryLabel, locationLabel } from '../lib/constants'
import { cn, formatMNT, placeholderImage } from '../lib/utils'
import type { Auction } from '../types'

export function AuctionCard({ auction }: { auction: Auction }) {
  const { t, lang } = useLanguage()
  const cover = auction.image || placeholderImage(auction.id || auction.title || 'auction')
  const ended = auction.status !== 'active' || Date.now() >= auction.endTime

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="group h-full"
    >
      <Link
        to={`/auction/${auction.id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-card focus-ring"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <FadeImage
            src={cover}
            alt={auction.title ?? 'Auction'}
            className="transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            <Gavel className="h-3 w-3" /> {t('nav_auction')}
          </span>
          <span className="absolute right-3 top-3">
            <CountdownTimer endTime={auction.endTime} variant="compact" />
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-1 font-bold text-navy">{auction.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            {locationLabel(auction.location ?? '', lang)}
            {auction.category && (
              <>
                <span className="text-slate-300">·</span>
                {categoryLabel(auction.category, lang)}
              </>
            )}
          </p>

          <div className="mt-3 flex-1 rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {ended ? t('a_won') : t('a_current')}
            </p>
            <p
              className={cn(
                'text-lg font-extrabold',
                ended ? 'text-slate-500' : 'text-primary-600'
              )}
            >
              {formatMNT(auction.currentPrice)}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-3">
            <span className="text-xs text-slate-400">
              {t('a_starting')}: {formatMNT(auction.startingPrice)}
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
