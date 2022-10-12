import "./App.css";
// import { FinanceSimulationExplorer } from "./components/FinanceSimulationExplorer";

import { useContext, useEffect, useMemo, useState } from "react";
import { Member, memberModel } from "./components/Member";
import {
  LocalStorageStore,
  ModelList,
  StoreContext,
  PaginatedMeta,
} from "./extend";

function App() {
  return (
    <div className="App">
      {/* <FinanceSimulationExplorer></FinanceSimulationExplorer> */}
      <SampleModel></SampleModel>
    </div>
  );
}

function SampleModel() {
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
export default App;
