import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type Timestamp,
} from 'firebase/firestore'
import { requireDb } from './config'
import type {
  AppUser,
  Auction,
  AuctionStatus,
  BarterOffer,
  Bid,
  Category,
  Condition,
  Listing,
  ListingStatus,
  ListingType,
  OfferStatus,
  Role,
} from '../types'

// ---------------------------------------------------------------------------
// Helpers & mappers
// ---------------------------------------------------------------------------

function ts(value: unknown): number {
  if (
    value &&
    typeof value === 'object' &&
    'toMillis' in (value as Record<string, unknown>)
  ) {
    try {
      return (value as Timestamp).toMillis()
    } catch {
      return Date.now()
    }
  }
  if (typeof value === 'number') return value
  return Date.now()
}

function mapListing(id: string, d: DocumentData): Listing {
  return {
    id,
    userId: d.userId ?? '',
    ownerName: d.ownerName ?? '',
    type: (d.type ?? 'sale') as ListingType,
    title: d.title ?? '',
    description: d.description ?? '',
    category: d.category ?? '',
    location: d.location ?? '',
    condition: (d.condition ?? 'good') as Condition,
    imageUrls: Array.isArray(d.imageUrls) ? d.imageUrls : [],
    status: (d.status ?? 'pending') as ListingStatus,
    wantedExchange: d.wantedExchange ?? '',
    fixedPrice: typeof d.fixedPrice === 'number' ? d.fixedPrice : undefined,
    createdAt: ts(d.createdAt),
    updatedAt: ts(d.updatedAt),
  }
}

function mapAuction(id: string, d: DocumentData): Auction {
  return {
    id,
    listingId: d.listingId ?? '',
    title: d.title ?? '',
    image: d.image ?? '',
    category: d.category ?? '',
    location: d.location ?? '',
    startingPrice: Number(d.startingPrice ?? 0),
    maxPrice: d.maxPrice ?? null,
    hasUnlimitedMaxPrice: Boolean(d.hasUnlimitedMaxPrice),
    currentPrice: Number(d.currentPrice ?? d.startingPrice ?? 0),
    duration: d.duration ?? '1d',
    endTime: ts(d.endTime),
    status: (d.status ?? 'active') as AuctionStatus,
    highestBidderId: d.highestBidderId ?? null,
    highestBidderName: d.highestBidderName ?? null,
    createdAt: ts(d.createdAt),
  }
}

function mapBid(id: string, d: DocumentData): Bid {
  return {
    id,
    auctionId: d.auctionId ?? '',
    userId: d.userId ?? '',
    userName: d.userName ?? 'Member',
    amount: Number(d.amount ?? 0),
    createdAt: ts(d.createdAt),
  }
}

function mapOffer(id: string, d: DocumentData): BarterOffer {
  return {
    id,
    listingId: d.listingId ?? '',
    listingTitle: d.listingTitle ?? '',
    fromUserId: d.fromUserId ?? '',
    fromUserName: d.fromUserName ?? 'Member',
    message: d.message ?? '',
    offeredItem: d.offeredItem ?? '',
    status: (d.status ?? 'pending') as OfferStatus,
    createdAt: ts(d.createdAt),
  }
}

function mapUser(id: string, d: DocumentData): AppUser {
  return {
    id,
    name: d.name ?? 'Member',
    email: d.email ?? '',
    phone: d.phone ?? '',
    facebookUrl: d.facebookUrl ?? '',
    role: (d.role ?? 'user') as Role,
    createdAt: ts(d.createdAt),
  }
}

function mapCategory(id: string, d: DocumentData): Category {
  return {
    id,
    name: d.name ?? '',
    nameMn: d.nameMn ?? '',
    icon: d.icon ?? 'Tag',
    createdAt: ts(d.createdAt),
  }
}

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

export interface NewListing {
  userId: string
  ownerName: string
  type: ListingType
  title: string
  description: string
  category: string
  location: string
  condition: Condition
  imageUrls: string[]
  wantedExchange?: string
  fixedPrice?: number
}

