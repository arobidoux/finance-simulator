import { PaginatedResult } from "./PaginatedResult";

export interface StoreInterface<T = string> {
  add: { (data: T): Promise<{ id: string }> };
  get: { (id: string): Promise<T | null> };
  set: { (id: string, data: T): Promise<boolean> };
  list: { (paginateToken?: string): Promise<PaginatedResult<T>> };
  delete: { (id: string): Promise<boolean> };
  deleteAll: { (): Promise<boolean> };

  onReloadNeeded(handle: { (): void }): { (): void };
}
