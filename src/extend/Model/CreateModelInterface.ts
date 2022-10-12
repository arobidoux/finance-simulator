import { StoredValue } from "./StoredValue";
import { VersionizedData } from "./VersionizedData";

export interface CreateModelInterface<T, P> {
  $: {
    sample: () => T;
    toStore: { (e: T): StoredValue };
    fromStore: { (s: StoredValue): VersionizedData<T> };
    migrate: { (D: { _version?: number } & P): VersionizedData<T> };
    version: number;
  };
}
