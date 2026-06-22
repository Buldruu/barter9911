import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Facebook,
  Gavel,
  Mail,
  MapPin,
  Phone,
  Repeat,
  Tag,
  User,
} from 'lucide-react'
import { PageTransition } from '../components/PageTransition'
import { FadeImage } from '../components/FadeImage'
import { ConfigNotice } from '../components/ConfigNotice'
import { Modal } from '../components/ui/Modal'
import { Button, buttonStyles } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { FullPageLoader } from '../components/ui/Loader'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { createBarterOffer, getListing, getUserProfile } from '../firebase/firestore'
import { categoryLabel, conditionLabel, locationLabel } from '../lib/constants'
import {
  classForStatus,
  cn,
  formatDate,
  formatMNT,
  placeholderImage,
} from '../lib/utils'

export function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const { t, lang } = useLanguage()
  const { configured, firebaseUser, profile } = useAuth()
  const navigate = useNavigate()

  const listingState = useAsyncData(
    () => (id && configured ? getListing(id) : Promise.resolve(null)),
    [id, configured]
  )
  const listing = listingState.data

  const ownerState = useAsyncData(
    () =>
      listing && configured ? getUserProfile(listing.userId) : Promise.resolve(null),
    [listing?.userId, configured]
  )
  const owner = ownerState.data

  const [active, setActive] = useState(0)
  const [offerOpen, setOfferOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [offeredItem, setOfferedItem] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (!configured) {
    return (
      <PageTransition>
        <div className="container-app py-12">
          <ConfigNotice />
        </div>
      </PageTransition>
    )
  }

  if (listingState.loading) return <FullPageLoader />

  if (!listing) {
    return (
      <PageTransition>
        <div className="container-app py-16">
          <EmptyState title={t('nf_title')} description={t('nf_desc')} />
        </div>
      </PageTransition>
    )
  }

  const images =
    listing.imageUrls.length > 0
      ? listing.imageUrls
      : [placeholderImage(listing.id)]

  const isOwner = !!firebaseUser && firebaseUser.uid === listing.userId

  async function submitOffer() {
    if (!listing) return
    if (!firebaseUser) {
      navigate('/login', { state: { from: `/item/${listing.id}` } })
      return
    }
    if (firebaseUser.uid === listing.userId) {
      setError(t('c_ownListing'))
      return
    }
    if (!offeredItem.trim() || !message.trim()) {
      setError(t('au_fillAll'))
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await createBarterOffer({
        listingId: listing.id,
        listingTitle: listing.title,
        fromUserId: firebaseUser.uid,
        fromUserName: profile?.name ?? firebaseUser.displayName ?? 'Member',
        fromUserPhone: profile?.phone ?? '',
        toUserId: listing.userId,
        message: message.trim(),
        offeredItem: offeredItem.trim(),
      })
      setDone(true)
      setOfferedItem('')
      setMessage('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  const isBarter = listing.type === 'barter'
  const isAuction = listing.type === 'auction'

  return (
    <PageTransition>
      <div className="container-app py-8">
        <Link
          to={isBarter ? '/barter' : '/marketplace'}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" /> {t('c_back')}
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
              <FadeImage src={images[active]} alt={listing.title} />
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={cn(
                      'h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors',
                      i === active ? 'border-primary-500' : 'border-transparent'
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-bold text-white',
                  isBarter
                    ? 'bg-primary-600'
                    : isAuction
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                )}
              >
                {t(isBarter ? 'p_typeBarter' : isAuction ? 'p_typeAuction' : 'p_typeSale')}
              </span>
              {listing.status !== 'active' && (
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold capitalize',
                    classForStatus(listing.status)
                  )}
                >
                  {listing.status}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-extrabold text-navy sm:text-3xl">
              {listing.title}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {locationLabel(listing.location, lang)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Tag className="h-4 w-4" /> {categoryLabel(listing.category, lang)}
              </span>
              <span className="text-slate-400">
                {formatDate(listing.createdAt, lang === 'mn' ? 'mn-MN' : 'en-US')}
              </span>
            </p>

            {/* Price / barter box */}
            <div className="mt-5">
              {isBarter ? (
                <div className="rounded-2xl bg-primary-50 p-5">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary-600">
                    <Repeat className="h-4 w-4" /> {t('b_wants')}
                  </p>
                  <p className="mt-1 text-lg font-bold text-navy">
                    {listing.wantedExchange || '—'}
                  </p>
                </div>
              ) : isAuction ? (
                <Link
                  to={`/auction`}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-amber-700"
                >
                  <Gavel className="h-5 w-5" /> {t('a_title')}
                </Link>
              ) : (
                <p className="text-3xl font-black text-navy">
                  {formatMNT(listing.fixedPrice)}
                </p>
              )}
            </div>

            <div className="mt-3 inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
              {t('c_condition')}: {conditionLabel(listing.condition, lang)}
            </div>

            {/* Description */}
            <div className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-navy">
                {t('m_description')}
              </h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-600">
                {listing.description || '—'}
              </p>
            </div>

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
                    {owner?.name ?? listing.ownerName ?? 'Member'}
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

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              {isOwner && !isAuction ? (
                <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500">
                  {t('c_ownListing')}
                </p>
              ) : isBarter ? (
                <Button
                  size="lg"
                  onClick={() => {
                    setDone(false)
                    setError('')
                    setOfferOpen(true)
                  }}
                  disabled={listing.status !== 'active'}
                >
                  <Repeat className="h-5 w-5" /> {t('b_offer')}
                </Button>
              ) : isAuction ? (
                <Link to="/auction" className={buttonStyles('primary', 'lg')}>
                  <Gavel className="h-5 w-5" /> {t('a_placeBid')}
                </Link>
              ) : (
                <Button
                  size="lg"
                  onClick={() => setContactOpen(true)}
                  disabled={listing.status !== 'active'}
                >
                  <Phone className="h-5 w-5" /> {t('m_contact')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barter offer modal */}
      <Modal
        open={offerOpen}
        onClose={() => setOfferOpen(false)}
        title={t('b_offerTitle')}
        footer={
          !done && (
            <>
              <Button variant="ghost" onClick={() => setOfferOpen(false)}>
                {t('c_cancel')}
              </Button>
              <Button onClick={submitOffer} loading={submitting}>
                {t('b_sendOffer')}
              </Button>
            </>
          )
        }
      >
        {done ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Repeat className="h-6 w-6" />
            </div>
            <p className="font-semibold text-navy">{t('b_offerSent')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label={t('b_offeredItem')}
              placeholder={t('b_offeredItemPh')}
              value={offeredItem}
              onChange={(e) => setOfferedItem(e.target.value)}
            />
            <Textarea
              label={t('b_message')}
              placeholder={t('b_messagePh')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
            {!firebaseUser && (
              <p className="text-xs text-slate-500">{t('c_signInToContinue')}</p>
            )}
          </div>
        )}
      </Modal>

      {/* Contact seller modal */}
      <Modal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={t('m_seller')}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <User className="h-5 w-5" />
            </span>
            <p className="font-semibold text-navy">
              {owner?.name ?? listing.ownerName ?? 'Member'}
            </p>
          </div>
          {owner?.phone && (
            <a
              href={`tel:${owner.phone}`}
              className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-navy hover:bg-slate-100"
            >
              <Phone className="h-4 w-4 text-primary-600" /> {owner.phone}
            </a>
          )}
          {owner?.email && (
            <a
              href={`mailto:${owner.email}`}
              className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-navy hover:bg-slate-100"
            >
              <Mail className="h-4 w-4 text-primary-600" /> {owner.email}
            </a>
          )}
          {owner?.facebookUrl && (
            <a
              href={owner.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-navy hover:bg-slate-100"
            >
              <Facebook className="h-4 w-4 text-primary-600" /> Facebook
            </a>
          )}
          {!owner?.phone && !owner?.email && !owner?.facebookUrl && (
            <p className="text-sm text-slate-500">{t('c_noResults')}</p>
          )}
        </div>
      </Modal>
    </PageTransition>
  )
}
