// ---------------------------------------------------------------------------
// Shared domain types. Timestamps are stored as epoch milliseconds (number)
// in the app layer; Firestore Timestamp values are converted on read.
// ---------------------------------------------------------------------------

export type Role = 'user' | 'admin'

export interface AppUser {
  id: string
  name: string
  email: string
  phone?: string
  facebookUrl?: string
  role: Role
  createdAt: number
}

export type ListingType = 'barter' | 'auction' | 'sale'

export type ListingStatus =
  | 'pending'
  | 'active'
  | 'sold'
  | 'exchanged'
  | 'rejected'

export type Condition = 'new' | 'like_new' | 'good' | 'fair' | 'used'

export interface Listing {
  id: string
  userId: string
  ownerName?: string
  type: ListingType
  title: string
  description: string
  category: string
  location: string
  condition: Condition
  imageUrls: string[]
  status: ListingStatus
  /** Barter only — what the owner wants in exchange. */
  wantedExchange?: string
  /** Sale only — fixed price in MNT. */
  fixedPrice?: number
  createdAt: number
  updatedAt: number
}

export type OfferStatus = 'pending' | 'accepted' | 'rejected'

export interface BarterOffer {
  id: string
  listingId: string
  listingTitle?: string
  fromUserId: string
  fromUserName?: string
  message: string
  offeredItem: string
  status: OfferStatus
  createdAt: number
}

export type AuctionStatus = 'active' | 'ended' | 'cancelled'

export interface Auction {
  id: string
  listingId: string
  title?: string
  image?: string
  category?: string
  location?: string
  startingPrice: number
  maxPrice?: number | null
  hasUnlimitedMaxPrice: boolean
  currentPrice: number
  /** Duration token, e.g. '12h' | '1d' | '7d' | '14d' | '1m'. */
  duration: string
  endTime: number
  status: AuctionStatus
  highestBidderId?: string | null
  highestBidderName?: string | null
  createdAt: number
}

export interface Bid {
  id: string
  auctionId: string
  userId: string
  userName?: string
  amount: number
  createdAt: number
}

export interface Category {
  id: string
  name: string
  nameMn?: string
  icon: string
  createdAt: number
}

export interface ListingFilters {
  category?: string
  location?: string
  condition?: Condition | ''
  search?: string
}
