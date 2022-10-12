import { Dispatch, useContext, useMemo } from "react";
import { SimulationsAction } from "./FinanceSimulationExplorer";
import { SimulationContext } from "../contexts/SimulationContext";
import { SimulationHelper } from "../finance-simulator";
import { FinanceDashboard } from "./FinanceDashboard";
import { PrecisionContext } from "../contexts/PrecisionContext";

export function FinanceSimulation(props: {
  alias?: string;
  initialState?: string;
  dispatchSim: Dispatch<SimulationsAction>;
}) {
  const precisionContext = useContext(PrecisionContext);
  const simulation: SimulationHelper = useMemo(
    () =>
      new SimulationHelper(
        props.initialState ?? {
          interestRatePrecision: precisionContext.interestRate,
        }
      ),
    [props.initialState, precisionContext]
  );
  const alias = props.alias ?? "default";

  const dashboard = useMemo(() => {
    if (simulation)
      return (
        <SimulationContext.Provider
          value={{
            simulation,
            save: () =>
              props.dispatchSim({
                action: "save",
                alias,
                state: JSON.stringify(simulation),
              }),
          }}
        >
          <FinanceDashboard></FinanceDashboard>
        </SimulationContext.Provider>
      );
    return <div>loading...</div>;
  }, [simulation, props, alias]);

  return (
    <div>
      <h2>
        {props.alias ?? "Default Simulation"}{" "}
        <button
          onClick={() => {
            const alias = prompt(
              "Please enter name for forked simulation",
              "copy of " + (props.alias ?? "default")
            );
            if (alias)
              props.dispatchSim({
                action: "fork",
                alias,
                state: JSON.stringify(simulation),
              });
          }}
        >
          Fork
        </button>
        <button
          onClick={() => {
            props.dispatchSim({
              action: "persist",
              alias: props.alias ?? "default",
              state: JSON.stringify(simulation),
            });
          }}
        >
          Persist
        </button>
      </h2>
      {dashboard}
    </div>
  );
}
