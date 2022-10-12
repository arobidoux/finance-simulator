import {
  Children,
  cloneElement,
  isValidElement,
  PropsWithChildren,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { CreatedModel } from "./CreatedModel";
import { PaginatedMeta, StoreContext } from "../StoreContext";
import { useModelOptions } from "./useModelOptions";
import { ModelRequestFound } from "./ModelRequestFound";
import { ModelRequestStatuses } from "./ModelRequestStatuses";

export function ModelList<T, P>(
  props: PropsWithChildren<{
    model: CreatedModel<T, P>;
    loadNonce?: string | number | Date;
    loadPageToken?: string | null;
    onPageChange?: (meta: PaginatedMeta & { entryCount: number }) => void;
  }>
) {
  const storeContext = useContext(StoreContext);
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
  const [created, setCreated] = useState(1);

  useEffect(() => {
    storeContext
      .forModel(props.model)
      .list(props.loadPageToken ?? undefined)
      .then((page) => {
        const { entries, ...meta } = page;
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
        if (typeof props.onPageChange === "function")
          props.onPageChange({ ...meta, entryCount: entries.length });
      });
  }, [storeContext, props]);

  const children = props.children;
  const child = useMemo(() => Children.only(children), [children]);
  if (!isValidElement(child)) {
    throw new Error("ModelList requires an element as children");
  }

  // This use Memo was an attempt to keep the "new" component alive when the
  // ModelList is reloaded, but it failed...
  const newEntryComponent = useMemo(
    () =>
      cloneElement(
        child as ReactElement<{ useModelOpts?: useModelOptions<T> }>,
        {
          key: "new-" + created,
          useModelOpts: {
            onCreate: (id: string, result: T) => {
              dispatch({
                action: "add",
                entry: { id, result, status: ModelRequestStatuses.FOUND },
              });
              setCreated(created + 1);
            },
          },
        }
      ),
    [child, dispatch, created, setCreated]
  );

  return (
    <>
      {entries.map((request) =>
        cloneElement(
          child as ReactElement<{
            useModelOpts?: useModelOptions<T>;
          }>,
          {
            key: request.id,
            useModelOpts: {
              request,
              onDelete: () => {
                dispatch({ action: "remove", id: request.id });
              },
            },
          }
        )
      )}
      {newEntryComponent}
    </>
  );
}