export async function createListing(input: NewListing): Promise<string> {
  const db = requireDb()
  const ref = await addDoc(collection(db, 'listings'), {
    ...input,
    wantedExchange: input.wantedExchange ?? '',
    fixedPrice: input.fixedPrice ?? null,
    status: 'pending' as ListingStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

// Fetch recent listings (ordered by a single field to avoid composite index
// requirements), then filter by type/status/category/location/condition/search
// on the client.
export async function fetchListings(opts: {
  type?: ListingType
  status?: ListingStatus
  category?: string
  location?: string
  condition?: Condition | ''
  search?: string
  max?: number
}): Promise<Listing[]> {
  const db = requireDb()
  const q = query(
    collection(db, 'listings'),
    orderBy('createdAt', 'desc'),
    fbLimit(opts.max ?? 200)
  )
  const snap = await getDocs(q)
  let items = snap.docs.map((d) => mapListing(d.id, d.data()))

  if (opts.type) items = items.filter((l) => l.type === opts.type)
  if (opts.status) items = items.filter((l) => l.status === opts.status)
  if (opts.category) items = items.filter((l) => l.category === opts.category)
  if (opts.location) items = items.filter((l) => l.location === opts.location)
  if (opts.condition) items = items.filter((l) => l.condition === opts.condition)
  if (opts.search) {
    const s = opts.search.toLowerCase().trim()
    items = items.filter(
      (l) =>
        l.title.toLowerCase().includes(s) ||
        l.description.toLowerCase().includes(s) ||
        (l.wantedExchange ?? '').toLowerCase().includes(s)
    )
  }
  return items
}

export async function getListing(id: string): Promise<Listing | null> {
  const db = requireDb()
  const snap = await getDoc(doc(db, 'listings', id))
  return snap.exists() ? mapListing(snap.id, snap.data()) : null
}

export async function getUserListings(userId: string): Promise<Listing[]> {
  const db = requireDb()
  const q = query(collection(db, 'listings'), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => mapListing(d.id, d.data()))
    .sort((a, b) => b.createdAt - a.createdAt)
}

export async function updateListing(
  id: string,
  patch: Partial<Listing>
): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, 'listings', id), {
    ...patch,
    updatedAt: serverTimestamp(),
  })
}

export async function setListingStatus(
  id: string,
  status: ListingStatus
): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, 'listings', id), {
    status,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteListing(id: string): Promise<void> {
  const db = requireDb()
  await deleteDoc(doc(db, 'listings', id))
}

// ---------------------------------------------------------------------------
// Auctions & bids
// ---------------------------------------------------------------------------

export interface NewAuction {
  listingId: string
  title: string
  image?: string
  category?: string
  location?: string
  startingPrice: number
  maxPrice?: number | null
  hasUnlimitedMaxPrice: boolean
  duration: string
  endTime: number
}

export async function createAuction(input: NewAuction): Promise<string> {
  const db = requireDb()
  const ref = await addDoc(collection(db, 'auctions'), {
    ...input,
    image: input.image ?? '',
    category: input.category ?? '',
    location: input.location ?? '',
    maxPrice: input.hasUnlimitedMaxPrice ? null : input.maxPrice ?? null,
    currentPrice: input.startingPrice,
    status: 'active' as AuctionStatus,
    highestBidderId: null,
    highestBidderName: null,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function fetchAuctions(max = 200): Promise<Auction[]> {
  const db = requireDb()
  const q = query(
    collection(db, 'auctions'),
    orderBy('createdAt', 'desc'),
    fbLimit(max)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => mapAuction(d.id, d.data()))
}

export async function getAuction(id: string): Promise<Auction | null> {
  const db = requireDb()
  const snap = await getDoc(doc(db, 'auctions', id))
  return snap.exists() ? mapAuction(snap.id, snap.data()) : null
}

export async function getAuctionByListing(
  listingId: string
): Promise<Auction | null> {
  const db = requireDb()
  const q = query(
    collection(db, 'auctions'),
    where('listingId', '==', listingId),
    fbLimit(1)
  )
  const snap = await getDocs(q)
  const first = snap.docs[0]
  return first ? mapAuction(first.id, first.data()) : null
}

export async function getBids(auctionId: string): Promise<Bid[]> {
  const db = requireDb()
  const q = query(collection(db, 'bids'), where('auctionId', '==', auctionId))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => mapBid(d.id, d.data()))
    .sort((a, b) => b.createdAt - a.createdAt)
}

export interface PlaceBidResult {
  newPrice: number
  closed: boolean
}

/**
 * Atomically place a bid. Validates that the auction is live and that the bid
 * beats the current price. If a (non-unlimited) maximum price is hit, the
 * auction closes at that maximum.
 */
export async function placeBid(
  auctionId: string,
  userId: string,
  userName: string,
  amount: number
): Promise<PlaceBidResult> {
  const db = requireDb()
  const auctionRef = doc(db, 'auctions', auctionId)
  const bidRef = doc(collection(db, 'bids'))

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(auctionRef)
    if (!snap.exists()) throw new Error('Auction not found.')
    const a = mapAuction(snap.id, snap.data())

    if (a.status !== 'active' || Date.now() >= a.endTime) {
      throw new Error('This auction has ended.')
    }
    if (amount <= a.currentPrice) {
      throw new Error('Your bid must be higher than the current bid.')
    }

    let finalAmount = amount
    let closed = false
    if (!a.hasUnlimitedMaxPrice && a.maxPrice && amount >= a.maxPrice) {
      finalAmount = a.maxPrice
      closed = true
    }

    tx.update(auctionRef, {
      currentPrice: finalAmount,
      highestBidderId: userId,
      highestBidderName: userName,
      status: closed ? 'ended' : 'active',
    })
    tx.set(bidRef, {
      auctionId,
      userId,
      userName,
      amount: finalAmount,
      createdAt: serverTimestamp(),
    })

    return { newPrice: finalAmount, closed }
  })
}

export async function endAuction(id: string): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, 'auctions', id), { status: 'ended' as AuctionStatus })
}

