import { ModelRequest } from "./ModelRequest";

export interface useModelResult<T> {
  id: string | null;
  entry: Partial<T> | T | null;
  error: null | string;
  update: { <K extends keyof T>(key: K, value: T[K]): void };
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
  request: ModelRequest<T>;
}
