import { InMemoryStore } from "./InMemoryStore";
import { SessionStorageStoreOptions } from "./SessionStorageStoreOptions";

export class SessionStorageStore extends InMemoryStore {
  protected _storageKey: string;
  protected _store: Storage;
  constructor(opts: SessionStorageStoreOptions) {
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
