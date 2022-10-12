import {
  Dispatch,
  Reducer,
  ReducerAction,
  useCallback,
  useContext,
  useDebugValue,
  useEffect,
  useReducer,
  useState,
} from "react";
import { StoreContext } from "../StoreContext/StoreContext";
import { CreatedModel } from "./CreatedModel";
import { ModelRequest } from "./ModelRequest";
import { ModelRequestStatuses } from "./ModelRequestStatuses";
import { useModelOptions } from "./useModelOptions";
import { useModelResult } from "./useModelResult";

interface useModelReducerState<T> {
  request: ModelRequest<T>;
  draft: Partial<T>;
  entry: Partial<T> | null;
  fresh: T;
}

type useModelReducerAction<T, K extends keyof T> =
  | { action: "clear" | "new" }
  | { action: "update"; key: K; value: T[K] }
  | { action: "set-request"; request: ModelRequest<T>; entry: T | null };

function useModelReducer<T>(
  state: useModelReducerState<T>,
  action: useModelReducerAction<T, keyof T>
): useModelReducerState<T> {
  switch (action.action) {
    case "clear":
      let entry: T | null = null;
      if (state.request.status === ModelRequestStatuses.FOUND)
        entry = state.request.result;
      else if (state.request.status === ModelRequestStatuses.NEW)
        entry = state.fresh;
      else throw new Error("invalid request status, cannot reset model");

      return {
        ...state,
        draft: {},
        entry,
      };
    case "update":
      if (
        !("result" in state.request) ||
        state.request.result[action.key] !== action.value
      ) {
        // only add values that changed
        return {
          ...state,
          draft: { ...state.draft, [action.key]: action.value },
          entry: { ...state.entry, [action.key]: action.value },
        };
      } else {
        // otherwise, remove the key from the draft, if any was present
        const { [action.key]: toTrash, ...newDraft } = state.draft;
        return {
          ...state,
          draft: newDraft as Partial<T>,
          entry: { ...state.entry, [action.key]: action.value },
        };
      }
    case "set-request":
      return {
        ...state,
        request: action.request,
        entry: action.entry,
        draft: {},
      };
    case "new":
      return {
        ...state,
        request: { status: ModelRequestStatuses.NEW },
        draft: { ...state.fresh },
        entry: { ...state.fresh },
      };
    default:
      throw new Error("invalid action");
  }
}

export function useModel<T, P>(
  model: CreatedModel<T, P>,
  opts?: useModelOptions<T>
): useModelResult<T> {
  const storeContext = useContext(StoreContext);
  const [docId, setDocId] = useState<string | null>(
    opts?.request?.id ?? opts?.id ?? null
  );
  const [error, setError] = useState<string | null>(null);

  const initState: useModelReducerState<T> = {
    request: opts?.request ?? {
      status: ModelRequestStatuses.INITIATED,
    },
    draft: {},
    entry: opts?.request?.result ?? null,
    fresh: opts?.blank === true ? ({} as T) : model.$.sample(),
  };

  const [{ draft, entry, request }, dispatch] = useReducer(
    useModelReducer,
    initState
  ) as [
    useModelReducerState<T>,
    Dispatch<
      ReducerAction<
        Reducer<useModelReducerState<T>, useModelReducerAction<T, keyof T>>
      >
    >
  ];

  const optsId = opts?.id ?? null;
  const optsRequest = opts?.request ?? null;

  // load the value
  useEffect(() => {
    if (optsId) {
      storeContext
        .forModel(model)
        .get(optsId)
        .then((result) => {
          if (result) {
            dispatch({
              action: "set-request",
              request: {
                status: ModelRequestStatuses.FOUND,
                id: optsId,
                result,
              },
              entry: result,
            });
          } else {
            dispatch({
              action: "set-request",
              request: {
                status: ModelRequestStatuses.NOT_FOUND,
              },
              entry: null,
            });
          }
        });
    } else if (!optsRequest) {
      dispatch({
        action: "new",
      });
    } else {
      // we assume the provided request had the
    }
  }, [storeContext, model, optsId, optsRequest, dispatch]);

  useDebugValue(docId ? "editing-doc-" + docId : "new-doc");

  const hasChanges = useCallback(
    (key?: string) => {
      if (typeof key === "undefined") {
        // this will return true if any key is present in the draft object
        for (const k in draft) return true;
      } else if (key in draft) {
        return true;
      }
      return false;
    },
    [draft]
  );

  const reset = useCallback(() => {
    dispatch({ action: "clear" });
  }, [dispatch]);

  return {
    id: docId,
    entry: entry,
    request: request,
    error: error,
    update: <K extends keyof T>(key: K, value: T[K]) =>
      dispatch({ action: "update", key, value }),
    commit: () => {
      if (hasChanges()) {
        // TODO ensure we do not double commit
        // Check to ensure promises won't cause a problem here..
        const newEntry = { ...entry } as T;
        let updatePromise: Promise<{
          entry: T;
          id: string;
          action: "created" | "updated";
        }>;
        if (docId)
          updatePromise = storeContext
            .forModel(model)
            .set(docId, newEntry)
            .then(async (success) => {
              if (!success) throw Promise.reject("failed to save the document");
              return { entry: newEntry, id: docId, action: "updated" };
            });
        else {
          // TODO check to comunicate creation of document id to parent?
          updatePromise = storeContext
            .forModel(model)
            .add(newEntry)
            .then(({ id }) => {
              setDocId(id);
              return { entry: newEntry, id, action: "created" };
            });
        }
        return updatePromise.then((data) => {
          dispatch({
            action: "set-request",
            request: {
              status: ModelRequestStatuses.FOUND,
              result: data.entry,
              id: data.id,
            },
            entry: data.entry,
          });
          if (data.action === "created" && opts?.onCreate)
            opts.onCreate(data.id, data.entry);
          if (data.action === "updated" && opts?.onUpdate)
            opts.onUpdate(data.id, data.entry);
          if (opts?.onChange) opts.onChange(data.action, data.id, data.entry);
          return data;
        });
      } else if (!docId) {
        return Promise.resolve({
          action: "error",
          message: "Document has no changes and does not exists yet.",
        });
      }
      return Promise.resolve({
        action: "unchanged",
        entry: entry as T,
        id: docId,
      });
    },
    reset,
    hasChanges,
    delete: () => {
      if (docId) {
        return storeContext
          .forModel(model)
          .delete(docId)
          .then((success) => {
            if (success) {
              setDocId(null);
              if (opts?.onDelete) opts.onDelete(docId);
              if (opts?.onChange) opts.onChange("deleted", docId, entry as T);
              return { deleted: true };
            } else {
              setError("Failed to delete");
              return { deleted: false };
            }
          });
      }
      return Promise.resolve({ deleted: false });
    },
  };
}
