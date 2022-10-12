import { CreatedModel } from "../Model/CreatedModel";
import { PaginatedResult } from "./PaginatedResult";
import { StoreInterface } from "./StoreInterface";

export class FormatedStoreInterface<T, P> implements StoreInterface<T> {
  private model: CreatedModel<T, P>;
  store: StoreInterface<string>;
  constructor(model: CreatedModel<T, P>, store: StoreInterface<string>) {
    this.model = model;
    this.store = store;
  }
  protected inflateData(data: string): T {
    return this.model.$.fromStore(data);
  }
  // forward all of these
  add(data: T): Promise<{ id: string }> {
    return this.store.add(this.model.$.toStore(data));
  }
  async get(id: string): Promise<T | null> {
    const data = await this.store.get(id);
    if (data) return this.inflateData(data);
    return null;
  }
  set(id: string, data: T): Promise<boolean> {
    return this.store.set(id, this.model.$.toStore(data));
  }
  protected formatListResult(
    page: PaginatedResult<string>
  ): PaginatedResult<T> {
    return {
      ...page,
      entries: page.entries.map((e) => {
        return { id: e.id, data: this.inflateData(e.data) };
      }),
      next: () => page.next().then((p) => this.formatListResult(p)),
      prev: () => page.prev().then((p) => this.formatListResult(p)),
      page: (p: number) => page.page(p).then((p) => this.formatListResult(p)),
    };
  }
  list(): Promise<PaginatedResult<T>> {
    return this.store.list().then((p) => this.formatListResult(p));
  }

  delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
  deleteAll(): Promise<boolean> {
    return this.store.deleteAll();
  }
}
