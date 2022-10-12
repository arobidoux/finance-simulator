import { ModelRequestFound } from "./ModelRequestFound";
import { ModelRequestStatuses } from "./ModelRequestStatuses";

export type ModelRequest<T> =
  | {
      status: ModelRequestStatuses.INITIATED;
    }
  | ModelRequestFound<T>
  | { status: ModelRequestStatuses.NEW }
  | { status: ModelRequestStatuses.NOT_FOUND }
  | { status: ModelRequestStatuses.ERROR; error: string };
