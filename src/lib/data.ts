export type MarketplaceListing = {
  id: number
  title: string
  price: number
  location: string
  image: string
  views: number
  likes: number
  seller: string
  category: string
  isNew?: boolean
  postedAt?: string
  description?: string
  status?: 'active' | 'pending'
  tags?: string[]
  reviews?: Review[]
  averageRating?: number
}

export type CommunityEvent = {
  id: number
  title: string
  date: string
  time: string
  location: string
  attendees: number
  image: string
  category: string
  isFeatured?: boolean
  description?: string
  rsvpOpen?: boolean
}

export type BusinessProfile = {
  id: number
  name: string
  category: string
  description: string
  location: string
  phone: string
  email?: string
  website?: string | null
  rating: number
  reviews: number
  image: string
  verified: boolean
  hours?: string
  tags?: string[]
  testimonials?: Review[]
}

export type ForumReply = {
  id: number
  author: string
  message: string
  createdAt: string
}

export type Review = {
  id: number
  author: string
  rating: number
  comment: string
  createdAt: string
  verified: boolean
}

export type ForumThread = {
  id: number
  title: string
  community: string
  author: string
  replies: number
  likes: number
  createdAt: string
  excerpt: string
  status: 'open' | 'resolved'
  tags?: string[]
  body?: string
  views?: number
  responses?: ForumReply[]
}

export type MessageThread = {
  id: number
  username: string
  message: string
  type: string
  time: string
  date: string
  isOnline: boolean
}

const marketplaceListings: MarketplaceListing[] = [
  {
    id: 1,
    title: 'MacBook Pro 2021',
    price: 1200,
    location: 'Downtown Ottawa',
    image: '/silver-macbook-on-desk.png',
    views: 45,
    likes: 12,
    seller: 'Daniel H.',
    category: 'Electronics',
    isNew: true,
    postedAt: '2 days ago',
    description:
      'Excellent condition MacBook Pro 2021 with M1 Pro chip. 16GB RAM, 512GB SSD. Battery health at 92%. Includes original charger and box.',
    status: 'active',
    tags: ['M1 Pro', '16GB RAM', '512GB SSD'],
    reviews: [
      { id: 1, author: 'Sara M.', rating: 5, comment: 'Laptop exactly as described. Smooth handoff.', createdAt: '1d ago', verified: true },
      { id: 2, author: 'Yonatan K.', rating: 4, comment: 'Great price, minor scratch disclosed upfront.', createdAt: '3d ago', verified: true },
    ],
    averageRating: 4.5,
  },
  {
    id: 2,
    title: 'Vintage Coffee Table',
    price: 150,
    location: 'Kanata',
    image: '/wooden-coffee-table.png',
    views: 28,
    likes: 8,
    seller: 'Hanna G.',
    category: 'Furniture',
    isNew: false,
    postedAt: '5 days ago',
    description: 'Mid-century style table with minor wear. Solid wood, freshly oiled, fits small apartments.',
    status: 'active',
    tags: ['furniture', 'living room'],
  },
  {
    id: 3,
    title: 'Ethiopian Spice Set',
    price: 25,
    location: 'Barrhaven',
    image: '/colorful-spice-jars.jpg',
    views: 67,
    likes: 23,
    seller: 'Eyerusalem A.',
    category: 'Food & Groceries',
    isNew: true,
    postedAt: '1 day ago',
    description: 'Berbere, Mitmita, and Korerima blend. Freshly packed and sealed for gifting.',
    status: 'active',
  },
  {
    id: 4,
    title: 'Photography Services',
    price: 100,
    location: 'Ottawa Wide',
    image: '/camera-photography.png',
    views: 34,
    likes: 15,
    seller: 'Yonas T.',
    category: 'Services',
    isNew: false,
    postedAt: '1 week ago',
    description: 'Portrait, event, and product photography. Edited photos delivered within 48 hours.',
    status: 'active',
    tags: ['services', 'events'],
  },
  {
    id: 5,
    title: 'Chemistry Textbook',
    price: 80,
    location: 'Downtown Ottawa',
    image: '/chemistry-textbook.png',
    views: 12,
    likes: 3,
    seller: 'Sara M.',
    category: 'Education',
    isNew: false,
    postedAt: '3 days ago',
    description: 'Clean copy with no highlights. Useful for first-year university courses.',
    status: 'active',
  },
  {
    id: 6,
    title: 'Traditional Dress (Habesha Kemis)',
    price: 200,
    location: 'Nepean',
    image: '/traditional-ethiopian-dress-white-embroidery.jpg',
    views: 89,
    likes: 34,
    seller: 'Miriam K.',
    category: 'Clothing',
    isNew: true,
    postedAt: '4 days ago',
    description: 'Handmade Habesha Kemis with gold embroidery. Custom length available.',
    status: 'active',
    tags: ['fashion', 'wedding'],
    reviews: [
      { id: 3, author: 'Liya M.', rating: 5, comment: 'Beautiful stitching and quick pickup.', createdAt: '2d ago', verified: true },
    ],
    averageRating: 5,
  },
]

