import { CreatedModel } from "./CreatedModel";

export type ModelTypeOf<M> = M extends CreatedModel<infer T, any> ? T : never;
