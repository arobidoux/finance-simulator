import { useContext } from "react";
import { StoreContext } from "../StoreContext";
import { CreatedModel } from "./CreatedModel";
import { ModelCacheInterface } from "./ModelCacheInterface";

export function useModelCache<T, P>(model: CreatedModel<T, P>) {
  const store = useContext(StoreContext).forModel(model);
  const cache = {} as {
    [key: string]: { value?: T | null; loading: Promise<T | null> };
  };
  return {
    get: (id: string, callback: { (entry: T | null): void }) => {
      if (id in cache) {
        const v = cache[id].value;
        if (typeof v !== "undefined") callback(v);
        else cache[id].loading.then((v) => callback(v));
      } else {
        cache[id] = {
          loading: store.get(id).then((v) => (cache[id].value = v)),
        };
      }
    },
  } as ModelCacheInterface<T>;
}
