import { Dispatch, useReducer } from "react";
import debug from "debug";

const D = debug("useNativeObjectStore");
const nativeObjectCache: Record<
  string,
  Record<string, Promise<any> | any>
> = {};

function LocalStore(namespace: string = "nativeObjectStore:") {
  return {
    set: (key: string, data: string) => {
      window.localStorage.setItem(namespace + key, data);
      return true;
    },
    get: (key: string) => {
      const data = window.localStorage.getItem(namespace + key);
      return data === null ? undefined : data;
    },
  };
}

export interface UseNativeObjectStoreOptions<I> {
  alias: string;
  ready?: { (instance: I): void };
}

export interface useNativeObjectStorePersistNewHandle<I> {
  (inst: I): Promise<boolean>;
}

/**
 * Used to be able to keep track of native object (Javascript instances), and to
 * access them in the different component / hooks.
 *
 * helps to define a specific "namespace", with an asynchronous instanciation
 * function that will be called for every new "alias" requested to the providing
 * function.
 *
 * If an alias was already being provided, the initial providing result will
 * prevail and be returned for all the location that requested the alias
 */
export function useNativeObjectStore<
  T,
  G extends UseNativeObjectStoreOptions<T>
>(
  namespace: string,
  instanciate: {
    (opts: G, store: useNativeObjectStorePersistNewHandle<T>): Promise<T> | T;
  },
  persist?: useNativeObjectStorePersistOptions<T>,
  store?: useNativeObjectStoreStoreLib
) {
  const cache =
    namespace in nativeObjectCache
      ? nativeObjectCache[namespace]
      : (nativeObjectCache[namespace] = {});

  const d = D.extend(namespace);

  // using this reducer to ensure the hook will provide a new value when any of
  // the stored instances change.
  const [statuses, dispatch] = useReducer(statusesStateReduce, {});
  d("returning provide function, statuses: %o", statuses);
  return curryProvide(
    instanciate,
    dispatch,
    cache,
    persist
      ? {
          m: persist,
          store: store ?? LocalStore("nativeObjectStore:" + namespace + ":"),
        }
      : null,
    d
  );
}
type useNativeObjectStorePersistOptions<T> = [
  { (instance: T): Promise<string> | string },
  {
    (raw: string, store: useNativeObjectStorePersistNewHandle<T>):
      | Promise<T | false>
      | T
      | false;
  }
];
interface useNativeObjectStoreStoreLib {
  set: { (key: string, data: string): boolean | Promise<boolean> };
  get: { (key: string): string | undefined | Promise<string | undefined> };
}
const curryProvide = <T, G extends UseNativeObjectStoreOptions<T>>(
  instanciate: {
    (opts: G, store: useNativeObjectStorePersistNewHandle<T>): Promise<T> | T;
  },
  dispatch: Dispatch<CacheAction>,
  cache: Record<string, T | Promise<T>>,
  persist: {
    m: useNativeObjectStorePersistOptions<T>;
    store: useNativeObjectStoreStoreLib;
  } | null,
  d: debug.Debugger
) =>
  function provide(opts: G): {
    ready: boolean;
    instance: T | null;
    promise: Promise<T>;
  } {
    const myInstanciate = async (
      opts: G,
      store: useNativeObjectStorePersistNewHandle<T>
    ) => {
      if (persist) {
        // look to load it from storage
        const encoded = await persist.store.get(opts.alias);
        if (encoded) {
          const result = await persist.m[1](encoded, store);
          if (result !== false) return result;
        }
      }
      return await instanciate(opts, store);
    };

    d("providing %s", opts.alias);
    let readyPromiseResolve: { (value: T): void },
      readyPromiseReject: { (reason?: any): void };
    const readyPromise = new Promise<T>((resolve, reject) => {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });

    const ready = (value: T) => {
      if (typeof opts.ready === "function") opts.ready(value);
      readyPromiseResolve(value);
    };
    const instError = (err: any) => {
      readyPromiseReject(err);
    };

    if (opts.alias in cache) {
      const cachedValue = cache[opts.alias];
      if (cachedValue instanceof Promise) {
        // generating
        d("providing %s already generating", opts.alias);
        cachedValue.then((value: T) => {
          ready(value);
        }, instError);
        return { ready: false, instance: null, promise: readyPromise };
      } else {
        //ready
        d("providing %s already ready", opts.alias);
        // dispatch({ type: "ready", alias: opts.alias });
        ready(cachedValue);
        return {
          ready: true,
          instance: cachedValue,
          promise: readyPromise,
        };
      }
    } else {
      try {
        d("providing %s instanciating", opts.alias);
        const inst = (cache[opts.alias] = myInstanciate(opts, async (snap) => {
          if (!persist) {
            throw new Error(
              "Cannot persist objects, missing encoding and decoding methods"
            );
          }
          const raw = await persist.m[0](snap);
          return await persist.store.set(opts.alias, raw);
        }));
        if (inst instanceof Promise) {
          d("providing %s instanciation launched", opts.alias);
          inst.then((value) => {
            d("providing %s cached", opts.alias);
            // cache value for future use
            cache[opts.alias] = value;
            dispatch({ type: "ready", alias: opts.alias });
            ready(value);
          }, instError);
          dispatch({ type: "add", alias: opts.alias });
          return { ready: false, instance: null, promise: readyPromise };
        } else {
          d("providing %s instanciated synchronously", opts.alias);
          dispatch({ type: "ready", alias: opts.alias });
          ready(inst);
          return { ready: true, instance: inst, promise: readyPromise };
        }
      } catch (err) {
        instError(err);
        throw err;
      }
    }
  };

interface CacheState {
  [key: string]: "generating" | "ready";
}
interface CacheAction {
  type: "add" | "del" | "ready";
  alias: string;
}
function statusesStateReduce(
  state: CacheState,
  action: CacheAction
): CacheState {
  switch (action.type) {
    case "add":
      if (state[action.alias] !== "generating")
        return {
          ...state,
          [action.alias]: "generating",
        };
      break;
    case "ready":
      return {
        ...state,
        [action.alias]: "ready",
      };
    case "del":
      if (action.alias in state) {
        const next = { ...state };
        delete next[action.alias];
        return next;
      }
      break;
    default:
      throw new Error("Invalid action type " + action.type);
  }
  return state;
}
