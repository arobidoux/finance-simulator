export interface ModelCacheInterface<T> {
  get: { (id: string, callback: { (entry: T): void }): void };
}
