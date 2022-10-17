import { useContext, useState } from "react";
import { SimulationContext } from "../contexts/SimulationContext";
import { ScheduledTransaction as FinanceScheduledTransaction } from "../finance-simulator";
import { Interest } from "./Interest";
import { ScheduledTransaction } from "./ScheduledTransaction";
import { memberModel, Member } from "./settings/Member";
import { ModelList, ModelModalWithSelector } from "../extend";
import { NewScheduledTransaction } from "./NewScheduledTransaction";
import { NewAccountForm } from "./NewAccountForm";
import { accountModel, MemberAccount } from "./settings/MemberAccount";

export function FinanceSimulationSettings(props: {}) {
  const { simulation } = useContext(SimulationContext);
  const [confTick, setConfTick] = useState(0);

  const scheduled = simulation.$scheduledTransactions.map((stx) => (
    <ScheduledTransaction key={stx.uuid} stx={stx}></ScheduledTransaction>
  ));
  const accounts = simulation.$accounts.map((account) => (
    <div key={account.uuid}>
      {account.label} ({account.type}){" "}
      <Interest interest={account.interest}></Interest>
    </div>
  ));

  const members = (
    <ModelModalWithSelector
      model={memberModel}
      renderSelector={({ rows, selectId, currentSelectedId }) => (
        <>
          {rows}
          <button onClick={() => selectId(null)}>+</button>
        </>
      )}
      renderRow={(member, id, { select }) => (
        <button key={id} onClick={select}>
          {member.name}
        </button>
      )}
      renderModal={(useModelOptions) => (
        <Member useModelOptions={useModelOptions}></Member>
      )}
    ></ModelModalWithSelector>
  );
  return (
    <div data-conf-tick={confTick}>
      <h4>Members</h4>
      {members}
      <hr />

      <details>
        <summary>Details</summary>
        <h4>Scheduled Transactions</h4>

        {scheduled}
        <NewScheduledTransaction
          newEntry={(stx: Omit<FinanceScheduledTransaction, "uuid">) => {
            simulation.addScheduledTransaction(stx);
            setConfTick(confTick + 1);
          }}
          accounts={simulation.$accounts.map((act) => {
            return { label: act.label, uuid: act.uuid };
          })}
        ></NewScheduledTransaction>
        <h4>Accounts</h4>
        {accounts}
        <NewAccountForm
          addAccount={(act) => {
            const uuid = simulation.addAccount(act);
            setConfTick(confTick + 1);
            return uuid;
          }}
        ></NewAccountForm>
      </details>
    </div>
  );
}
