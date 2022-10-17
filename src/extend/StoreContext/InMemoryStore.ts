import { InMemoryStoreOptions } from "./InMemoryStoreOptions";
import { PaginatedResult } from "./PaginatedResult";
import { StoreInterface } from "./StoreInterface";

interface InMemoryStorePaginateToken {
  startAt: number;
}

export class InMemoryStore implements StoreInterface {
  protected data: Array<{ id: string; data: string }> = [];
  protected indexes: Record<string, Record<string, Array<string>>> = {};
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
  protected async afterChange(
    id: string,
    data: string,
    indexes?: Record<string, string>
  ): Promise<void> {}

  protected async beforeRead(opts: {
    id?: string;
    indexes?: Record<string, string>;
  }): Promise<void> {}

  onReloadNeeded(handle: () => void): () => void {
    // not applicable
    return () => {};
  }

  protected addToIndex(key: string, value: string, id: string) {
    if (!(key in this.indexes)) this.indexes[key] = {};
    if (!(value in this.indexes[key])) this.indexes[key][value] = [];

    if (!this.indexes[key][value].includes(id))
      this.indexes[key][value].push(id);
  }
  protected removeFromIndex(key: string, id: string) {
    for (const value in this.indexes[key]) {
      const idx = this.indexes[key][value].findIndex((i) => i === id);
      if (idx !== -1) this.indexes[key][value].splice(idx, 1);
    }
  }
  protected removeFromAllIndexes(id: string) {
    for (const key in this.indexes) this.removeFromIndex(key, id);
  }

  async add(
    data: string,
    indexes?: Record<string, string>
  ): Promise<{ id: string }> {
    const id = this.generateId();
    this.data.push({ id, data });
    if (indexes)
      for (const key in indexes) this.addToIndex(key, indexes[key], id);
    this._opts?.warnOnUse &&
      console.warn("Adding data to InMemoryStore", { id, data });
    await this.afterChange(id, data, indexes);
    return { id };
  }

  async get(id: string): Promise<string | null> {
    await this.beforeRead({ id });
    const doc = this.data.find((d) => d.id === id);
    this._opts?.warnOnUse &&
      console.warn("Getting data from InMemoryStore", { id });
    return doc ? doc.data : null;
  }

  async set(
    id: string,
    data: string,
    indexes?: Record<string, string>
  ): Promise<boolean> {
    const idx = this.data.findIndex((d) => d.id === id);
    if (idx !== -1) this.data[idx].data = data;
    else this.data.push({ id, data });

    if (indexes)
      for (const key in indexes) {
        this.removeFromIndex(key, id);
        this.addToIndex(key, indexes[key], id);
      }

    this._opts?.warnOnUse &&
      console.warn("Setting data to InMemoryStore", { id, data });
    await this.afterChange(id, data, indexes);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.beforeRead({ id });
    const idx = this.data.findIndex((d) => d.id === id);
    if (idx !== -1) {
      this._opts?.warnOnUse &&
        console.warn("Deleting data from InMemoryStore", { id });
      this.data.splice(idx, 1);
      this.removeFromAllIndexes(id);
      await this.afterChange(id, "");
      return true;
    }
    return false;
  }
  async deleteAll(indexes?: Record<string, string>): Promise<boolean> {
    if (indexes) {
      const idsToDelete: string[] = [];
      // gatters ids to delete and clear indexes in questions
      for (const key in indexes) {
        if (key in this.indexes) {
          const value: string = indexes[key];
          if (value in this.indexes[key]) {
            idsToDelete.push(...this.indexes[key][value]);
            delete this.indexes[key][value];
          }
        }
      }
      // delete targeted documents
      this.data = this.data.filter((d) => !idsToDelete.includes(d.id));
      await this.afterChange("some", JSON.stringify(indexes));
    } else {
      this.data = [];
      this.indexes = {};
      await this.afterChange("all", "");
    }
    this.nextId = 1;
    return true;
  }

  async list(
    paginateToken?: string,
    indexes?: [key: string, value: string]
  ): Promise<PaginatedResult> {
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
    return await this._list(startFromIdx, indexes);
  }
  protected async _list(
    startFromIdx: number,
    index?: [key: string, value: string]
  ): Promise<PaginatedResult> {
    await this.beforeRead(index ? { [index[0]]: index[1] } : {});
    const totalEntryCount = this.data.length;
    const pageSize = this._opts?.list?.pageSize ?? 100;
    const start = startFromIdx,
      end = startFromIdx + pageSize;
    const entries = index
      ? await this.readSliceFromIndex(start, end, index)
      : this.readDataSlice(start, end);
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

  private readSliceFromIndex(
    start: number,
    end: number,
    index: [key: string, value: string]
  ) {
    if (
      index[0] in this.indexes &&
      index[1] in this.indexes[index[0]] &&
      this.indexes[index[0]][index[1]]
    ) {
      return Promise.all(
        this.indexes[index[0]][index[1]].slice(start, end).map((id) =>
          this.get(id).then((data) => {
            // this null string might not be a good idea, but it shouldn't
            // happen...
            return { id, data: data ?? "null" };
          })
        )
      );
    }
    return [];
  }

  private readDataSlice(start: number, end: number) {
    return this.data.slice(start, end);
  }
}