export async function getUserBids(userId: string): Promise<Bid[]> {
  const db = requireDb()
  const q = query(collection(db, 'bids'), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => mapBid(d.id, d.data()))
    .sort((a, b) => b.createdAt - a.createdAt)
}

// ---------------------------------------------------------------------------
// Barter offers
// ---------------------------------------------------------------------------

export interface NewOffer {
  listingId: string
  listingTitle: string
  fromUserId: string
  fromUserName: string
  message: string
  offeredItem: string
}

export async function createBarterOffer(input: NewOffer): Promise<string> {
  const db = requireDb()
  const ref = await addDoc(collection(db, 'barterOffers'), {
    ...input,
    status: 'pending' as OfferStatus,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getUserOffers(userId: string): Promise<BarterOffer[]> {
  const db = requireDb()
  const q = query(
    collection(db, 'barterOffers'),
    where('fromUserId', '==', userId)
  )
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => mapOffer(d.id, d.data()))
    .sort((a, b) => b.createdAt - a.createdAt)
}

export async function setOfferStatus(
  id: string,
  status: OfferStatus
): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, 'barterOffers', id), { status })
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  const db = requireDb()
  const snap = await getDocs(collection(db, 'categories'))
  return snap.docs
    .map((d) => mapCategory(d.id, d.data()))
    .sort((a, b) => a.createdAt - b.createdAt)
}

export async function addCategory(name: string, icon = 'Tag'): Promise<string> {
  const db = requireDb()
  const ref = await addDoc(collection(db, 'categories'), {
    name,
    icon,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function deleteCategory(id: string): Promise<void> {
  const db = requireDb()
  await deleteDoc(doc(db, 'categories', id))
}

// ---------------------------------------------------------------------------
// Users / profile
// ---------------------------------------------------------------------------

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const db = requireDb()
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? mapUser(snap.id, snap.data()) : null
}

export async function updateUserProfile(
  uid: string,
  patch: Partial<Pick<AppUser, 'name' | 'phone' | 'facebookUrl'>>
): Promise<void> {
  const db = requireDb()
  await setDoc(doc(db, 'users', uid), patch, { merge: true })
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export async function getAllListings(max = 500): Promise<Listing[]> {
  const db = requireDb()
  const q = query(
    collection(db, 'listings'),
    orderBy('createdAt', 'desc'),
    fbLimit(max)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => mapListing(d.id, d.data()))
}

export async function getAllUsers(max = 500): Promise<AppUser[]> {
  const db = requireDb()
  const snap = await getDocs(query(collection(db, 'users'), fbLimit(max)))
  return snap.docs
    .map((d) => mapUser(d.id, d.data()))
    .sort((a, b) => b.createdAt - a.createdAt)
}
