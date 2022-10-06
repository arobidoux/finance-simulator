import { Dispatch, useMemo } from "react";
import { SimulationsAction } from "../App";
import { useSimulation } from "../hooks/useSimulation";
import { FinanceDashboard } from "./FinanceDashboard";

export function FinanceSimulation(props: {
  alias?: string;
  initialState?: string;
  dispatchSim: Dispatch<SimulationsAction>;
}) {
  const simulation = useSimulation({
    alias: props.alias ?? "default",
    prevState: props.initialState ?? undefined,
  });

  const dashboard = useMemo(() => {
    if (simulation)
      return <FinanceDashboard simulation={simulation}></FinanceDashboard>;
    return <div>loading...</div>;
  }, [simulation]);

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
                forkFrom: JSON.stringify(simulation),
              });
          }}
        >
          Fork
        </button>
      </h2>
      {dashboard}
    </div>
  );
}
