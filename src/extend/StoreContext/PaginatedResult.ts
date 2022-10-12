export type PaginatedResult<T = string> = {
  entries: Array<{ id: string; data: T }>;
  totalEntryCount?: number;
  pageCount?: number;
  currentPageNumber?: number;
  hasMore: boolean;
  nextPageToken: string | null;
  next?: { (): Promise<PaginatedResult<T>> };
  prev?: { (): Promise<PaginatedResult<T>> };
  page?: { (pageNumber: number): Promise<PaginatedResult<T>> };
};
