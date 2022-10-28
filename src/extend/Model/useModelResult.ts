import { CreatedModel } from "./CreatedModel";
import { ModelRequest } from "./ModelRequest";

export interface useModelResult<T> {
  id: string | null;
  entry: Partial<T> | T | null;
  error: null | string;
  // update: { <K extends keyof T>(key: K, value: T[K]): void };
  update: NestedUpdateHandle<T>;
  // store new version
  commit: {
    (): Promise<
      | {
          action: "created" | "updated" | "unchanged";
          entry: T;
          id: string;
        }
      | { action: "error"; message: string }
    >;
  };
  // reset to loaded value
  reset: { (): void };
  delete: { (): Promise<{ deleted: boolean }> };
  hasChanges: { (key?: string): boolean };
  toForeignIndexFor: {
    <ST, SP, K extends keyof ST>(model: CreatedModel<ST, SP>, key: K): [
      K,
      string
    ] & { onDelete: { (handle: { (): void }): { (): void } } };
  };
  request: ModelRequest<T>;
}

export type NestedUpdateHandle<T> = {
  <K extends keyof T>(key: K, value: T[K]): void;
  <K extends keyof T>(key: K): NestedUpdateHandle<T[K]>;
  <K extends keyof T>(key: K, value?: T[K]): void | NestedUpdateHandle<T[K]>;
};
