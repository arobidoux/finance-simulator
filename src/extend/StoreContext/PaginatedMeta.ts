export type PaginatedMeta = {
  totalEntryCount?: number;
  pageCount?: number;
  currentPageNumber?: number;
  hasMore: boolean;
  pageSize: number;
  entryCount: number;
  nextPageToken: string | null;
};
