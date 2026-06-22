import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Gavel,
  LayoutGrid,
  Pencil,
  Phone,
  Plus,
  Repeat,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { PageTransition } from '../components/PageTransition'
import { Button, buttonStyles } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfigNotice } from '../components/ConfigNotice'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useAsyncData } from '../hooks/useAsyncData'
import {
  deleteListing,
  getReceivedOffers,
  getUserBids,
  getUserListings,
  getUserOffers,
  setListingStatus,
  setOfferStatus,
  updateUserProfile,
} from '../firebase/firestore'
import { categoryLabel } from '../lib/constants'
import {
  classForStatus,
  cn,
  formatDate,
  formatMNT,
  placeholderImage,
} from '../lib/utils'

type Tab = 'listings' | 'offers' | 'bids' | 'profile'

export function Dashboard() {
  const { t, lang } = useLanguage()
  const { configured, firebaseUser, profile, refreshProfile } = useAuth()
  const uid = firebaseUser?.uid
  const [tab, setTab] = useState<Tab>('listings')

  const listings = useAsyncData(
    () => (uid && configured ? getUserListings(uid) : Promise.resolve([])),
    [uid, configured]
  )
  const offers = useAsyncData(
    () => (uid && configured ? getUserOffers(uid) : Promise.resolve([])),
    [uid, configured]
  )
  const received = useAsyncData(
    () => (uid && configured ? getReceivedOffers(uid) : Promise.resolve([])),
    [uid, configured]
  )
  const bids = useAsyncData(
    () => (uid && configured ? getUserBids(uid) : Promise.resolve([])),
    [uid, configured]
  )

  // Profile form
  const [name, setName] = useState(profile?.name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [facebookUrl, setFacebookUrl] = useState(profile?.facebookUrl ?? '')
  const [savedMsg, setSavedMsg] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleStatus(id: string, status: 'sold' | 'exchanged') {
    await setListingStatus(id, status)
    listings.reload()
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('d_deleteConfirm'))) return
    await deleteListing(id)
    listings.reload()
  }

  async function handleOfferStatus(id: string, status: 'accepted' | 'rejected') {
    await setOfferStatus(id, status)
    received.reload()
  }

  async function saveProfile() {
    if (!uid) return
    setSaving(true)
    setSavedMsg('')
    try {
      await updateUserProfile(uid, { name, phone, facebookUrl })
      await refreshProfile()
      setSavedMsg(t('d_profileSaved'))
    } finally {
      setSaving(false)
    }
  }

  if (!configured) {
    return (
      <PageTransition>
        <div className="container-app py-12">
          <ConfigNotice />
        </div>
      </PageTransition>
    )
  }

  const myListings = listings.data ?? []
  const stats = [
    { icon: LayoutGrid, label: t('d_tabListings'), value: myListings.length },
    { icon: Repeat, label: t('d_tabOffers'), value: (offers.data ?? []).length },
    { icon: TrendingUp, label: t('d_tabBids'), value: (bids.data ?? []).length },
    {
      icon: CheckCircle2,
      label: t('c_status'),
      value: myListings.filter((l) => l.status === 'active').length,
    },
  ]

  const tabs: { id: Tab; label: string }[] = [
    { id: 'listings', label: t('d_tabListings') },
    { id: 'offers', label: t('d_tabOffers') },
    { id: 'bids', label: t('d_tabBids') },
    { id: 'profile', label: t('d_tabProfile') },
  ]

  return (
    <PageTransition>
      <div className="container-app py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-navy">
              {t('d_title')}
            </h1>
            <p className="mt-1 text-slate-500">
              {t('d_welcome')}, {profile?.name ?? 'Member'} 👋
            </p>
          </div>
          <Link to="/post" className={buttonStyles('primary', 'md')}>
            <Plus className="h-4 w-4" /> {t('nav_post')}
          </Link>
        </div>

        {/* Stat cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card"
            >
              <s.icon className="h-6 w-6 text-primary-600" />
              <p className="mt-3 text-2xl font-black text-navy">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {tabs.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                tab === tb.id
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-500 hover:text-navy'
              )}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {/* Listings */}
        {tab === 'listings' &&
          (myListings.length === 0 ? (
            <EmptyState
              title={t('d_noListings')}
              action={
                <Link to="/post" className={buttonStyles('primary', 'md')}>
                  <Plus className="h-4 w-4" /> {t('d_postFirst')}
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {myListings.map((l) => (
                <div
                  key={l.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                >
                  <img
                    src={l.imageUrls[0] || placeholderImage(l.id)}
                    alt=""
                    className="h-20 w-full rounded-xl object-cover sm:w-24"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-500">
                        {l.type}
                      </span>
                      <span
                        className={cn(
                          'rounded-md px-2 py-0.5 text-xs font-semibold capitalize',
                          classForStatus(l.status)
                        )}
                      >
                        {l.status}
                      </span>
                    </div>
                    <h3 className="mt-1 truncate font-bold text-navy">{l.title}</h3>
                    <p className="text-xs text-slate-400">
                      {categoryLabel(l.category, lang)} · {formatDate(l.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={l.type === 'auction' ? '/auction' : `/item/${l.id}`}
                      className={buttonStyles('ghost', 'sm')}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    {l.status === 'active' && l.type === 'sale' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatus(l.id, 'sold')}
                      >
                        {t('d_markSold')}
                      </Button>
                    )}
                    {l.status === 'active' && l.type === 'barter' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatus(l.id, 'exchanged')}
                      >
                        {t('d_markExchanged')}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(l.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {/* Offers */}
        {tab === 'offers' && (
          <div className="space-y-8">
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy">
                {t('d_received')}
              </h3>
              {(received.data ?? []).length === 0 ? (
                <EmptyState title={t('d_noReceived')} />
              ) : (
                <div className="space-y-3">
                  {(received.data ?? []).map((o) => (
                    <div
                      key={o.id}
                      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-navy">{o.listingTitle}</h3>
                        <span
                          className={cn(
                            'rounded-md px-2 py-0.5 text-xs font-semibold capitalize',
                            classForStatus(
                              o.status === 'accepted' ? 'active' : o.status
                            )
                          )}
                        >
                          {o.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        <span className="font-semibold">{o.fromUserName}</span> —{' '}
                        {o.offeredItem}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{o.message}</p>
                      {o.fromUserPhone && (
                        <a
                          href={`tel:${o.fromUserPhone}`}
                          className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary-600"
                        >
                          <Phone className="h-3.5 w-3.5" /> {o.fromUserPhone}
                        </a>
                      )}
                      {o.status === 'pending' && (
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleOfferStatus(o.id, 'accepted')}
                          >
                            {t('o_accept')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOfferStatus(o.id, 'rejected')}
                          >
                            {t('o_reject')}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy">
                {t('d_sent')}
              </h3>
              {(offers.data ?? []).length === 0 ? (
                <EmptyState title={t('d_noOffers')} />
              ) : (
                <div className="space-y-3">
                  {(offers.data ?? []).map((o) => (
                    <div
                      key={o.id}
                      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-navy">{o.listingTitle}</h3>
                        <span
                          className={cn(
                            'rounded-md px-2 py-0.5 text-xs font-semibold capitalize',
                            classForStatus(
                              o.status === 'accepted' ? 'active' : o.status
                            )
                          )}
                        >
                          {o.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        <span className="font-semibold">{t('b_offeredItem')}:</span>{' '}
                        {o.offeredItem}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{o.message}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(o.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bids */}
        {tab === 'bids' &&
          ((bids.data ?? []).length === 0 ? (
            <EmptyState title={t('d_noBids')} />
          ) : (
            <div className="space-y-3">
              {(bids.data ?? []).map((b) => (
                <Link
                  key={b.id}
                  to={`/auction/${b.auctionId}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-colors hover:border-primary-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Gavel className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-navy">
                        {t('a_yourBid')}: {formatMNT(b.amount)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(b.createdAt)}
                      </p>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-slate-300" />
                </Link>
              ))}
            </div>
          ))}

        {/* Profile */}
        {tab === 'profile' && (
          <div className="max-w-lg space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <Input
              label={t('au_name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label={t('au_email')}
              value={profile?.email ?? ''}
              disabled
            />
            <Input
              label={t('au_phone')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label={t('au_facebook')}
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
            />
            {savedMsg && (
              <p className="text-sm font-medium text-emerald-600">{savedMsg}</p>
            )}
            <Button onClick={saveProfile} loading={saving}>
              {t('d_saveProfile')}
            </Button>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
