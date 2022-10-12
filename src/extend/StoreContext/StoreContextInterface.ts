import { CreatedModel } from "../Model/CreatedModel";
import { ModelFilter } from "./ModelFilter";
import { StoreInterface } from "./StoreInterface";

export interface StoreContextInterface {
  specialize: {
    <T, P>(
      model: ModelFilter | CreatedModel<T, P>,
      store: StoreInterface
    ): StoreContextInterface;
  };
  forModel: { <T, P>(model: CreatedModel<T, P>): StoreInterface<T> };
}
