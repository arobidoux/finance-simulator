import { CreatedModel } from "../Model/CreatedModel";
import { ModelFilter } from "./ModelFilter";
import { StoreContextInterface } from "./StoreContextInterface";
import { StoreInterface } from "./StoreInterface";
import { FormatedStoreInterface } from "./FormatedStoreInterface";

export class BaseStoreContext implements StoreContextInterface {
  private _store: StoreInterface;
  private _parent?: BaseStoreContext;
  private _model: ModelFilter;
  constructor(
    store: StoreInterface,
    model: ModelFilter,
    parent?: BaseStoreContext
  ) {
    this._store = store;
    this._model = model;
    this._parent = parent;
  }
  specialize<T, P>(
    model: ModelFilter | CreatedModel<T, P>,
    store: StoreInterface
  ): BaseStoreContext {
    return new BaseStoreContext(
      store,
      typeof model === "function" ? model : (t: any) => t === model,
      this
    );
  }

  forModel<T, P>(model: CreatedModel<T, P>): StoreInterface<T> {
    if (this._model(model))
      return new FormatedStoreInterface(model, this._store);
    else if (this._parent) return this._parent.forModel(model);
    else throw new Error("No store available for the requested model");
  }
}
