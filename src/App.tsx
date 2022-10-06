import { FinanceSimulation } from "./components/FinanceSimulation";
import "./App.css";
import { useReducer } from "react";

export type SimulationsState = {
  sims: Record<string, { initialState?: string }>;
  current: string;
};

export type SimulationsAction =
  | {
      action: "fork";
      alias: string;
      forkFrom: string;
    }
  | { action: "new" | "select" | "delete"; alias: string };

function reduceSimulations(state: SimulationsState, action: SimulationsAction) {
  switch (action.action) {
    case "fork":
      return {
        ...state,
        sims: {
          ...state.sims,
          [action.alias]: { initialState: action.forkFrom },
        },
        current: action.alias,
      };
    case "new":
      return {
        ...state,
        sims: {
          ...state.sims,
          [action.alias]: {},
        },
        current: action.alias,
      };
    case "select":
      return {
        ...state,
        current: action.alias,
      };
    case "delete":
      if (!(action.alias in state.sims)) return state;

      const sims = { ...state.sims };
      let current = state.current;
      if (current === action.alias) {
        const keys = Object.keys(sims);
        const index = keys.findIndex((k) => k === action.alias);
        current =
          keys.length > 1 ? keys[index > 0 ? index - 1 : index + 1] : "";
      }

      delete sims[action.alias];
      return { ...state, sims, current };
    default:
      throw new Error("Invalid action");
  }
}

function App() {
  const [simState, dispatch] = useReducer(reduceSimulations, {
    sims: { default: {} },
    current: "default",
  });

  return (
    <div className="App">
      <button
        onClick={() => {
          const alias = prompt(
            "Please enter name for new simulation",
            new Date().toLocaleString()
          );
          if (alias) dispatch({ action: "new", alias });
        }}
      >
        Add new
      </button>
      {Object.keys(simState.sims).map((simAlias) => (
        <span key={simAlias} style={{ marginLeft: "5px", marginRight: "5px" }}>
          <button
            onClick={() => dispatch({ action: "select", alias: simAlias })}
          >
            {simAlias}
          </button>
          <button
            onClick={() => dispatch({ action: "delete", alias: simAlias })}
          >
            x
          </button>
        </span>
      ))}
      <hr />
      {simState.current && (
        <FinanceSimulation
          alias={simState.current}
          initialState={simState.sims[simState.current]?.initialState}
          dispatchSim={dispatch}
        ></FinanceSimulation>
      )}
    </div>
  );
}

export default App;
