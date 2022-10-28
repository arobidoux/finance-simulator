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
    // tehcnically, this would only be the values that were indexed from the
    // model, and not any of it's key...
    //
    // define the value of the index needed to load the list of entries, and
    // what value should be set whenever a new entry is created
    index?: [keyof T, string] & {
      onDelete?: { (handle: { (): void }): { (): void } };
    };
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
      .list(
        props.loadPageToken ?? undefined,
        props.index ? [props.index[0].toString(), props.index[1]] : undefined
      )
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

  useEffect(() => {
    const index = props.index;
    if (typeof index?.onDelete === "function") {
      return index.onDelete(() => {
        storeContext.forModel(props.model).deleteAll({
          [index[0]]: index[1],
        });
      });
    }
  }, [storeContext, props.index, props.model]);

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
        child as ReactElement<{ useModelOptions?: useModelOptions<T> }>,
        {
          key: "new-" + created,
          useModelOptions: {
            onCreate: (id: string, result: T) => {
              dispatch({
                action: "add",
                entry: { id, result, status: ModelRequestStatuses.FOUND },
              });
              setCreated(created + 1);
            },
            index: props.index,
          },
        }
      ),
    [child, dispatch, created, setCreated, props.index]
  );

  return (
    <>
      {entries.map((request) =>
        cloneElement(
          child as ReactElement<{
            useModelOptions?: useModelOptions<T>;
          }>,
          {
            key: request.id,
            useModelOptions: {
              request,
              index: props.index,
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
