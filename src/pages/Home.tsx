import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Gavel,
  Handshake,
  Plus,
  Repeat,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Store,
} from 'lucide-react'
import { PageTransition } from '../components/PageTransition'
import { ScrollReveal } from '../components/ScrollReveal'
import { SectionHeading } from '../components/SectionHeading'
import { SearchBar } from '../components/SearchBar'
import { CategoryCard } from '../components/CategoryCard'
import { ListingCard } from '../components/ListingCard'
import { AuctionCard } from '../components/AuctionCard'
import { ConfigNotice } from '../components/ConfigNotice'
import { CardGridSkeleton } from '../components/ui/LoadingSkeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { buttonStyles } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { fetchAuctions, fetchListings } from '../firebase/firestore'
import { CATEGORIES } from '../lib/constants'
import { formatNumber, placeholderImage } from '../lib/utils'

function HeroFloatingCards() {
  const cards = [
    { id: 'h1', label: 'iPhone ⇄ Drone', top: 'top-2 left-0', delay: 0 },
    { id: 'h2', label: '🚗 Live auction', top: 'top-28 right-2', delay: 0.6 },
    { id: 'h3', label: '🎸 For sale', top: 'top-56 left-10', delay: 1.2 },
  ]
  return (
    <div className="relative hidden h-[360px] w-full lg:block">
      {cards.map((c) => (
        <motion.div
          key={c.id}
          className={`absolute ${c.top} w-52 overflow-hidden rounded-2xl border border-white/70 bg-white shadow-soft`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: [0, -12, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: c.delay },
            y: {
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: c.delay,
            },
          }}
        >
          <img
            src={placeholderImage(c.id)}
            alt=""
            className="h-28 w-full object-cover"
          />
          <div className="p-3">
            <p className="text-sm font-bold text-navy">{c.label}</p>
            <p className="text-xs text-slate-400">Barter9911.mn</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function Home() {
  const { t } = useLanguage()
  const { configured } = useAuth()
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  const listings = useAsyncData(
    () => (configured ? fetchListings({ status: 'active', max: 60 }) : Promise.resolve([])),
    [configured]
  )
  const auctions = useAsyncData(
    () => (configured ? fetchAuctions(24) : Promise.resolve([])),
    [configured]
  )

  const all = listings.data ?? []
  const barterItems = all.filter((l) => l.type === 'barter').slice(0, 4)
  const saleItems = all.filter((l) => l.type === 'sale').slice(0, 8)
  const liveAuctions = (auctions.data ?? [])
    .filter((a) => a.status === 'active' && Date.now() < a.endTime)
    .slice(0, 4)

  function submitSearch() {
    navigate(`/marketplace?search=${encodeURIComponent(q.trim())}`)
  }

  const stats = [
    { icon: Handshake, value: '5,000+', label: t('h_statUsers') },
    {
      icon: Store,
      value: configured && listings.data ? formatNumber(all.length) + '+' : '1,200+',
      label: t('h_statListings'),
    },
    {
      icon: Gavel,
      value: configured && auctions.data ? formatNumber((auctions.data ?? []).length) + '+' : '350+',
      label: t('h_statAuctions'),
    },
  ]

  const steps = [
    { icon: Plus, title: t('h_step1'), desc: t('h_step1d') },
    { icon: Repeat, title: t('h_step2'), desc: t('h_step2d') },
    { icon: BadgeCheck, title: t('h_step3'), desc: t('h_step3d') },
  ]
  const trust = [
    { icon: ShieldCheck, title: t('h_trust1'), desc: t('h_trust1d') },
    { icon: ScrollText, title: t('h_trust2'), desc: t('h_trust2d') },
    { icon: Gavel, title: t('h_trust3'), desc: t('h_trust3d') },
  ]

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/70 via-white to-white">
        <div className="absolute inset-0 -z-10 bg-hero-grid [background-size:22px_22px] opacity-60" />
        <div className="absolute -left-24 -top-24 -z-10 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute right-0 top-20 -z-10 h-80 w-80 rounded-full bg-primary-300/30 blur-3xl" />
        <div className="container-app grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-primary-700 shadow-sm"
            >
              <Sparkles className="h-4 w-4" /> {t('h_heroBadge')}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-navy sm:text-5xl lg:text-6xl"
            >
              {t('h_heroTitle1')}{' '}
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                {t('h_heroAccent')}
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600"
            >
              {t('h_heroSubtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-7 max-w-xl"
            >
              <SearchBar
                value={q}
                onChange={setQ}
                onSubmit={submitSearch}
                size="lg"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="mt-6 flex flex-wrap gap-3"
            >
              <Link to="/post" className={buttonStyles('primary', 'lg')}>
                <Plus className="h-5 w-5" /> {t('h_ctaPost')}
              </Link>
              <Link to="/marketplace" className={buttonStyles('outline', 'lg')}>
                {t('h_ctaBrowse')} <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>

          <HeroFloatingCards />
        </div>

        {/* Stats band */}
        <div className="container-app pb-14">
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card sm:p-7">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-1 text-center"
              >
                <s.icon className="mb-1 h-6 w-6 text-primary-600" />
                <span className="text-2xl font-black text-navy sm:text-3xl">
                  {s.value}
                </span>
                <span className="text-xs text-slate-500 sm:text-sm">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-app py-14">
        <ScrollReveal>
          <SectionHeading title={t('h_categories')} subtitle={t('h_categoriesSub')} />
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.slice(0, 12).map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Featured barter */}
      <section className="container-app py-10">
        <SectionHeading
          title={t('h_featuredBarter')}
          subtitle={t('h_featuredBarterSub')}
          action={
            <Link to="/barter" className={buttonStyles('ghost', 'sm')}>
              {t('c_seeAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        {!configured ? (
          <ConfigNotice />
        ) : listings.loading ? (
          <CardGridSkeleton count={4} />
        ) : barterItems.length === 0 ? (
          <EmptyState title={t('c_noResults')} description={t('c_noResultsDesc')} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {barterItems.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      {/* Active auctions */}
      <section className="bg-slate-50/70 py-12">
        <div className="container-app">
          <SectionHeading
            title={t('h_activeAuctions')}
            subtitle={t('h_activeAuctionsSub')}
            action={
              <Link to="/auction" className={buttonStyles('ghost', 'sm')}>
                {t('c_seeAll')} <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          {!configured ? (
            <ConfigNotice />
          ) : auctions.loading ? (
            <CardGridSkeleton count={4} />
          ) : liveAuctions.length === 0 ? (
            <EmptyState title={t('c_noResults')} description={t('c_noResultsDesc')} />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {liveAuctions.map((a) => (
                <AuctionCard key={a.id} auction={a} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest marketplace */}
      <section className="container-app py-14">
        <SectionHeading
          title={t('h_latest')}
          subtitle={t('h_latestSub')}
          action={
            <Link to="/marketplace" className={buttonStyles('ghost', 'sm')}>
              {t('c_seeAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        {!configured ? (
          <ConfigNotice />
        ) : listings.loading ? (
          <CardGridSkeleton count={4} />
        ) : saleItems.length === 0 ? (
          <EmptyState title={t('c_noResults')} description={t('c_noResultsDesc')} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {saleItems.slice(0, 4).map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-navy py-16 text-white">
        <div className="container-app">
          <ScrollReveal>
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-extrabold sm:text-3xl">{t('h_how')}</h2>
              <p className="mt-2 text-slate-300">{t('h_howSub')}</p>
            </div>
          </ScrollReveal>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 0.1}>
                <div className="relative h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <span className="absolute right-5 top-4 text-5xl font-black text-white/10">
                    {i + 1}
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
                    <s.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {s.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & safety */}
      <section className="container-app py-16">
        <ScrollReveal>
          <SectionHeading title={t('h_trust')} subtitle={t('h_trustSub')} center />
        </ScrollReveal>
        <div className="grid gap-6 md:grid-cols-3">
          {trust.map((s, i) => (
            <ScrollReveal key={s.title} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-navy">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {s.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-app pb-20">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 to-primary-500 px-8 py-14 text-center text-white shadow-glow">
            <div className="absolute inset-0 bg-hero-grid [background-size:20px_20px] opacity-20" />
            <div className="relative">
              <h2 className="text-3xl font-extrabold sm:text-4xl">
                {t('h_ctaTitle')}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-primary-50">
                {t('h_ctaSubtitle')}
              </p>
              <Link
                to="/post"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-base font-bold text-primary-700 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.99]"
              >
                <Plus className="h-5 w-5" /> {t('h_ctaButton')}
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </PageTransition>
  )
}