const communityEvents: CommunityEvent[] = [
  {
    id: 1,
    title: 'Ethiopian New Year Celebration',
    date: 'Sep 11, 2025',
    time: '6:00 PM',
    location: 'Ottawa Community Centre',
    attendees: 234,
    image: '/ethiopian-celebration-colorful-festival.jpg',
    category: 'Cultural',
    isFeatured: true,
    description: 'Live music, cultural performances, kids corner, and a coffee ceremony.',
    rsvpOpen: true,
  },
  {
    id: 2,
    title: 'Habesha Business Networking',
    date: 'Dec 15, 2025',
    time: '7:00 PM',
    location: 'Downtown Ottawa',
    attendees: 45,
    image: '/business-networking-meeting.png',
    category: 'Networking',
    isFeatured: false,
    description: 'Pitch your business, find collaborators, and connect with mentors.',
    rsvpOpen: true,
  },
  {
    id: 3,
    title: 'Traditional Coffee Ceremony Workshop',
    date: 'Dec 20, 2025',
    time: '2:00 PM',
    location: 'Kanata Ethiopian Restaurant',
    attendees: 18,
    image: '/ethiopian-coffee-ceremony-traditional.jpg',
    category: 'Workshop',
    isFeatured: true,
    description: 'Hands-on roasting, brewing, and cultural storytelling.',
    rsvpOpen: true,
  },
  {
    id: 4,
    title: 'Youth Soccer Tournament',
    date: 'Dec 28, 2025',
    time: '10:00 AM',
    location: 'Minto Recreation Complex',
    attendees: 120,
    image: '/youth-soccer-tournament-field.jpg',
    category: 'Sports',
    isFeatured: false,
    description: 'Community teams compete with volunteer coaches and referees.',
    rsvpOpen: true,
  },
  {
    id: 5,
    title: 'Timkat Festival Gathering',
    date: 'Jan 19, 2026',
    time: '9:00 AM',
    location: 'Ethiopian Orthodox Church',
    attendees: 300,
    image: '/timkat-ethiopian-orthodox-festival-white-robes.jpg',
    category: 'Religious',
    isFeatured: true,
    description: 'Procession, spiritual songs, and a family-friendly picnic after service.',
    rsvpOpen: true,
  },
  {
    id: 6,
    title: 'Community Potluck Dinner',
    date: 'Jan 5, 2026',
    time: '5:00 PM',
    location: 'Barrhaven Community Hall',
    attendees: 67,
    image: '/community-dinner-potluck-gathering.jpg',
    category: 'Social',
    isFeatured: false,
    description: 'Bring a dish to share—label allergens. Games and music included.',
    rsvpOpen: true,
  },
]

