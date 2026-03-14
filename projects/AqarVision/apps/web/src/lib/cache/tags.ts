export const cacheTags = {
  agencyListings: (agencyId: string) => `agency-listings-${agencyId}` as const,
  listingDetail: (listingId: string) => `listing-detail-${listingId}` as const,
  searchResults: (queryHash: string) => `search-results-${queryHash}` as const,
  agencyProfile: (agencyId: string) => `agency-profile-${agencyId}` as const,
} as const;

export type CacheTag = ReturnType<
  (typeof cacheTags)[keyof typeof cacheTags]
>;
