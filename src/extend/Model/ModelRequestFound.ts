import { ModelRequestStatuses } from "./ModelRequestStatuses";

export interface ModelRequestFound<T> {
  status: ModelRequestStatuses.FOUND;
  result: T;
  id: string;
}
