import { PaginatedResult } from "./PaginatedResult";

export interface StoreInterface<T = string> {
  add: { (data: T, indexes?: Record<string, string>): Promise<{ id: string }> };
  get: { (id: string): Promise<T | null> };
  set: {
    (id: string, data: T, indexes?: Record<string, string>): Promise<boolean>;
  };
  list: {
    (paginateToken?: string, index?: [key: string, value: string]): Promise<
      PaginatedResult<T>
    >;
  };
  delete: { (id: string): Promise<boolean> };
  deleteAll: { (indexes?: Record<string, string>): Promise<boolean> };

  onReloadNeeded(handle: { (): void }): { (): void };
}
