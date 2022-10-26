import { CreatedModel } from "../Model/CreatedModel";
import { ModelFilter } from "./ModelFilter";
import { StoreContextInterface } from "./StoreContextInterface";
import { StoreInterface } from "./StoreInterface";
import { FormatedStoreInterface } from "./FormatedStoreInterface";

interface StoreProvider {
  <T, P>(model: CreatedModel<T, P>): StoreInterface;
}
export class BaseStoreContext implements StoreContextInterface {
  private _store: StoreInterface | StoreProvider;
  private _providedStores: Array<{
    model: CreatedModel<any, any>;
    store: StoreInterface;
  }> = [];
  private _parent?: BaseStoreContext;
  private _model: ModelFilter;
  constructor(
    store: StoreInterface | StoreProvider,
    model: ModelFilter,
    parent?: BaseStoreContext
  ) {
    this._store = store;
    this._model = model;
    this._parent = parent;
  }
  specialize<T, P>(
    model: ModelFilter | CreatedModel<T, P>,
    store: StoreInterface | StoreProvider
  ): BaseStoreContext {
    return new BaseStoreContext(
      store,
      typeof model === "function" ? model : (t: any) => t === model,
      this
    );
  }

  forModel<T, P>(model: CreatedModel<T, P>): StoreInterface<T> {
    if (this._model(model)) {
      let store: StoreInterface;
      if (typeof this._store === "function") {
        let provided_store = this._providedStores.find(
          (p) => p.model === model
        )?.store;
        if (!provided_store) {
          provided_store = this._store(model);
          this._providedStores.push({ model, store: provided_store });
        }
        store = provided_store;
        // see if we have one for this model already
      } else store = this._store;

      return new FormatedStoreInterface(model, store, () =>
        this.notifyChangesFor(model)
      );
    } else if (this._parent) return this._parent.forModel(model);
    else throw new Error("No store available for the requested model");
  }

  protected notifyChangesFor<T, P>(model: CreatedModel<T, P>) {
    this.listeners.forEach((listener) => {
      if (listener.filter(model)) listener.handle();
    });
  }

  protected listeners: Array<{
    filter: { (model: CreatedModel<any, any>): boolean };
    handle: { (): any };
  }> = [];

  registerForChangesOn(
    model: CreatedModel<any, any> | Array<CreatedModel<any, any>>,
    handle: { (): any }
  ): { (): void } {
    if (model instanceof Array) {
      const unregisterHandles: Array<{ (): void }> = model.map((m) =>
        this.registerForChangesOn(m, handle)
      );
      return () => unregisterHandles.forEach((h) => h());
    }

    if (!this._model(model)) {
      if (this._parent) return this._parent.registerForChangesOn(model, handle);
      throw new Error("No store available for this model");
    }

    const listener = {
      filter: (m: CreatedModel<any, any>) => m === model,
      handle,
    };
    this.listeners.push(listener);

    return () => {
      const idx = this.listeners.findIndex((l) => l === listener);
      if (idx === -1) {
        throw new Error("this should not happen");
      }
      this.listeners.splice(idx, 1);
    };
  }
}
