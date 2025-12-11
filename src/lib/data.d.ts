export type MarketplaceListing = {
    id: number;
    title: string;
    price: number;
    location: string;
    image: string;
    views: number;
    likes: number;
    seller: string;
    category: string;
    isNew?: boolean;
    postedAt?: string;
    description?: string;
    status?: 'active' | 'pending';
    tags?: string[];
    reviews?: Review[];
    averageRating?: number;
};
export type CommunityEvent = {
    id: number;
    title: string;
    date: string;
    time: string;
    location: string;
    attendees: number;
    image: string;
    category: string;
    isFeatured?: boolean;
    description?: string;
    rsvpOpen?: boolean;
};
export type BusinessProfile = {
    id: number;
    name: string;
    category: string;
    description: string;
    location: string;
    phone: string;
    email?: string;
    website?: string | null;
    rating: number;
    reviews: number;
    image: string;
    verified: boolean;
    hours?: string;
    tags?: string[];
    testimonials?: Review[];
};
export type ForumReply = {
    id: number;
    author: string;
    message: string;
    createdAt: string;
};
export type Review = {
    id: number;
    author: string;
    rating: number;
    comment: string;
    createdAt: string;
    verified: boolean;
};
export type ForumThread = {
    id: number;
    title: string;
    community: string;
    author: string;
    replies: number;
    likes: number;
    createdAt: string;
    excerpt: string;
    status: 'open' | 'resolved';
    tags?: string[];
    body?: string;
    views?: number;
    responses?: ForumReply[];
};
export type MessageThread = {
    id: number;
    username: string;
    message: string;
    type: string;
    time: string;
    date: string;
    isOnline: boolean;
};
export declare const homeHighlights: {
    stats: {
        label: string;
        value: string;
        color: string;
    }[];
    testimonials: {
        quote: string;
        name: string;
        role: string;
    }[];
    pillars: {
        icon: string;
        title: string;
        description: string;
        color: string;
        href: string;
    }[];
    features: {
        title: string;
        description: string;
        icon: string;
        color: string;
        href: string;
    }[];
};
export declare function getMarketplaceListings(): MarketplaceListing[];
export declare function getMarketplaceListing(id: number): MarketplaceListing | undefined;
export declare function addMarketplaceListing(input: Omit<MarketplaceListing, 'id' | 'views' | 'likes' | 'status'>): MarketplaceListing;
export declare function addMarketplaceReview(listingId: number, review: Omit<Review, 'id' | 'createdAt' | 'verified'>): MarketplaceListing | null;
export declare function likeMarketplaceListing(id: number): MarketplaceListing | null;
export declare function getEvents(): CommunityEvent[];
export declare function addEvent(input: Omit<CommunityEvent, 'id' | 'attendees' | 'rsvpOpen'>): CommunityEvent;
export declare function rsvpToEvent(id: number, change?: number): CommunityEvent | null;
export declare function getBusinesses(): BusinessProfile[];
export declare function addBusiness(input: Omit<BusinessProfile, 'id' | 'verified' | 'rating' | 'reviews'>): BusinessProfile;
export declare function addBusinessReview(businessId: number, review: Omit<Review, 'id' | 'createdAt' | 'verified'>): BusinessProfile | null;
export declare function getForumThreads(): ForumThread[];
export declare function addForumThread(input: Pick<ForumThread, 'title' | 'community' | 'author' | 'excerpt'>): ForumThread;
export declare function getConversations(): MessageThread[];
export declare function addConversation(input: Pick<MessageThread, 'username' | 'message' | 'type'>): MessageThread;
//# sourceMappingURL=data.d.ts.map