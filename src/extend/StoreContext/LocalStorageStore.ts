import { SessionStorageStore } from "./SessionStorageStore";
import { SessionStorageStoreOptions } from "./SessionStorageStoreOptions";

/**
 * Will keep the whole store value as a serialized json blob in a single
 * LocalStorage entry
 */

export class LocalStorageStore extends SessionStorageStore {
  constructor(
    opts: { onReloadNeeded?: { (): void } } & SessionStorageStoreOptions
  ) {
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
