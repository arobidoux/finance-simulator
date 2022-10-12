import { createContext } from "react";
import { CreatedModel } from "./createModel";

export interface StoreInterface<T = string> {
  add: { (data: T): Promise<{ id: string }> };
  get: { (id: string): Promise<T | null> };
  set: { (id: string, data: T): Promise<boolean> };
  list: { (): Promise<PaginatedResult<T>> };
  delete: { (id: string): Promise<boolean> };
  deleteAll: { (): Promise<boolean> };
}

export type PaginatedResult<T = string> = Array<{ id: string; data: T }> & {
  next: { (): Promise<PaginatedResult<T>> };
};

export interface InMemoryStoreOptions {
  id?: {
    // used for id generation
    prefix?: string;
    // used for id generation
    incrementPadding?: number;
  };
  list?: {
    pageSize?: number;
  };
  // by default, the InMemoryStore will output a warning when used. This is to
  // ensure default use is not left on by mistake
  warnOnUse?: boolean;
}

type ModelFilter = { <X, Y>(model: CreatedModel<X, Y>): boolean };

interface StoreContextInterface {
  specialize: {
    <T, P>(
      model: ModelFilter | CreatedModel<T, P>,
      store: StoreInterface
    ): StoreContextInterface;
  };
  forModel: { <T, P>(model: CreatedModel<T, P>): StoreInterface<T> };
}

export class BaseStoreContext implements StoreContextInterface {
  private _store: StoreInterface;
  private _parent?: BaseStoreContext;
  private _model: ModelFilter;
  constructor(
    store: StoreInterface,
    model: ModelFilter,
    parent?: BaseStoreContext
  ) {
    this._store = store;
    this._model = model;
    this._parent = parent;
  }
  specialize<T, P>(
    model: ModelFilter | CreatedModel<T, P>,
    store: StoreInterface
  ): BaseStoreContext {
    return new BaseStoreContext(
      store,
      typeof model === "function" ? model : (t: any) => t === model,
      this
    );
  }

  forModel<T, P>(model: CreatedModel<T, P>): StoreInterface<T> {
    if (this._model(model))
      return new FormatedStoreInterface(model, this._store);
    else if (this._parent) return this._parent.forModel(model);
    else throw new Error("No store available for the requested model");
  }
}
class FormatedStoreInterface<T, P> implements StoreInterface<T> {
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
    return Object.assign(
      page.map((e) => {
        return { id: e.id, data: this.inflateData(e.data) };
      }),
      { next: () => page.next().then((p) => this.formatListResult(p)) }
    );
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

export class InMemoryStore implements StoreInterface {
  protected data: Array<{ id: string; data: string }> = [];
  protected nextId: number = 1;
  private _opts?: InMemoryStoreOptions;
  constructor(opts?: InMemoryStoreOptions) {
    this._opts = opts;
  }

  protected generateId(): string {
    const nextIncrement = this.nextId++;
    const desiredIdLength = this._opts?.id?.incrementPadding ?? 0;
    const requiredPadding = desiredIdLength - `${nextIncrement}`.length;
    return (
      (this._opts?.id?.prefix ?? "") +
      (requiredPadding > 0 ? "0".repeat(requiredPadding) : "") +
      nextIncrement
    );
  }

  // used to help extend the class, if desired
  protected async afterChange(id: string, data: string): Promise<void> {}

  protected async beforeRead(id?: string): Promise<void> {}

  async add(data: string): Promise<{ id: string }> {
    const id = this.generateId();
    this.data.push({ id, data });
    this._opts?.warnOnUse &&
      console.warn("Adding data to InMemoryStore", { id, data });
    await this.afterChange(id, data);
    return { id };
  }

  async get(id: string): Promise<string | null> {
    await this.beforeRead(id);
    const doc = this.data.find((d) => d.id === id);
    this._opts?.warnOnUse &&
      console.warn("Getting data from InMemoryStore", { id });
    return doc ? doc.data : null;
  }

  async set(id: string, data: string): Promise<boolean> {
    const idx = this.data.findIndex((d) => d.id === id);
    if (idx !== -1) this.data[idx].data = data;
    else this.data.push({ id, data });
    this._opts?.warnOnUse &&
      console.warn("Setting data to InMemoryStore", { id, data });
    await this.afterChange(id, data);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.beforeRead();
    const idx = this.data.findIndex((d) => d.id === id);
    if (idx !== -1) {
      this._opts?.warnOnUse &&
        console.warn("Deleting data from InMemoryStore", { id });
      this.data.splice(idx, 1);
      await this.afterChange(id, "");
      return true;
    }
    return false;
  }
  async deleteAll(): Promise<boolean> {
    this.data = [];
    await this.afterChange("all", "");
    this.nextId = 1;
    return true;
  }

  async list(): Promise<PaginatedResult> {
    this._opts?.warnOnUse && console.warn("Listing data from InMemoryStore");
    return await this._list(0);
  }
  protected async _list(startFromIdx: number): Promise<PaginatedResult> {
    await this.beforeRead();
    const page = this.data.slice(0, this._opts?.list?.pageSize ?? 100);
    return Object.assign(page, {
      next: async () => await this._list(startFromIdx + page.length),
    });
  }
}

export type SessionStoreOptions = { key: string } & InMemoryStoreOptions;
export class SessionStorageStore extends InMemoryStore {
  protected _storageKey: string;
  protected _store: Storage;
  constructor(opts: { key: string } & InMemoryStoreOptions) {
    super(opts);
    this._storageKey = opts.key;
    this._store = window.localStorage;
  }

  protected async beforeRead(): Promise<void> {
    const raw = this._store.getItem(this._storageKey);
    if (raw) {
      this.data = JSON.parse(raw);
    }
  }
  protected async afterChange(): Promise<void> {
    this._store.setItem(this._storageKey, JSON.stringify(this.data));
  }

  protected loadMeta() {
    const raw = this._store.getItem(this._storageKey + "-meta");
    if (raw) {
      const meta = JSON.parse(raw);
      if (meta.nextId) {
        this.nextId = meta.nextId;
      }
    }
  }

  protected saveMeta() {
    const meta = JSON.stringify({
      nextId: this.nextId,
    });
    this._store.setItem(this._storageKey + "-meta", meta);
  }

  protected withMeta<T>(handle: { (): T }): T {
    this.loadMeta();
    const result = handle();
    this.saveMeta();
    return result;
  }

  protected generateId() {
    return this.withMeta(() => super.generateId());
  }

  async deleteAll(): Promise<boolean> {
    const r = await super.deleteAll();
    this.saveMeta();
    return r;
  }
}

/**
 * Will keep the whole store value as a serialized json blob in a single
 * LocalStorage entry
 */

export class LocalStorageStore extends SessionStorageStore {
  constructor(opts: { onReloadNeeded?: { (): void } } & SessionStoreOptions) {
    super(opts);
    this._store = window.localStorage;
    if (opts.onReloadNeeded) this.syncAcrossTabs(opts.onReloadNeeded);
  }

  syncAcrossTabs(onReloadNeeded: { (): void }) {
    window.addEventListener("storage", (event) => {
      if (event.key == null || event.key === this._storageKey) {
        onReloadNeeded();
      }
    });
  }
}

/**
 * TODO figure out if there's a way to scope the storeContext, to separate with
 * other developers. That way we could also have our data as needed on the
 * platform.
 */
export const StoreContext = createContext<BaseStoreContext>(
  // default store will accept all model
  new BaseStoreContext(new InMemoryStore({ warnOnUse: true }), (m) => true)
);
