import { useState } from 'react'
import {
  BarChart3,
  Check,
  Gavel,
  Plus,
  Repeat,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { PageTransition } from '../components/PageTransition'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfigNotice } from '../components/ConfigNotice'
import { FullPageLoader } from '../components/ui/Loader'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useAsyncData } from '../hooks/useAsyncData'
import {
  addCategory,
  deleteCategory,
  deleteListing,
  fetchAuctions,
  getAllListings,
  getAllUsers,
  getCategories,
  setListingStatus,
  setUserRole,
} from '../firebase/firestore'
import { classForStatus, cn, formatDate } from '../lib/utils'

export function AdminDashboard() {
  const { t } = useLanguage()
  const { configured } = useAuth()

  const listings = useAsyncData(
    () => (configured ? getAllListings(500) : Promise.resolve([])),
    [configured]
  )
  const users = useAsyncData(
    () => (configured ? getAllUsers(500) : Promise.resolve([])),
    [configured]
  )
  const auctions = useAsyncData(
    () => (configured ? fetchAuctions(500) : Promise.resolve([])),
    [configured]
  )
  const categories = useAsyncData(
    () => (configured ? getCategories() : Promise.resolve([])),
    [configured]
  )

  const [newCat, setNewCat] = useState('')

  if (!configured) {
    return (
      <PageTransition>
        <div className="container-app py-12">
          <ConfigNotice />
        </div>
      </PageTransition>
    )
  }

  if (listings.loading) return <FullPageLoader />

  const all = listings.data ?? []
  const usersList = users.data ?? []
  const auctionsList = auctions.data ?? []
  const pending = all.filter((l) => l.status === 'pending')

  const byType = {
    barter: all.filter((l) => l.type === 'barter').length,
    auction: all.filter((l) => l.type === 'auction').length,
    sale: all.filter((l) => l.type === 'sale').length,
  }
  const maxType = Math.max(1, byType.barter, byType.auction, byType.sale)

  const stats = [
    { icon: Users, label: t('ad_totalUsers'), value: usersList.length, color: 'text-primary-600' },
    { icon: BarChart3, label: t('ad_totalListings'), value: all.length, color: 'text-emerald-600' },
    {
      icon: Gavel,
      label: t('ad_activeAuctions'),
      value: auctionsList.filter((a) => a.status === 'active' && Date.now() < a.endTime).length,
      color: 'text-amber-600',
    },
    { icon: Repeat, label: t('ad_barterPosts'), value: byType.barter, color: 'text-primary-600' },
    { icon: Check, label: t('ad_pending'), value: pending.length, color: 'text-rose-600' },
  ]

  async function approve(id: string) {
    await setListingStatus(id, 'active')
    listings.reload()
  }
  async function reject(id: string) {
    await setListingStatus(id, 'rejected')
    listings.reload()
  }
  async function remove(id: string) {
    if (!window.confirm(t('d_deleteConfirm'))) return
    await deleteListing(id)
    listings.reload()
  }
  async function handleAddCat() {
    if (!newCat.trim()) return
    await addCategory(newCat.trim())
    setNewCat('')
    categories.reload()
  }

  async function toggleRole(uid: string, role: 'user' | 'admin') {
    await setUserRole(uid, role)
    users.reload()
  }

  return (
    <PageTransition>
      <div className="container-app py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-navy">
            {t('ad_title')}
          </h1>
          <p className="mt-1 text-slate-500">{t('ad_subtitle')}</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card"
            >
              <s.icon className={cn('h-6 w-6', s.color)} />
              <p className="mt-3 text-2xl font-black text-navy">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Analytics */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-bold text-navy">{t('ad_analytics')}</h2>
            <div className="space-y-4">
              {([
                ['barter', byType.barter, 'bg-primary-500'],
                ['auction', byType.auction, 'bg-amber-500'],
                ['sale', byType.sale, 'bg-emerald-500'],
              ] as const).map(([label, value, color]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium capitalize text-navy">{label}</span>
                    <span className="text-slate-400">{value}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn('h-full rounded-full', color)}
                      style={{ width: `${(value / maxType) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest users */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-bold text-navy">{t('ad_latestUsers')}</h2>
            {usersList.length === 0 ? (
              <p className="text-sm text-slate-400">{t('c_noResults')}</p>
            ) : (
              <ul className="space-y-3">
                {usersList.slice(0, 6).map((u) => (
                  <li key={u.id} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                      {u.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy">
                        {u.name}{' '}
                        {u.role === 'admin' && (
                          <span className="ml-1 rounded bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700">
                            ADMIN
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-slate-400">{u.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Categories */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-bold text-navy">{t('ad_manageCats')}</h2>
            <div className="flex gap-2">
              <Input
                placeholder={t('ad_catName')}
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
              />
              <Button onClick={handleAddCat}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(categories.data ?? []).length === 0 ? (
                <p className="text-xs text-slate-400">
                  Default categories are used until you add custom ones.
                </p>
              ) : (
                (categories.data ?? []).map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-navy"
                  >
                    {c.name}
                    <button
                      onClick={() => deleteCategory(c.id).then(() => categories.reload())}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Manage users */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-navy">{t('ad_users')}</h2>
          {usersList.length === 0 ? (
            <EmptyState title={t('c_noResults')} />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t('au_name')}</th>
                    <th className="px-4 py-3 font-semibold">{t('au_email')}</th>
                    <th className="px-4 py-3 font-semibold">{t('ad_role')}</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      {t('ad_actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-medium text-navy">{u.name}</td>
                      <td className="px-4 py-3 text-slate-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'rounded-md px-2 py-0.5 text-xs font-semibold capitalize',
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          {u.role === 'admin' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleRole(u.id, 'user')}
                            >
                              {t('ad_removeAdmin')}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => toggleRole(u.id, 'admin')}
                            >
                              <ShieldCheck className="h-4 w-4" /> {t('ad_makeAdmin')}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending approvals */}
        {pending.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-navy">{t('ad_pending')}</h2>
            <div className="space-y-3">
              {pending.map((l) => (
                <div
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50/40 p-4"
                >
                  <div>
                    <p className="font-bold text-navy">{l.title}</p>
                    <p className="text-xs text-slate-500">
                      {l.ownerName} · {l.type} · {formatDate(l.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approve(l.id)}>
                      <Check className="h-4 w-4" /> {t('ad_approve')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => reject(l.id)}>
                      <X className="h-4 w-4" /> {t('ad_reject')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All listings table */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-navy">{t('ad_allListings')}</h2>
          {all.length === 0 ? (
            <EmptyState title={t('c_noResults')} />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t('p_titleLabel')}</th>
                    <th className="px-4 py-3 font-semibold">{t('ad_owner')}</th>
                    <th className="px-4 py-3 font-semibold">{t('ad_type')}</th>
                    <th className="px-4 py-3 font-semibold">{t('c_status')}</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      {t('ad_actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {all.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/60">
                      <td className="max-w-[220px] truncate px-4 py-3 font-medium text-navy">
                        {l.title}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{l.ownerName}</td>
                      <td className="px-4 py-3 capitalize text-slate-500">{l.type}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'rounded-md px-2 py-0.5 text-xs font-semibold capitalize',
                            classForStatus(l.status)
                          )}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          {l.status !== 'active' && (
                            <button
                              onClick={() => approve(l.id)}
                              title={t('ad_approve')}
                              className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 hover:bg-emerald-100"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          {l.status !== 'rejected' && (
                            <button
                              onClick={() => reject(l.id)}
                              title={t('ad_reject')}
                              className="rounded-lg bg-amber-50 p-1.5 text-amber-600 hover:bg-amber-100"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => remove(l.id)}
                            title={t('c_delete')}
                            className="rounded-lg bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