const businessDirectory: BusinessProfile[] = [
  {
    id: 1,
    name: 'Habesha Restaurant',
    category: 'Restaurants',
    description: 'Authentic Ethiopian cuisine with traditional coffee ceremony. Family-owned since 2015.',
    location: '123 Bank Street, Ottawa',
    phone: '(613) 555-0123',
    email: 'hello@habeshaottawa.ca',
    website: 'habeshaottawa.ca',
    rating: 4.8,
    reviews: 156,
    image: '/ethiopian-restaurant-interior-injera.jpg',
    verified: true,
    hours: 'Open today · 11:00 AM - 10:00 PM',
  },
  {
    id: 2,
    name: 'Abyssinia Grocery',
    category: 'Retail',
    description: 'Your one-stop shop for Ethiopian spices, injera, and imported goods.',
    location: '456 Somerset St, Ottawa',
    phone: '(613) 555-0456',
    website: 'abyssiniagrocery.com',
    rating: 4.6,
    reviews: 89,
    image: '/ethiopian-grocery-store-spices.jpg',
    verified: true,
    hours: 'Open today · 9:00 AM - 8:00 PM',
    tags: ['groceries', 'spices'],
    testimonials: [
      { id: 10, author: 'Selam T.', rating: 5, comment: 'Fresh injera every morning. Staff is kind.', createdAt: '2d ago', verified: true },
    ],
  },
  {
    id: 3,
    name: 'Selam Tax Services',
    category: 'Professional',
    description: 'Professional tax preparation and accounting services for individuals and businesses.',
    location: '789 Albert St, Ottawa',
    phone: '(613) 555-0789',
    website: 'selamtax.ca',
    rating: 4.9,
    reviews: 67,
    image: '/professional-office-accounting.jpg',
    verified: true,
    hours: 'Opens tomorrow at 10:00 AM',
  },
  {
    id: 4,
    name: 'Tigist Hair Braiding',
    category: 'Services',
    description: 'Expert hair braiding, styling, and natural hair care. Walk-ins welcome.',
    location: '321 Rideau St, Ottawa',
    phone: '(613) 555-0321',
    website: null,
    rating: 4.7,
    reviews: 203,
    image: '/hair-braiding-salon-african.jpg',
    verified: false,
    hours: 'Open today · 10:00 AM - 7:00 PM',
    tags: ['beauty'],
  },
  {
    id: 5,
    name: 'Dr. Kebede Family Clinic',
    category: 'Health',
    description: 'Family medicine with Amharic and Tigrinya speaking staff. Accepting new patients.',
    location: '555 Carling Ave, Ottawa',
    phone: '(613) 555-0555',
    website: 'kebedeclinic.ca',
    rating: 4.9,
    reviews: 112,
    image: '/medical-clinic-doctor-office.jpg',
    verified: true,
    hours: 'Open today · 8:00 AM - 6:00 PM',
    tags: ['health', 'family'],
    testimonials: [
      { id: 11, author: 'Daniel H.', rating: 5, comment: 'Respectful care, Amharic speaking nurse on-site.', createdAt: '5d ago', verified: true },
    ],
  },
  {
    id: 6,
    name: 'Geez Language School',
    category: 'Education',
    description: 'Learn Amharic and Tigrinya. Classes for children and adults, online and in-person.',
    location: '888 Bronson Ave, Ottawa',
    phone: '(613) 555-0888',
    website: 'geezschool.ca',
    rating: 4.8,
    reviews: 45,
    image: '/language-school-classroom-learning.jpg',
    verified: true,
    hours: 'Evening classes available',
    tags: ['education', 'language'],
  },
]

