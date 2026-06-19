import type { Condition } from '../types'

export interface CategoryDef {
  id: string
  /** lucide-react icon name */
  icon: string
  en: string
  mn: string
}

// Default category set. Also seeded into the `categories` collection by admins.
export const CATEGORIES: CategoryDef[] = [
  { id: 'electronics', icon: 'Smartphone', en: 'Electronics', mn: 'Цахилгаан бараа' },
  { id: 'vehicles', icon: 'Car', en: 'Vehicles', mn: 'Тээврийн хэрэгсэл' },
  { id: 'home', icon: 'Sofa', en: 'Home & Furniture', mn: 'Гэр ахуй' },
  { id: 'fashion', icon: 'Shirt', en: 'Fashion', mn: 'Хувцас загвар' },
  { id: 'realestate', icon: 'Building2', en: 'Real Estate', mn: 'Үл хөдлөх' },
  { id: 'sports', icon: 'Dumbbell', en: 'Sports & Outdoor', mn: 'Спорт' },
  { id: 'baby', icon: 'Baby', en: 'Baby & Kids', mn: 'Хүүхдийн бараа' },
  { id: 'books', icon: 'BookOpen', en: 'Books & Hobby', mn: 'Ном, хобби' },
  { id: 'beauty', icon: 'Sparkles', en: 'Beauty & Health', mn: 'Гоо сайхан' },
  { id: 'tools', icon: 'Wrench', en: 'Tools', mn: 'Багаж хэрэгсэл' },
  { id: 'pets', icon: 'PawPrint', en: 'Pets & Livestock', mn: 'Амьтан, мал' },
  { id: 'services', icon: 'Handshake', en: 'Services', mn: 'Үйлчилгээ' },
]

export function categoryLabel(id: string, lang: 'en' | 'mn'): string {
  const c = CATEGORIES.find((x) => x.id === id)
  if (!c) return id
  return lang === 'mn' ? c.mn : c.en
}

// Major Mongolian locations for filters.
export const LOCATIONS: { id: string; en: string; mn: string }[] = [
  { id: 'ulaanbaatar', en: 'Ulaanbaatar', mn: 'Улаанбаатар' },
  { id: 'darkhan', en: 'Darkhan', mn: 'Дархан' },
  { id: 'erdenet', en: 'Erdenet', mn: 'Эрдэнэт' },
  { id: 'choibalsan', en: 'Choibalsan', mn: 'Чойбалсан' },
  { id: 'murun', en: 'Mörön', mn: 'Мөрөн' },
  { id: 'khovd', en: 'Khovd', mn: 'Ховд' },
  { id: 'bayankhongor', en: 'Bayankhongor', mn: 'Баянхонгор' },
  { id: 'other', en: 'Other', mn: 'Бусад' },
]

export function locationLabel(id: string, lang: 'en' | 'mn'): string {
  const l = LOCATIONS.find((x) => x.id === id)
  if (!l) return id
  return lang === 'mn' ? l.mn : l.en
}

export const CONDITIONS: { id: Condition; en: string; mn: string }[] = [
  { id: 'new', en: 'New', mn: 'Шинэ' },
  { id: 'like_new', en: 'Like new', mn: 'Шинэ шиг' },
  { id: 'good', en: 'Good', mn: 'Сайн' },
  { id: 'fair', en: 'Fair', mn: 'Дунд' },
  { id: 'used', en: 'Used', mn: 'Хуучин' },
]

export function conditionLabel(id: string, lang: 'en' | 'mn'): string {
  const c = CONDITIONS.find((x) => x.id === id)
  if (!c) return id
  return lang === 'mn' ? c.mn : c.en
}

export const AUCTION_DURATIONS: { id: string; en: string; mn: string }[] = [
  { id: '12h', en: '12 hours', mn: '12 цаг' },
  { id: '1d', en: '1 day', mn: '1 өдөр' },
  { id: '7d', en: '7 days', mn: '7 өдөр' },
  { id: '14d', en: '14 days', mn: '14 өдөр' },
  { id: '1m', en: '1 month', mn: '1 сар' },
]
