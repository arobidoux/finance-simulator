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
  onReloadNeeded(handle: () => void): () => void {
    return this.store.onReloadNeeded(handle);
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
    paginatedResult: PaginatedResult<string>
  ): PaginatedResult<T> {
    const { entries, /*next, prev, page,*/ ...rest } = paginatedResult;
    const result: PaginatedResult<T> = {
      ...rest,
      entries: entries.map((e) => {
        return { id: e.id, data: this.inflateData(e.data) };
      }),
    };
    // if (next) result.next = () => next().then((p) => this.formatListResult(p));
    // if (prev) result.prev = () => prev().then((p) => this.formatListResult(p));
    // if (page)
    //   result.page = (n: number) =>
    //     page(n).then((p) => this.formatListResult(p));
    return result;
  }
  list(paginateToken?: string): Promise<PaginatedResult<T>> {
    return this.store.list(paginateToken).then((p) => this.formatListResult(p));
  }

  delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
  deleteAll(): Promise<boolean> {
    return this.store.deleteAll();
  }
}