const forumThreads: ForumThread[] = [
  {
    id: 1,
    title: 'Best places to buy fresh injera in Ottawa?',
    community: 'Marketplace & Business',
    author: 'Liya M.',
    replies: 12,
    likes: 34,
    createdAt: '1h ago',
    excerpt: 'Looking for reliable weekly suppliers. Bonus if they deliver in Kanata!',
    status: 'open',
    tags: ['food', 'shopping'],
  },
  {
    id: 2,
    title: 'Preparing for Timkat with kids—tips?',
    community: 'Culture & Celebrations',
    author: 'Daniel H.',
    replies: 4,
    likes: 18,
    createdAt: '3h ago',
    excerpt: 'How do you keep little ones engaged during service? Snacks and books suggestions welcome.',
    status: 'open',
  },
  {
    id: 3,
    title: 'Local tech mentors for co-op interviews',
    community: 'Tech & Careers',
    author: 'Sara M.',
    replies: 9,
    likes: 21,
    createdAt: '5h ago',
    excerpt: 'Need mock interviews before January placements—who has time this month?',
    status: 'resolved',
    tags: ['careers', 'mentorship'],
  },
  {
    id: 4,
    title: 'Sunday pickup soccer at Brewer Park',
    community: 'Events & Meetups',
    author: 'Yonatan K.',
    replies: 6,
    likes: 14,
    createdAt: '8h ago',
    excerpt: 'Open to all skill levels. Thinking 4pm this weekend—any goalies available?',
    status: 'open',
    tags: ['sports'],
  },
]

const conversations: MessageThread[] = [
  {
    id: 1,
    username: 'tennysonkalio',
    message: 'for you mami, i give 12.5',
    type: 'Listing inquiry',
    time: '18m ago',
    date: '12/9/2025',
    isOnline: true,
  },
  {
    id: 2,
    username: 'na me oh',
    message: 'Checking if the dress is still available for pickup?',
    type: 'Listing inquiry',
    time: '20m ago',
    date: '12/9/2025',
    isOnline: true,
  },
]

export const homeHighlights = {
  stats: [
    { label: 'Newcomers welcomed', value: '1,200+', color: 'bg-emerald-500' },
    { label: 'Connections made', value: '15k+', color: 'bg-amber-500' },
    { label: 'Events hosted', value: '320+', color: 'bg-rose-500' },
  ],
  testimonials: [
    {
      quote:
        'I sold household essentials within a day and met a fellow entrepreneur who became a mentor. Pomi feels like home.',
      name: 'Eyerusalem A.',
      role: 'Marketplace Seller & Mentor',
    },
    {
      quote:
        'Our community events used to scatter on WhatsApp. Now everything lives in one place, with RSVPs we can actually track.',
      name: 'Daniel H.',
      role: 'Event Organizer',
    },
    {
      quote:
        'As a newcomer, finding local services was tough. The business directory made it effortless to support Habesha-owned shops.',
      name: 'Hanna G.',
      role: 'Newcomer & Student',
    },
  ],
  pillars: [
    {
      icon: 'Palette',
      title: 'Culture-first design',
      description:
        'Rooted in Habesha artistry with layered colour, language support, and typography that feels like home.',
      color: 'text-rose-400',
      href: '/forums',
    },
    {
      icon: 'ShieldCheck',
      title: 'Trusted marketplace',
      description:
        'Moderated listings, verified sellers, and admin approvals keep buying, selling, and swapping safe for everyone.',
      color: 'text-sky-400',
      href: '/marketplace',
    },
    {
      icon: 'Building2',
      title: 'Business visibility',
      description:
        'Spotlight Habesha-owned businesses with profiles, contact details, and admin-approved spotlights in seconds.',
      color: 'text-amber-400',
      href: '/directory',
    },
    {
      icon: 'MessageCircle',
      title: 'Forums & knowledge threads',
      description:
        'Threaded discussions with upvotes, saved posts, and moderation capture community wisdom for the long term.',
      color: 'text-violet-400',
      href: '/forums',
    },
  ],
  features: [
    {
      title: 'Marketplace',
      description: 'Discover trusted listings from neighbours—jobs, housing, services, and essentials.',
      icon: 'ShoppingBag',
      color: 'bg-amber-500',
      href: '/marketplace',
    },
    {
      title: 'Events',
      description: 'Find cultural celebrations, community gatherings, and networking meetups near you.',
      icon: 'Calendar',
      color: 'bg-emerald-500',
      href: '/events',
    },
    {
      title: 'Forums',
      description: 'Ask questions, share tips, and connect with neighbours who understand your journey.',
      icon: 'MessageCircle',
      color: 'bg-violet-500',
      href: '/forums',
    },
    {
      title: 'Directory',
      description: 'Support Habesha-owned businesses with verified profiles and community reviews.',
      icon: 'Building2',
      color: 'bg-rose-500',
      href: '/directory',
    },
  ],
}

