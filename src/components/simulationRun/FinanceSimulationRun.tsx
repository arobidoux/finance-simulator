import { useMemo, useState } from "react";

import { SimulationHelper } from "../../finance-simulator";
import { FinanceSnapshot } from "./FinanceSnapshot";

import { ScheduledTransaction } from "../shared/ScheduledTransaction";

import { Interest } from "../shared/Interest";

export function FinanceSimulationRun(props: {
  simulation: SimulationHelper;
  accountIds?: string[];
}) {
  const { simulation } = props;
  const [latestTick, setLatestTick] = useState(0);
  // simulation.runUntil((s) => s.getSimulationAge() > 25 * 365);

  const snapshot = useMemo(
    () => (
      <div data-tick={latestTick}>
        <FinanceSnapshot simulation={simulation}></FinanceSnapshot>

        {/* <FinanceSnapshot accountId={member.checkingAccountId}></FinanceSnapshot> */}
      </div>
    ),

    [simulation, latestTick]
  );

  return (
    <>
      <div style={{ width: "600px" }}>
        <h4>Simulation</h4>
        <StepBtn sim={simulation} setIt={setLatestTick} iter={7}></StepBtn>
        <StepBtn sim={simulation} setIt={setLatestTick} iter={30}></StepBtn>
        <StepBtn sim={simulation} setIt={setLatestTick} iter={180}></StepBtn>
        <StepBtn sim={simulation} setIt={setLatestTick} iter={365}></StepBtn>
        <StepBtn
          sim={simulation}
          setIt={setLatestTick}
          iter={365 * 5}
        ></StepBtn>
        <StepBtn
          sim={simulation}
          setIt={setLatestTick}
          iter={365 * 10}
        ></StepBtn>
        {snapshot}
        <SimulationDetails simulation={simulation}></SimulationDetails>
      </div>
      {/* <pre style={{ textAlign: "left" }}>
        {JSON.stringify(simulation, null, 4)}
      </pre> */}
    </>
  );
}

function StepBtn(opts: {
  sim: SimulationHelper;
  iter: number;
  setIt: { (v: number): void };
}) {
  const MAX_BATCH = 10;

  function tick(step: number) {
    const thisBatch = step > MAX_BATCH ? MAX_BATCH : step;

    opts.sim.runUntil((s, i) => i > thisBatch);
    opts.setIt(opts.sim.tick);
    const remaining = step - thisBatch;
    if (remaining > 0) {
      setTimeout(() => tick(remaining));
    }
  }
  return <button onClick={() => tick(opts.iter)}>{opts.iter} days</button>;
}

function SimulationDetails(props: { simulation: SimulationHelper }) {
  const { simulation } = props;

  const scheduled = simulation.$scheduledTransactions.map((stx) => (
    <ScheduledTransaction key={stx.uuid} stx={stx}></ScheduledTransaction>
  ));
  const accounts = simulation.$accounts.map((account) => (
    <div key={account.uuid}>
      {account.label} ({account.type}){" "}
      <Interest interest={account.interest}></Interest>
    </div>
  ));

  return (
    <details>
      <summary>Details</summary>
      <h4>Scheduled Transactions</h4>

      {scheduled}

      <h4>Accounts</h4>
      {accounts}
    </details>
  );
}
