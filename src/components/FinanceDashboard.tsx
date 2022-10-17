import { useContext, useMemo, useState } from "react";
// import { PrecisionContext } from "../contexts/PrecisionContext";
import { SimulationContext } from "../contexts/SimulationContext";
import { SimulationHelper } from "../finance-simulator";

import { FinanceSimulationSettings } from "./FinanceSimulationSettings";
import { FinanceSnapshot } from "./FinanceSnapshot";

export function FinanceDashboard(opts: {}) {
  const { simulation } = useContext(SimulationContext);
  // const precisionContext = useContext(PrecisionContext);

  // used to be able to force a react redraw when the simulation object has
  // nested changes
  const [latestTick, setLatestTick] = useState(0);
  // simulation.runUntil((s) => s.getSimulationAge() > 25 * 365);

  // const member = simulation.addMember(
  //   { name: "John Smith" },
  //   {
  //     key: "member1",
  //     init: (m) => {
  //       const now = new Date();
  //       simulation.addSalary({
  //         amount: 330000,
  //         label: "Pay",
  //         schedule: {
  //           period: "weeks",
  //           startAt: now,
  //           every: 2,
  //         },
  //         toAccountId: m.checkingAccountId,
  //       });
  //       simulation.addLoan({
  //         interest: {
  //           // Use a yearly interest rate, but applied daily
  //           rate: Math.ceil((5.2 * precisionContext.interestRate) / 365),
  //           schedule: { period: "days", startAt: now },
  //         },
  //         label: "Mortgage",
  //         startAmount: 46000000,
  //         toAccountId: m.checkingAccountId,
  //         payBack: {
  //           amount: 127500 * 2,
  //           schedule: {
  //             period: "months",
  //             every: 1,
  //             startAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
  //           },
  //         },
  //       });

  //       simulation.addScheduledTransaction({
  //         createdOn: new Date(),
  //         details: {
  //           amount: 35000,
  //           fromAccountId: m.checkingAccountId,
  //           toAccountId: "grocery",
  //           label: "Groceries",
  //           type: "expenses",
  //         },
  //         schedule: {
  //           period: "weeks",
  //           every: 1,
  //           startAt: new Date(),
  //         },
  //       });

  //       simulation.addScheduledTransaction({
  //         createdOn: new Date(),
  //         details: {
  //           amount: 46000000,
  //           fromAccountId: m.checkingAccountId,
  //           toAccountId: "seller",
  //           label: "Other",
  //           type: "big purchase",
  //         },
  //         schedule: {
  //           period: "days",
  //           end: { afterXOccurences: 1 },
  //           startAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
  //         },
  //       });
  //       simulation.runUntil((s, i) => i > 5);
  //     },
  //   }
  // );

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
    <div style={{ textAlign: "left", display: "flex", padding: "10px" }}>
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
      <div style={{ flexGrow: 1 }}>
        <h4>Settings</h4>
        <FinanceSimulationSettings></FinanceSimulationSettings>
      </div>
      {/* <pre style={{ textAlign: "left" }}>
        {JSON.stringify(opts.simulation, null, 4)}
      </pre>
      <pre style={{ textAlign: "left" }}>{JSON.stringify(member, null, 4)}</pre> */}
    </div>
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
