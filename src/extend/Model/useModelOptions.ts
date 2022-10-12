import { ModelRequestFound } from "./ModelRequestFound";

export interface useModelOptions<T> {
  // will load this entry, if available
  id?: string;
  // when id is not specified, the sample value will be returned as "entry".
  // if a blank slate is prefered, set this to true
  blank?: boolean;
  request?: ModelRequestFound<T>;
  onChange?: {
    (action: "created" | "updated" | "deleted", id: string, entry: T): void;
  };
  onDelete?: { (id: string): void };
  onCreate?: { (id: string, entry: T): void };
  onUpdate?: { (id: string, entry: T): void };
}
