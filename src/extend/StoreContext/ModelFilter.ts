import { CreatedModel } from "../Model/CreatedModel";

export type ModelFilter = { <X, Y>(model: CreatedModel<X, Y>): boolean };
