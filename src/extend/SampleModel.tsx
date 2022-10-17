import { useContext, useEffect, useMemo, useState } from "react";
import {
  createModel,
  LocalStorageStore,
  ModelList,
  ModelRequestStatuses,
  ModelTypeOf,
  PaginatedMeta,
  StoreContext,
  useModelOptions,
  useModel,
} from ".";

export const memberModel = createModel({
  name: "member",
  sample: () => {
    return {
      name: "John Smith",
      email: "johnsmith@exemple.com",
      accountids: [] as string[],
      luckyNumbers: [] as number[],
    };
  },
})
  .$migrate({
    sample: (prev) => {
      return { ...prev, gender: "male" };
    },
    migrate: (old) => {
      return { ...old, gender: "unknown" };
    },
  })
  .$migrate({
    sample: (prev) => {
      return { ...prev, phone: "555-555-5555" as string | null };
    },
    migrate: (old) => {
      return { ...old, phone: null };
    },
  });

export function SampleModel() {
  const storeContext = useContext(StoreContext);

  const store = storeContext.specialize(
    memberModel,
    new LocalStorageStore({
      key: "members",
      id: {
        incrementPadding: 6,
        prefix: "member-",
      },
      list: {
        pageSize: 3,
      },
      warnOnUse: true,
    })
  );

  return (
    <StoreContext.Provider value={store}>
      <SampleModelList></SampleModelList>
    </StoreContext.Provider>
  );
}
function SampleModelList(props: {}) {
  const store = useContext(StoreContext).forModel(memberModel);
  const [loadNonce, setLoadNonce] = useState(new Date());

  useEffect(() => {
    const deregister = store.onReloadNeeded(() => {
      console.debug("onReloadNeeded");
      setLoadNonce(new Date());
    });
    return () => {
      console.debug("de-registering");
      deregister();
    };
  }, [setLoadNonce, store]);

  const [pagination, setPagination] = useState<PaginatedMeta | null>(null);
  const [loadPageToken, setLoadPageToken] = useState<null | string>(null);
  const list = useMemo(
    () => (
      <ModelList
        model={memberModel}
        loadNonce={loadNonce}
        loadPageToken={loadPageToken}
        onPageChange={(m) => setPagination(m)}
      >
        <Member></Member>
      </ModelList>
    ),
    [loadNonce, loadPageToken, setPagination]
  );
  return (
    <div>
      <button onClick={() => setLoadNonce(new Date())}>
        Reload Member List
      </button>
      <button
        onClick={() =>
          // window.confirm("Delete all Members?") &&
          store.deleteAll().then(() => setLoadNonce(new Date()))
        }
      >
        Delete All
      </button>
      {list}
      <Pagination
        pagination={pagination}
        setLoadPageToken={setLoadPageToken}
      ></Pagination>
    </div>
  );
}

function Pagination(props: {
  pagination: PaginatedMeta | null;
  setLoadPageToken: { (token: string | null): void };
}) {
  const [paginationTokens, setPaginationTokens] = useState<
    Array<string | null>
  >([null]);
  const [currentTokenIdx, setCurrentTokenIdx] = useState(0);

  const { pagination, setLoadPageToken } = props;

  useEffect(() => {
    if (
      pagination &&
      pagination.hasMore &&
      !paginationTokens.includes(pagination.nextPageToken)
    )
      setPaginationTokens([...paginationTokens, pagination.nextPageToken]);
  }, [pagination, paginationTokens, setPaginationTokens]);

  if (pagination) {
    const { totalEntryCount, entryCount } = pagination;

    const directPageButton = paginationTokens.map((token, idx) => {
      return (
        <button
          key={"page-" + idx}
          onClick={() => {
            setCurrentTokenIdx(idx);
            setLoadPageToken(token);
          }}
          disabled={currentTokenIdx === idx}
        >
          {idx === currentTokenIdx + 1 &&
          paginationTokens.length - 2 === currentTokenIdx
            ? "Next"
            : idx}
        </button>
      );
    });

    // if (currentPageNumber) {
    //   directPageButton.push(
    //     <span key="page-label">Page: {currentPageNumber}</span>
    //   );
    // }

    return (
      <div>
        {directPageButton}
        {typeof totalEntryCount !== "undefined" && totalEntryCount > 0 && (
          <span>
            showing {entryCount} / {totalEntryCount}
          </span>
        )}
        <pre>{JSON.stringify(props.pagination)}</pre>
      </div>
    );
  }
  return <>No Pagination</>;
}

export function Member(props: {
  useModelOptions?: useModelOptions<ModelTypeOf<typeof memberModel>>;
}) {
  const {
    entry: member,
    update,
    ...$member
  } = useModel(memberModel, { ...props.useModelOptions });

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        $member.commit();
      }}
    >
      <h4>
        Edit {$member.id ? "Member " : "New Member "}
        {member?.name
          ? member.name + ($member.hasChanges("name") ? "*" : "")
          : ""}
        {$member.id && " #" + $member.id}
      </h4>
      <label>
        Name
        <input
          type="text"
          value={member?.name ?? ""}
          onChange={(ev) => update("name", ev.target.value)}
        />
      </label>{" "}
      <br />
      <label>
        Email
        <input
          type="text"
          value={member?.email ?? ""}
          onChange={(ev) => update("email", ev.target.value)}
        />
      </label>
      <br />
      <label>
        Gender
        <input
          type="text"
          value={member?.gender ?? ""}
          onChange={(ev) => update("gender", ev.target.value)}
        />
      </label>
      <br />
      <label>
        Phone
        <input
          type="text"
          value={member?.phone ?? ""}
          onChange={(ev) =>
            update("phone", ev.target.value === "" ? null : ev.target.value)
          }
        />
      </label>
      <br />
      <button
        type="button"
        onClick={() => $member.reset()}
        disabled={!$member.hasChanges()}
      >
        Discard changes
      </button>
      <button type="submit" disabled={!$member.hasChanges()}>
        Save
      </button>
      {$member.request.status === ModelRequestStatuses.FOUND && (
        <button
          type="button"
          onClick={() =>
            // window.confirm(`delete ${member?.name} #${$member.id}`) &&
            $member.delete()
          }
        >
          Delete
        </button>
      )}
    </form>
  );
}
