import { PaginatedMeta } from "./PaginatedMeta";

export interface PaginatedResult<T = string> extends PaginatedMeta {
  entries: Array<{ id: string; data: T }>;
}