export function getMarketplaceListings() {
  return marketplaceListings
}

export function getMarketplaceListing(id: number) {
  return marketplaceListings.find((listing) => listing.id === id)
}

function recomputeListingRating(listing: MarketplaceListing) {
  if (!listing.reviews?.length) {
    listing.averageRating = undefined
    return listing
  }
  const sum = listing.reviews.reduce((acc, r) => acc + r.rating, 0)
  listing.averageRating = Math.round((sum / listing.reviews.length) * 10) / 10
  return listing
}

export function addMarketplaceListing(input: Omit<MarketplaceListing, 'id' | 'views' | 'likes' | 'status'>) {
  const newListing: MarketplaceListing = {
    ...input,
    id: Date.now(),
    views: 0,
    likes: 0,
    status: 'pending',
  }
  marketplaceListings.unshift(newListing)
  return newListing
}

export function addMarketplaceReview(listingId: number, review: Omit<Review, 'id' | 'createdAt' | 'verified'>) {
  const listing = marketplaceListings.find((item) => item.id === listingId)
  if (!listing) return null
  const newReview: Review = {
    ...review,
    id: Date.now(),
    createdAt: 'just now',
    verified: true,
  }
  listing.reviews = [newReview, ...(listing.reviews || [])]
  recomputeListingRating(listing)
  return listing
}

export function likeMarketplaceListing(id: number) {
  const listing = marketplaceListings.find((item) => item.id === id)
  if (!listing) return null
  listing.likes += 1
  return listing
}

export function getEvents() {
  return communityEvents
}

export function addEvent(input: Omit<CommunityEvent, 'id' | 'attendees' | 'rsvpOpen'>) {
  const newEvent: CommunityEvent = {
    ...input,
    id: Date.now(),
    attendees: 0,
    rsvpOpen: true,
  }
  communityEvents.unshift(newEvent)
  return newEvent
}

export function rsvpToEvent(id: number, change: number = 1) {
  const event = communityEvents.find((item) => item.id === id)
  if (!event) return null
  event.attendees = Math.max(0, event.attendees + change)
  return event
}

export function getBusinesses() {
  return businessDirectory
}

export function addBusiness(input: Omit<BusinessProfile, 'id' | 'verified' | 'rating' | 'reviews'>) {
  const newBusiness: BusinessProfile = {
    ...input,
    id: Date.now(),
    verified: false,
    rating: 0,
    reviews: 0,
    testimonials: [],
  }
  businessDirectory.unshift(newBusiness)
  return newBusiness
}

export function addBusinessReview(businessId: number, review: Omit<Review, 'id' | 'createdAt' | 'verified'>) {
  const business = businessDirectory.find((b) => b.id === businessId)
  if (!business) return null
  const newReview: Review = {
    ...review,
    id: Date.now(),
    createdAt: 'just now',
    verified: true,
  }
  business.testimonials = [newReview, ...(business.testimonials || [])]
  const totalCount = business.testimonials.length
  const sum = business.testimonials.reduce((acc, r) => acc + r.rating, 0)
  business.rating = Math.round((sum / totalCount) * 10) / 10
  business.reviews = totalCount
  return business
}

export function getForumThreads() {
  return forumThreads
}

export function addForumThread(input: Pick<ForumThread, 'title' | 'community' | 'author' | 'excerpt'>) {
  const newThread: ForumThread = {
    ...input,
    id: Date.now(),
    replies: 0,
    likes: 0,
    createdAt: 'just now',
    status: 'open',
  }
  forumThreads.unshift(newThread)
  return newThread
}

export function getConversations() {
  return conversations
}

export function addConversation(input: Pick<MessageThread, 'username' | 'message' | 'type'>) {
  const newConversation: MessageThread = {
    ...input,
    id: Date.now(),
    time: 'just now',
    date: new Date().toLocaleDateString(),
    isOnline: true,
  }
  conversations.unshift(newConversation)
  return newConversation
}
