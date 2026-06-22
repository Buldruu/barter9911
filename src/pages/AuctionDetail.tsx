import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Crown,
  Gavel,
  Infinity as InfinityIcon,
  Facebook,
  Phone,
  TrendingUp,
  User,
} from 'lucide-react'
import { PageTransition } from '../components/PageTransition'
import { FadeImage } from '../components/FadeImage'
import { CountdownTimer } from '../components/CountdownTimer'
import { ConfigNotice } from '../components/ConfigNotice'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { FullPageLoader } from '../components/ui/Loader'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useAsyncData } from '../hooks/useAsyncData'
import {
  endAuction,
  getAuction,
  getBids,
  getListing,
  getUserProfile,
  placeBid,
} from '../firebase/firestore'
import { categoryLabel, locationLabel } from '../lib/constants'
import { cn, formatDate, formatMNT, placeholderImage } from '../lib/utils'

const BID_STEP = 1000

export function AuctionDetail() {
  const { id } = useParams<{ id: string }>()
  const { t, lang } = useLanguage()
  const { configured, firebaseUser, profile } = useAuth()
  const navigate = useNavigate()

  const auctionState = useAsyncData(
    () => (id && configured ? getAuction(id) : Promise.resolve(null)),
    [id, configured]
  )
  const auction = auctionState.data

  const bidsState = useAsyncData(
    () => (id && configured ? getBids(id) : Promise.resolve([])),
    [id, configured]
  )
  const bids = bidsState.data ?? []

  const listingState = useAsyncData(
    () =>
      auction && configured ? getListing(auction.listingId) : Promise.resolve(null),
    [auction?.listingId, configured]
  )
  const listing = listingState.data

  const ownerState = useAsyncData(
    () =>
      listing && configured ? getUserProfile(listing.userId) : Promise.resolve(null),
    [listing?.userId, configured]
  )
  const owner = ownerState.data

  const [amount, setAmount] = useState('')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [endedNow, setEndedNow] = useState(false)

  useEffect(() => {
    if (auction) setAmount(String(auction.currentPrice + BID_STEP))
  }, [auction?.currentPrice, auction])

  if (!configured) {
    return (
      <PageTransition>
        <div className="container-app py-12">
          <ConfigNotice />
        </div>
      </PageTransition>
    )
  }

  if (auctionState.loading) return <FullPageLoader />

  if (!auction) {
    return (
      <PageTransition>
        <div className="container-app py-16">
          <EmptyState title={t('nf_title')} description={t('nf_desc')} />
        </div>
      </PageTransition>
    )
  }

  const ended =
    auction.status !== 'active' || Date.now() >= auction.endTime || endedNow
  const cover =
    auction.image ||
    listing?.imageUrls?.[0] ||
    placeholderImage(auction.id || 'auction')
  const isOwner =
    !!firebaseUser && !!listing && firebaseUser.uid === listing.userId

  async function handleBid() {
    if (!auction) return
    if (!firebaseUser) {
      navigate('/login', { state: { from: `/auction/${auction.id}` } })
      return
    }
    if (isOwner) {
      setError(t('c_ownListing'))
      return
    }
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= auction.currentPrice) {
      setError(t('a_mustBeHigher'))
      return
    }
    setPlacing(true)
    setError('')
    setSuccess('')
    try {
      const res = await placeBid(
        auction.id,
        firebaseUser.uid,
        profile?.name ?? firebaseUser.displayName ?? 'Member',
        value
      )
      setSuccess(res.closed ? t('a_reachedMax') : t('a_placed'))
      auctionState.reload()
      bidsState.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('a_mustBeHigher'))
    } finally {
      setPlacing(false)
    }
  }

  function onCountdownEnd() {
    setEndedNow(true)
    if (auction && auction.status === 'active') {
      endAuction(auction.id)
        .then(() => auctionState.reload())
        .catch(() => undefined)
    }
  }

  return (
    <PageTransition>
      <div className="container-app py-8">
        <Link
          to="/auction"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" /> {t('c_back')}
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
            <FadeImage src={cover} alt={auction.title ?? 'Auction'} />
          </div>

          {/* Bid panel */}
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
              <Gavel className="h-3 w-3" /> {t('nav_auction')}
            </span>
            <h1 className="mt-3 text-2xl font-extrabold text-navy sm:text-3xl">
              {auction.title || listing?.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {locationLabel(auction.location ?? '', lang)}
              {auction.category && ` · ${categoryLabel(auction.category, lang)}`}
            </p>

            {/* Price card */}
            <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {ended ? t('a_won') : t('a_current')}
                  </p>
                  <p
                    className={cn(
                      'text-3xl font-black',
                      ended ? 'text-slate-500' : 'text-primary-600'
                    )}
                  >
                    {formatMNT(auction.currentPrice)}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>
                    {t('a_starting')}: {formatMNT(auction.startingPrice)}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1">
                    {t('a_max')}:{' '}
                    {auction.hasUnlimitedMaxPrice ? (
                      <span className="inline-flex items-center gap-0.5 font-semibold text-primary-600">
                        <InfinityIcon className="h-3.5 w-3.5" /> {t('a_unlimited')}
                      </span>
                    ) : (
                      <span className="font-semibold">{formatMNT(auction.maxPrice ?? undefined)}</span>
                    )}
                  </p>
                </div>
              </div>

              {auction.highestBidderName && (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-sm text-amber-700">
                  <Crown className="h-4 w-4" /> {t('a_highest')}:{' '}
                  <span className="font-bold">{auction.highestBidderName}</span>
                </p>
              )}

              <div className="mt-4">
                {ended ? (
                  <div className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-600">
                    {t('a_ended')}
                  </div>
                ) : (
                  <CountdownTimer endTime={auction.endTime} onEnd={onCountdownEnd} />
                )}
              </div>
            </div>

            {/* Bid form */}
            {isOwner && !ended && (
              <p className="mt-5 rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500">
                {t('c_ownListing')}
              </p>
            )}
            {!ended && !isOwner && (
              <div className="mt-5">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Input
                      type="number"
                      label={t('a_yourBid')}
                      value={amount}
                      min={auction.currentPrice + 1}
                      onChange={(e) => setAmount(e.target.value)}
                      hint={`${t('a_minNext')}: ${formatMNT(auction.currentPrice + 1)}`}
                    />
                  </div>
                  <Button size="lg" onClick={handleBid} loading={placing}>
                    <TrendingUp className="h-5 w-5" /> {t('a_placeBid')}
                  </Button>
                </div>
                {error && (
                  <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>
                )}
                {success && (
                  <p className="mt-2 text-sm font-medium text-emerald-600">
                    {success}
                  </p>
                )}
                {!firebaseUser && (
                  <p className="mt-2 text-xs text-slate-500">
                    {t('c_signInToContinue')}
                  </p>
                )}
              </div>
            )}

            {listing?.description && (
              <div className="mt-6">
                <h2 className="text-sm font-bold uppercase tracking-wide text-navy">
                  {t('m_description')}
                </h2>
                <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-600">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Seller / contact */}
            <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <User className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {t('c_postedBy')}
                  </p>
                  <p className="truncate font-semibold text-navy">
                    {owner?.name ?? 'Member'}
                  </p>
                </div>
              </div>
              {(owner?.phone || owner?.facebookUrl) && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-50 pt-3">
                  {owner?.phone && (
                    <a
                      href={`tel:${owner.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-medium text-navy hover:bg-slate-100"
                    >
                      <Phone className="h-4 w-4 text-primary-600" /> {owner.phone}
                    </a>
                  )}
                  {owner?.facebookUrl && (
                    <a
                      href={owner.facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-medium text-navy hover:bg-slate-100"
                    >
                      <Facebook className="h-4 w-4 text-primary-600" /> Facebook
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bid history */}
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-navy">{t('a_history')}</h2>
          {bidsState.loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : bids.length === 0 ? (
            <EmptyState title={t('a_noBids')} />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              {bids.map((b, i) => (
                <div
                  key={b.id}
                  className={cn(
                    'flex items-center justify-between px-4 py-3',
                    i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60',
                    i === 0 && 'bg-amber-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full',
                        i === 0
                          ? 'bg-amber-200 text-amber-700'
                          : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {i === 0 ? (
                        <Crown className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <p className="font-semibold text-navy">{b.userName}</p>
                      <p className="text-xs text-slate-400">
                        {formatDate(b.createdAt, lang === 'mn' ? 'mn-MN' : 'en-US')}
                      </p>
                    </div>
                  </div>
                  <p
                    className={cn(
                      'font-extrabold',
                      i === 0 ? 'text-amber-700' : 'text-navy'
                    )}
                  >
                    {formatMNT(b.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
