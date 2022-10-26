import { useContext, useMemo, useState } from "react";
import { SimulationContext } from "../contexts/SimulationContext";
import { SimulationHelper } from "../finance-simulator";
import { FinanceSnapshot } from "./FinanceSnapshot";
import { ScheduledTransaction as FinanceScheduledTransaction } from "../finance-simulator";
import { ScheduledTransaction } from "./ScheduledTransaction";

import { Interest } from "./Interest";
import { NewScheduledTransaction } from "./NewScheduledTransaction";
import { NewAccountForm } from "./NewAccountForm";

export function FinanceSimulationRun() {
  const [latestTick, setLatestTick] = useState(0);
  // simulation.runUntil((s) => s.getSimulationAge() > 25 * 365);

  const snapshot = useMemo(
    () => (
      <div data-tick={latestTick}>
        <FinanceSnapshot></FinanceSnapshot>
        {/* <FinanceSnapshot accountId={member.checkingAccountId}></FinanceSnapshot> */}
      </div>
    ),

    [latestTick]
  );

  return (
    <>
      Finance Dimulation Run TODO
      {/* <div style={{ width: "600px" }}>
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
      </div> */}
      {/* <pre style={{ textAlign: "left" }}>
        {JSON.stringify(opts.simulation, null, 4)}
      </pre>
      <pre style={{ textAlign: "left" }}>{JSON.stringify(member, null, 4)}</pre> */}
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

function SimulationDetails() {
  const { simulation } = useContext(SimulationContext);

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
      <NewScheduledTransaction
        newEntry={(stx: Omit<FinanceScheduledTransaction, "uuid">) => {
          throw new Error("not handled");
          //   simulation.addScheduledTransaction(stx);
          //   setConfTick(confTick + 1);
        }}
        accounts={simulation.$accounts.map((act) => {
          return { label: act.label, uuid: act.uuid };
        })}
      ></NewScheduledTransaction>
      <h4>Accounts</h4>
      {accounts}
      <NewAccountForm
        addAccount={(act) => {
          throw new Error("not handled");
          //   const uuid = simulation.addAccount(act);
          //   setConfTick(confTick + 1);
          //   return uuid;
        }}
      ></NewAccountForm>
    </details>
  );
}
