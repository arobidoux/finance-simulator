import { useReducer } from "react";
import { FinanceSimulation } from "./FinanceSimulation";

export function FinanceSimulationExplorer() {
  const [simState, dispatch] = useReducer(reduceSimulations, undefined, () => {
    const storedSims = localStorage.getItem("finance-simulations");
    const sims = storedSims ? JSON.parse(storedSims) : [];
    if (sims.length) {
      return { sims, current: sims[0].alias };
    }
    return {
      sims: [{ alias: "default", persist: false }],
      current: "default",
    };
  });

  if (simState) {
    const toPersist = simState.sims.filter((s) => s.persist);
    localStorage.setItem("finance-simulations", JSON.stringify(toPersist));
  }

  return (
    <div>
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
      {simState.sims.map((sim) => (
        <span key={sim.alias} style={{ marginLeft: "5px", marginRight: "5px" }}>
          <button
            onClick={() => dispatch({ action: "select", alias: sim.alias })}
          >
            {sim.alias}
            {sim.persist && "✓"}
          </button>
          <button
            onClick={() => dispatch({ action: "delete", alias: sim.alias })}
          >
            x
          </button>
        </span>
      ))}
      <hr />
      {simState.current && (
        <FinanceSimulation
          alias={simState.current}
          initialState={
            simState.sims.find((s) => s.alias === simState.current)
              ?.initialState
          }
          dispatchSim={dispatch}
        ></FinanceSimulation>
      )}
    </div>
  );
}

export type SimulationsState = {
  sims: Array<{
    alias: string;
    persist: boolean;
    initialState?: string;
  }>;
  current: string;
};

export type SimulationsAction =
  | {
      action: "fork" | "persist" | "save";
      alias: string;
      state: string;
    }
  | { action: "new" | "select" | "delete"; alias: string };

function reduceSimulations(
  state: SimulationsState,
  action: SimulationsAction
): SimulationsState {
  switch (action.action) {
    case "save":
    case "fork": {
      const sims = [...state.sims];
      const index = sims.findIndex((sim) => sim.alias === action.alias);
      const newSim = {
        alias: action.alias,
        initialState: action.state,
        persist: false,
      };
      if (index !== -1) {
        if (sims[index].persist) newSim.persist = true;
        sims.splice(index, 1, newSim);
      } else sims.push(newSim);
      return {
        ...state,
        sims,
        current: action.alias,
      };
    }
    case "persist": {
      const sims = [...state.sims];
      const index = sims.findIndex((sim) => sim.alias === action.alias);
      const newSim = {
        alias: action.alias,
        initialState: action.state,
        persist: true,
      };
      if (index !== -1) sims.splice(index, 1, newSim);
      else sims.push(newSim);
      return {
        ...state,
        sims,
      };
    }

    case "new":
      return {
        ...state,
        sims: [...state.sims, { alias: action.alias, persist: false }],
        current: action.alias,
      };
    case "select":
      return {
        ...state,
        current: action.alias,
      };
    case "delete":
      const index = state.sims.findIndex((sim) => sim.alias === action.alias);
      if (index === -1) return state;

      let current = state.current;
      const sims = [...state.sims];

      if (current === action.alias) {
        current =
          sims.length > 1 ? sims[index > 0 ? index - 1 : index + 1].alias : "";
      }
      sims.splice(index, 1);
      return { ...state, sims, current };
    default:
      throw new Error("Invalid action");
  }
}
