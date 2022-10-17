import "./App.css";
import { useContext } from "react";
import { FinanceSimulationExplorer } from "./components/FinanceSimulationExplorer";
import { StoreContext, SessionStorageStore } from "./extend";

function App() {
  // make sure everything fallback to the session store
  const storeContext = useContext(StoreContext);
  const store = storeContext.specialize(
    (m) => true,
    (model) => new SessionStorageStore({ key: `fallback-${model.$.name}` })
  );
  return (
    <StoreContext.Provider value={store}>
      <div className="App">
        <FinanceSimulationExplorer></FinanceSimulationExplorer>
      </div>
    </StoreContext.Provider>
  );
}
export default App;
