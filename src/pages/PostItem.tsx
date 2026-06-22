import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Gavel, Plus, Repeat, Tag } from 'lucide-react'
import { PageTransition } from '../components/PageTransition'
import { ImageUploader } from '../components/ImageUploader'
import { Input, Textarea } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button, buttonStyles } from '../components/ui/Button'
import { ConfigNotice } from '../components/ConfigNotice'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import {
  AUCTION_DURATIONS,
  CATEGORIES,
  CONDITIONS,
  LOCATIONS,
} from '../lib/constants'
import { cn, durationToMs } from '../lib/utils'
import { createAuction, createListing } from '../firebase/firestore'
import { compressImages } from '../lib/image'
import type { Condition, ListingType } from '../types'

const TYPE_CARDS: {
  id: ListingType
  icon: typeof Repeat
  titleKey: 'p_typeBarter' | 'p_typeAuction' | 'p_typeSale'
  descKey: 'p_typeBarterD' | 'p_typeAuctionD' | 'p_typeSaleD'
  color: string
}[] = [
  {
    id: 'barter',
    icon: Repeat,
    titleKey: 'p_typeBarter',
    descKey: 'p_typeBarterD',
    color: 'primary',
  },
  {
    id: 'auction',
    icon: Gavel,
    titleKey: 'p_typeAuction',
    descKey: 'p_typeAuctionD',
    color: 'amber',
  },
  {
    id: 'sale',
    icon: Tag,
    titleKey: 'p_typeSale',
    descKey: 'p_typeSaleD',
    color: 'emerald',
  },
]

export function PostItem() {
  const { t, lang } = useLanguage()
  const { configured, firebaseUser, profile } = useAuth()
  const navigate = useNavigate()

  const [type, setType] = useState<ListingType>('barter')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [condition, setCondition] = useState<Condition | ''>('')
  const [images, setImages] = useState<File[]>([])
  const [wanted, setWanted] = useState('')
  const [fixedPrice, setFixedPrice] = useState('')
  const [startingPrice, setStartingPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [unlimited, setUnlimited] = useState(false)
  const [duration, setDuration] = useState('7d')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [doneId, setDoneId] = useState<string | null>(null)

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
  const durOptions = AUCTION_DURATIONS.map((d) => ({
    value: d.id,
    label: lang === 'mn' ? d.mn : d.en,
  }))

  function validate(): string | null {
    if (!title.trim() || !description.trim() || !category || !location || !condition)
      return t('au_fillAll')
    if (type === 'barter' && !wanted.trim()) return t('au_fillAll')
    if (type === 'sale' && (!fixedPrice || Number(fixedPrice) <= 0))
      return t('au_fillAll')
    if (type === 'auction') {
      if (!startingPrice || Number(startingPrice) <= 0) return t('au_fillAll')
      if (!unlimited && maxPrice && Number(maxPrice) <= Number(startingPrice))
        return t('a_mustBeHigher')
    }
    return null
  }

  async function handleSubmit() {
    if (!firebaseUser) {
      navigate('/login', { state: { from: '/post' } })
      return
    }
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      let imageUrls: string[] = []
      if (images.length > 0) {
        imageUrls = await compressImages(images)
      }

      const listingId = await createListing({
        userId: firebaseUser.uid,
        ownerName: profile?.name ?? firebaseUser.displayName ?? 'Member',
        type,
        title: title.trim(),
        description: description.trim(),
        category,
        location,
        condition: condition as Condition,
        imageUrls,
        wantedExchange: type === 'barter' ? wanted.trim() : undefined,
        fixedPrice: type === 'sale' ? Number(fixedPrice) : undefined,
      })

      if (type === 'auction') {
        await createAuction({
          listingId,
          title: title.trim(),
          image: imageUrls[0] ?? '',
          category,
          location,
          startingPrice: Number(startingPrice),
          maxPrice: unlimited ? null : maxPrice ? Number(maxPrice) : null,
          hasUnlimitedMaxPrice: unlimited,
          duration,
          endTime: Date.now() + durationToMs(duration),
        })
      }

      setDoneId(listingId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setType('barter')
    setTitle('')
    setDescription('')
    setCategory('')
    setLocation('')
    setCondition('')
    setImages([])
    setWanted('')
    setFixedPrice('')
    setStartingPrice('')
    setMaxPrice('')
    setUnlimited(false)
    setDuration('7d')
    setDoneId(null)
    setError('')
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

  if (doneId) {
    return (
      <PageTransition>
        <div className="container-app flex flex-col items-center py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="text-2xl font-extrabold text-navy">{t('p_success')}</h1>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/dashboard" className={buttonStyles('primary', 'lg')}>
              {t('nav_dashboard')}
            </Link>
            <button onClick={reset} className={buttonStyles('outline', 'lg')}>
              <Plus className="h-5 w-5" /> {t('nav_post')}
            </button>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="container-app max-w-3xl py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            {t('p_title')}
          </h1>
          <p className="mt-2 text-slate-500">{t('p_subtitle')}</p>
        </div>

        {/* Type selector */}
        <p className="mb-3 text-sm font-semibold text-navy">{t('p_chooseType')}</p>
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TYPE_CARDS.map((card) => {
            const selected = type === card.id
            return (
              <button
                key={card.id}
                onClick={() => setType(card.id)}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all',
                  selected
                    ? 'border-primary-500 bg-primary-50/60 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    selected
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  )}
                >
                  <card.icon className="h-5 w-5" />
                </span>
                <span className="font-bold text-navy">{t(card.titleKey)}</span>
                <span className="text-xs text-slate-500">{t(card.descKey)}</span>
              </button>
            )
          })}
        </div>

        {/* Core fields */}
        <div className="space-y-5">
          <Input
            label={t('p_titleLabel')}
            placeholder={t('p_titlePh')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            label={t('p_descLabel')}
            placeholder={t('p_descPh')}
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label={t('c_category')}
              options={catOptions}
              placeholder={t('c_category')}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <Select
              label={t('c_location')}
              options={locOptions}
              placeholder={t('c_location')}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Select
              label={t('c_condition')}
              options={condOptions}
              placeholder={t('c_condition')}
              value={condition}
              onChange={(e) => setCondition(e.target.value as Condition)}
            />
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-navy">
              {t('p_imagesLabel')}
            </p>
            <ImageUploader files={images} onChange={setImages} max={6} />
          </div>

          {/* Conditional fields */}
          {type === 'barter' && (
            <Input
              label={t('p_wantedLabel')}
              placeholder={t('p_wantedPh')}
              value={wanted}
              onChange={(e) => setWanted(e.target.value)}
            />
          )}

          {type === 'sale' && (
            <Input
              type="number"
              label={t('p_fixedPrice')}
              placeholder="0"
              value={fixedPrice}
              onChange={(e) => setFixedPrice(e.target.value)}
            />
          )}

          {type === 'auction' && (
            <div className="space-y-4 rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  type="number"
                  label={t('p_startingPrice')}
                  placeholder="0"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                />
                <Input
                  type="number"
                  label={t('p_maxPrice')}
                  placeholder="0"
                  value={maxPrice}
                  disabled={unlimited}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <label className="flex items-center gap-2.5 text-sm font-medium text-navy">
                <input
                  type="checkbox"
                  checked={unlimited}
                  onChange={(e) => setUnlimited(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                {t('p_unlimitedMax')}
              </label>
              <Select
                label={t('p_duration')}
                options={durOptions}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </p>
          )}

          <Button
            size="lg"
            fullWidth
            loading={submitting}
            onClick={handleSubmit}
          >
            {submitting ? t('p_publishing') : t('p_publish')}
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}
