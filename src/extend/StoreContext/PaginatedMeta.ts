export type PaginatedMeta = {
  totalEntryCount?: number;
  pageCount?: number;
  currentPageNumber?: number;
  hasMore: boolean;
  pageSize: number;
  entryCount: number;
  nextPageToken: string | null;
};

// TODO maybe one day, look to be able to simulate both known entry counts (get
// based on page number), and approximate entry count (get based on a next page
// token)

// export type PaginatedBaseMeta = { pageSize: number; entryCount: number; };

// export type PaginationExactPages = {
//   totalEntryCount?: number;
//   pageCount?: number;
//   currentPageNumber?: number;
// };

// export type PaginationNextPageToken = {
//   nextPageToken: string | null;
//   hasMore: boolean;
// };

// export type PaginatedMeta = PaginatedBaseMeta &
//   (PaginationExactPages | PaginationNextPageToken);
