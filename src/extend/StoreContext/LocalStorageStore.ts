import { SessionStorageStore } from "./SessionStorageStore";
import { SessionStorageStoreOptions } from "./SessionStorageStoreOptions";

/**
 * Will keep the whole store value as a serialized json blob in a single
 * LocalStorage entry
 */

export class LocalStorageStore extends SessionStorageStore {
  constructor(opts: SessionStorageStoreOptions) {
    super(opts);
    this._store = window.localStorage;
  }

  onReloadNeeded(handle: { (): void }): { (): void } {
    const listener = (event: StorageEvent) => {
      if (event.key == null || event.key === this._storageKey) {
        handle();
      }
    };
    window.addEventListener("storage", listener);

    return () => {
      window.removeEventListener("storage", listener);
    };
  }
}
