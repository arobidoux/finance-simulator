import { createContext } from "react";
import { CreatedModel } from "./createModel";

export interface StoreInterface {
  add: { (data: string): Promise<{ id: string }> };
  get: { (id: string): Promise<string | null> };
  set: { (id: string, data: string): Promise<boolean> };
  list: { (): Promise<PaginatedResult> };
  delete: { (id: string): Promise<boolean> };
  deleteAll: { (): Promise<boolean> };
}

export type PaginatedResult = Array<{ id: string; data: string }> & {
  next: { (): Promise<PaginatedResult> };
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

interface SpecializedStoreInterface extends StoreInterface {
  specialize: {
    <T, P>(
      model: ModelFilter | CreatedModel<T, P>,
      store: StoreInterface
    ): SpecializedStoreInterface;
  };
  forModel: { <T, P>(model: CreatedModel<T, P>): StoreInterface };
}

export class SpecializedStore implements SpecializedStoreInterface {
  private _store: StoreInterface;
  private _parent?: SpecializedStore;
  private _model: ModelFilter;
  constructor(
    store: StoreInterface,
    model: ModelFilter,
    parent?: SpecializedStore
  ) {
    this._store = store;
    this._model = model;
    this._parent = parent;
  }
  // forward all of these
  add(data: string): Promise<{ id: string }> {
    return this._store.add(data);
  }
  get(id: string): Promise<string | null> {
    return this._store.get(id);
  }
  set(id: string, data: string): Promise<boolean> {
    return this._store.set(id, data);
  }
  list(): Promise<PaginatedResult> {
    return this._store.list();
  }
  delete(id: string): Promise<boolean> {
    return this._store.delete(id);
  }
  deleteAll(): Promise<boolean> {
    return this._store.deleteAll();
  }

  specialize<T, P>(
    model: ModelFilter | CreatedModel<T, P>,
    store: StoreInterface
  ): SpecializedStoreInterface {
    return new SpecializedStore(
      store,
      typeof model === "function" ? model : (t: any) => t === model,
      this
    );
  }

  forModel<T, P>(model: CreatedModel<T, P>): StoreInterface {
    if (this._model(model)) return this;
    else if (this._parent) return this._parent.forModel(model);
    else throw new Error("No store available for the requested model");
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
export const StoreContext = createContext<SpecializedStoreInterface>(
  // default store will accept all model
  new SpecializedStore(new InMemoryStore({ warnOnUse: true }), (m) => true)
);
