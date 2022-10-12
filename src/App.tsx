import { useContext, useState } from "react";
import "./App.css";
import { Member, memberModel } from "./components/Member";
import { LocalStorageStore, ModelList, StoreContext } from "./extend";
// import { FinanceSimulationExplorer } from "./components/FinanceSimulationExplorer";

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
  const [loadNonce, setLoadNonce] = useState(new Date());
  const store = storeContext.specialize(
    memberModel,
    new LocalStorageStore({
      key: "members",
      onReloadNeeded: () => setLoadNonce(new Date()),
      id: {
        incrementPadding: 6,
        prefix: "member-",
      },
    })
  );

  return (
    <StoreContext.Provider value={store}>
      {/* <FinanceSimulationExplorer></FinanceSimulationExplorer> */}
      <button onClick={() => setLoadNonce(new Date())}>
        Reload Member List
      </button>
      <button
        onClick={() =>
          // window.confirm("Delete all Members?") &&
          store
            .forModel(memberModel)
            .deleteAll()
            .then(() => setLoadNonce(new Date()))
        }
      >
        Delete All
      </button>
      <ModelList model={memberModel} loadNonce={loadNonce}>
        <Member></Member>
      </ModelList>
    </StoreContext.Provider>
  );
}
export default App;
