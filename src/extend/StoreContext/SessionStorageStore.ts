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
    const rawData = this._store.getItem(this._storageKey);
    if (rawData) this.data = JSON.parse(rawData);

    const rawIndexes = this._store.getItem(this._storageKey + "-indexes");
    if (rawIndexes) this.indexes = JSON.parse(rawIndexes);
  }
  protected async afterChange(): Promise<void> {
    this._store.setItem(this._storageKey, JSON.stringify(this.data));
    this._store.setItem(
      this._storageKey + "-indexes",
      JSON.stringify(this.indexes)
    );
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

  async deleteAll(indexes?: Record<string, string>): Promise<boolean> {
    const r = await super.deleteAll(indexes);
    this.saveMeta();
    return r;
  }
}
