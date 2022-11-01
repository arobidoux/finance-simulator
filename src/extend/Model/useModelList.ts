import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { StoreContext } from "../StoreContext";
import { CreatedModel } from "./CreatedModel";
import { ModelRequestFound } from "./ModelRequestFound";
import { ModelRequestStatuses } from "./ModelRequestStatuses";

export interface useModelListOptions<T> {
  index?: [keyof T, string] & {
    onDelete?: { (handle: { (): void }): { (): void } };
  };
  loadNonce?: string | number | Date;
  loadPageToken?: string | null;
  filter?: { (entry: T): boolean };
}

export function useModelList<T, P>(
  model: CreatedModel<T, P>,
  opts?: useModelListOptions<T>
) {
  const storeContext = useContext(StoreContext);

  const [nonce, setNonce] = useState(1);

  const loadPageToken = opts?.loadPageToken ?? undefined;
  const filter = opts?.filter ?? undefined;
  const loadNonce = opts?.loadNonce;
  const index = useMemo<[string, string] | undefined>(
    () =>
      opts?.index ? [opts?.index[0].toString(), opts?.index[1]] : undefined,
    [opts?.index]
  );

  useEffect(
    () => storeContext.registerForChangesOn(model, () => setNonce(nonce + 1)),
    [storeContext, setNonce, nonce, model]
  );

  const [{ entries }, dispatch] = useReducer(
    (
      state: { entries: ModelRequestFound<T>[] },
      action:
        | { action: "remove"; id: string }
        | { action: "add"; entry: ModelRequestFound<T> }
        | { action: "set"; entries: ModelRequestFound<T>[] }
    ) => {
      switch (action.action) {
        case "add":
          return { ...state, entries: [...state.entries, action.entry] };

        case "remove":
          return {
            ...state,
            entries: state.entries.filter((e) => e.id !== action.id),
          };
        case "set":
          return { ...state, entries: action.entries };
        default:
          throw new Error("invalid action");
      }
    },
    { entries: [] }
  );

  useEffect(() => {
    storeContext
      .forModel(model)
      .list(loadPageToken, index)
      .then((page) => {
        let { entries } = page;
        if (filter) {
          entries = entries.filter(({ data }) => filter(data));
        }

        dispatch({
          action: "set",
          entries: entries.map(({ id, data }) => {
            return {
              status: ModelRequestStatuses.FOUND,
              id: id,
              result: data,
            };
          }),
        });
      });
  }, [model, storeContext, loadPageToken, index, filter, nonce, loadNonce]);

  const add = useCallback(
    (id: string, entry: T) => {
      dispatch({
        action: "add",
        entry: { id, result: entry, status: ModelRequestStatuses.FOUND },
      });
    },
    [dispatch]
  );

  const remove = useCallback(
    (id: string) => {
      dispatch({ action: "remove", id });
    },
    [dispatch]
  );

  return {
    entries,
    add,
    remove,
  };
}
