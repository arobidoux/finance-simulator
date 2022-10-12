import { CreateModelInterface } from "./CreateModelInterface";
import { modelMigrateInterface } from "./modelMigrateInterface";

export type CreatedModel<T, P> = CreateModelInterface<T, P> &
  modelMigrateInterface<T>;
