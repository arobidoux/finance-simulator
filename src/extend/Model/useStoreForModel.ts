import { useContext } from "react";
import { StoreContext, StoreInterface } from "../StoreContext";
import { CreatedModel } from "./CreatedModel";

export function useStoreForModel<T, P>(
  model: CreatedModel<T, P>
): StoreInterface<T> {
  return useContext(StoreContext).forModel(model);
}
