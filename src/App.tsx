import "./App.css";
import { useContext } from "react";
import { FinanceDashboard } from "./components/FinanceDashboard";
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
        <FinanceDashboard></FinanceDashboard>
      </div>
    </StoreContext.Provider>
  );
}
export default App;
