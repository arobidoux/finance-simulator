import { InMemoryStoreOptions } from "./InMemoryStoreOptions";
import { PaginatedResult } from "./PaginatedResult";
import { StoreInterface } from "./StoreInterface";

interface InMemoryStorePaginateToken {
  startAt: number;
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

  onReloadNeeded(handle: () => void): () => void {
    // not applicable
    return () => {};
  }

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

  async list(paginateToken?: string): Promise<PaginatedResult> {
    this._opts?.warnOnUse && console.warn("Listing data from InMemoryStore");
    let startFromIdx = 0;
    if (paginateToken) {
      const paginate = JSON.parse(
        paginateToken
      ) as Partial<InMemoryStorePaginateToken>;
      if (typeof paginate.startAt === "number") {
        startFromIdx = paginate.startAt;
      }
    }
    return await this._list(startFromIdx);
  }
  protected async _list(startFromIdx: number): Promise<PaginatedResult> {
    await this.beforeRead();
    const totalEntryCount = this.data.length;
    const pageSize = this._opts?.list?.pageSize ?? 100;
    const entries = this.data.slice(startFromIdx, startFromIdx + pageSize);
    return {
      entries,
      totalEntryCount,
      hasMore: totalEntryCount > startFromIdx + pageSize,
      pageCount: Math.floor(totalEntryCount / pageSize),
      currentPageNumber: Math.floor(startFromIdx / pageSize),
      nextPageToken: JSON.stringify({
        startAt: startFromIdx + pageSize,
      } as InMemoryStorePaginateToken),
      pageSize,
      entryCount: entries.length,
      // next: async () => await this._list(startFromIdx + pageSize),
      // prev: async () =>
      //   await this._list(startFromIdx > pageSize ? startFromIdx - pageSize : 0),
      // page: async (p: number) => await this._list(p - 1 * pageSize),
    };
  }
}
