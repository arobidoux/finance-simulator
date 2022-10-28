import { CreatedModel } from "../Model/CreatedModel";
import { OnChangeHandle } from "./BaseStoreContext";
import { PaginatedResult } from "./PaginatedResult";
import { StoreInterface } from "./StoreInterface";

export class FormatedStoreInterface<T, P> implements StoreInterface<T> {
  private model: CreatedModel<T, P>;
  store: StoreInterface<string>;
  onAnyChanges: OnChangeHandle;
  constructor(
    model: CreatedModel<T, P>,
    store: StoreInterface<string>,
    onAnyChanges: OnChangeHandle
  ) {
    this.model = model;
    this.store = store;
    this.onAnyChanges = onAnyChanges;
  }
  protected inflateData(data: string): T {
    return this.model.$.fromStore(data);
  }
  onReloadNeeded(handle: () => void): () => void {
    return this.store.onReloadNeeded(handle);
  }
  // forward all of these
  add(data: T, indexes?: Record<string, string>): Promise<{ id: string }> {
    // TODO look to get the indexes information from the data instead?
    const r = this.store.add(this.model.$.toStore(data), indexes);
    r.then(({ id }) => this.onAnyChanges("create", id));
    return r;
  }
  async get(id: string): Promise<T | null> {
    const data = await this.store.get(id);
    if (data) return this.inflateData(data);
    return null;
  }
  set(
    id: string,
    data: T,
    indexes?: Record<string, string>
  ): Promise<"created" | "updated"> {
    // TODO look to get the indexes information from the data instead?
    const r = this.store.set(id, this.model.$.toStore(data), indexes);
    r.then((action) =>
      this.onAnyChanges(action === "created" ? "create" : "update", id)
    );
    return r;
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
  list(
    paginateToken?: string,
    index?: [key: string, value: string]
  ): Promise<PaginatedResult<T>> {
    return this.store
      .list(paginateToken, index)
      .then((p) => this.formatListResult(p));
  }
  delete(id: string): Promise<boolean> {
    const r = this.store.delete(id);
    r.then((success) => success && this.onAnyChanges("delete", id));
    return r;
  }
  deleteAll(indexes?: Record<string, string>): Promise<boolean> {
    const r = this.store.deleteAll(indexes);
    r.then((success) => success && this.onAnyChanges("delete", ""));
    return r;
  }
}
