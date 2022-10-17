import { SyntheticEvent, useState } from "react";
import {
  ScheduledTransaction as FinanceScheduledTransaction,
  Schedule as FinanceSchedule,
} from "../finance-simulator";
import { EditSchedule } from "./parts/EditSchedule";

export function NewScheduledTransaction(props: {
  newEntry: { (stx: Omit<FinanceScheduledTransaction, "uuid">): void };
  accounts: Array<{ label: string; uuid: string }>;
}) {
  const [schedule, setSchedule] = useState({
    period: "once",
    startAt: new Date(),
  } as FinanceSchedule);
  const [amount, setAmount] = useState(0);
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [type, setType] = useState("");
  const [label, setLabel] = useState("");

  function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();
    if (!fromAccountId) throw new Error("please select fromAcountId");
    if (!toAccountId) throw new Error("please select toAccountId");

    props.newEntry({
      createdOn: new Date(),
      schedule,
      details: {
        amount,
        fromAccountId,
        toAccountId,
        type,
        label,
      },
    });
  }

  const accounts = props.accounts.map((act) => (
    <option key={act.uuid} value={act.uuid}>
      {act.label}
    </option>
  ));
  return (
    <form onSubmit={handleSubmit}>
      <label>
        From{" "}
        <select
          value={fromAccountId}
          onChange={(ev) => setFromAccountId(ev.target.value)}
        >
          {accounts}
        </select>
      </label>{" "}
      <br />
      <label>
        To{" "}
        <select
          value={toAccountId}
          onChange={(ev) => setToAccountId(ev.target.value)}
        >
          {accounts}
        </select>
      </label>{" "}
      <br />
      <label>
        Amount{" "}
        <input
          type="number"
          value={amount}
          onChange={(ev) => setAmount(parseInt(ev.target.value))}
        />{" "}
      </label>
      <br />
      <label>
        Type{" "}
        <input
          type="text"
          value={type}
          onChange={(ev) => setType(ev.target.value)}
        />{" "}
      </label>
      <br />
      <label>
        Label{" "}
        <input
          type="text"
          value={label}
          onChange={(ev) => setLabel(ev.target.value)}
        />{" "}
      </label>
      <EditSchedule
        setSchedule={setSchedule}
        schedule={schedule}
      ></EditSchedule>
      <button type="submit">Save</button>
    </form>
  );
}
