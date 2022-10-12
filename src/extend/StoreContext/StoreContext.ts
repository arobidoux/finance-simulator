import { createContext } from "react";
import { BaseStoreContext } from "./BaseStoreContext";
import { InMemoryStore } from "./InMemoryStore";

/**
 * TODO figure out if there's a way to scope the storeContext, to separate with
 * other developers. That way we could also have our data as needed on the
 * platform.
 */
export const StoreContext = createContext<BaseStoreContext>(
  // default store will accept all model
  new BaseStoreContext(new InMemoryStore({ warnOnUse: true }), (m) => true)
);
