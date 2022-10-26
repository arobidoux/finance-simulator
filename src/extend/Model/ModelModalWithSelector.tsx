import {
  ReactElement,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { CreatedModel } from "./CreatedModel";
import { PaginatedMeta, StoreContext } from "../StoreContext";
import { useModelOptions } from "./useModelOptions";
import { ModelRequestFound } from "./ModelRequestFound";
import { ModelRequestStatuses } from "./ModelRequestStatuses";

export function ModelModalWithSelector<T, P>(props: {
  model: CreatedModel<T, P>;
  loadNonce?: string | number | Date;
  loadPageToken?: string | null;
  index?: [keyof T, string];
  onPageChange?: (meta: PaginatedMeta & { entryCount: number }) => void;
  renderSelector: {
    (props: {
      rows: Array<ReactElement>;
      currentSelectedId: string | null;
      selectId: { (id: string | null): void };
    }): ReactElement;
  };
  renderRow: {
    (
      model: T,
      id: string,
      props: { select: { (): void }; current: boolean }
    ): ReactElement;
  };
  renderModal: {
    (useModelOptions: useModelOptions<T>): ReactElement;
  };
}) {
  const storeContext = useContext(StoreContext);
  const [{ entries }, dispatch] = useReducer(
    (
      state: { entries: ModelRequestFound<T>[] },
      action:
        | { action: "remove"; id: string }
        | { action: "add"; entry: ModelRequestFound<T> }
        | { action: "set"; entries: ModelRequestFound<T>[] }
        | { action: "update"; id: string; entry: T }
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
        case "update":
          return {
            ...state,
            entries: [
              ...state.entries.map((entry) =>
                entry.id === action.id
                  ? { ...entry, result: action.entry }
                  : entry
              ),
            ],
          };

        default:
          throw new Error("invalid action");
      }
    },
    { entries: [] }
  );
  const [created, setCreated] = useState(1);

  const [currentModel, setCurrentModel] = useState<ModelRequestFound<T> | null>(
    null
  );

  useEffect(() => {
    storeContext
      .forModel(props.model)
      .list(
        props.loadPageToken ?? undefined,
        props.index ? [props.index[0].toString(), props.index[1]] : undefined
      )
      .then((page) => {
        const { entries, ...meta } = page;
        if (entries.length)
          setCurrentModel({
            status: ModelRequestStatuses.FOUND,
            id: entries[0].id,
            result: entries[0].data,
          });
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

  const rows = entries.map((request) =>
    props.renderRow(request.result, request.id, {
      select: () => setCurrentModel(request),
      current: currentModel?.id === request.id,
    })
  );

  return (
    <>
      {props.renderSelector({
        rows,
        currentSelectedId: currentModel?.id ?? null,
        selectId: (id: string | null) => {
          setCurrentModel(
            id === null ? id : entries.find((e) => e.id === id) ?? null
          );
        },
      })}
      {props.renderModal({
        request: currentModel ?? undefined,
        index: props.index,
        onCreate: (id: string, result: T) => {
          dispatch({
            action: "add",
            entry: { id, result, status: ModelRequestStatuses.FOUND },
          });
          setCreated(created + 1);
          setCurrentModel({ id, result, status: ModelRequestStatuses.FOUND });
        },
        onUpdate: (id: string, result: T) =>
          dispatch({
            action: "update",
            id,
            entry: result,
          }),
        onDelete: (id: string) => {
          dispatch({ action: "remove", id });
          setCurrentModel(null);
        },
      })}
    </>
  );
}
