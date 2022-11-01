import {
  Children,
  cloneElement,
  isValidElement,
  PropsWithChildren,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CreatedModel } from "./CreatedModel";
import { PaginatedMeta, StoreContext } from "../StoreContext";
import { useModelOptions } from "./useModelOptions";

import { useModelList } from "./useModelList";

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
  const [created, setCreated] = useState(1);
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

  const { entries, add, remove } = useModelList(props.model, {
    index: props.index,
    loadPageToken: props.loadPageToken,
    loadNonce: props.loadNonce,
  });

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
              setCreated(created + 1);
              add(id, result);
            },
            index: props.index,
          },
        }
      ),
    [child, add, created, setCreated, props.index]
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
                remove(request.id);
              },
            },
          }
        )
      )}
      {newEntryComponent}
    </>
  );
}
