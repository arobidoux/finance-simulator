import { SyntheticEvent, useCallback, useContext, useState } from "react";
import { SimulationContext } from "../contexts/SimulationContext";
import {
  Account as FinanceAccount,
  ScheduledTransaction as FinanceScheduledTransaction,
  Schedule as FinanceSchedule,
} from "../finance-simulator";
import { Interest } from "./Interest";
import { ScheduledTransaction } from "./ScheduledTransaction";

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
  return (
    <div data-conf-tick={confTick}>
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
          simulation.addAccount(act);
          setConfTick(confTick + 1);
        }}
      ></NewAccountForm>
    </div>
  );
}

function NewAccountForm(props: {
  addAccount: { (account: Omit<FinanceAccount, "uuid">): void };
}) {
  const [type, setType] = useState("checking");
  const [label, setLabel] = useState("EOP");

  function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();
    props.addAccount({
      label,
      type,
      interest: null,
    });
  }
  return (
    <form onSubmit={handleSubmit}>
      <label>
        {" "}
        Label{" "}
        <input
          type="text"
          value={label}
          onChange={(ev) => setLabel(ev.target.value)}
        />
      </label>
      <label>
        {" "}
        Type{" "}
        <select value={type} onChange={(ev) => setType(ev.target.value)}>
          <option value="checking">Checking</option>
          <option value="saving">Saving</option>
          <option value="other">Other</option>
        </select>
      </label>
      <button type="submit">Add</button>
    </form>
  );
}

function NewScheduledTransaction(props: {
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
function EditSchedule(props: {
  setSchedule: { (schedule: FinanceSchedule): void };
  schedule?: FinanceSchedule;
}) {
  const [startAt, setStartAt] = useState(props.schedule?.startAt ?? new Date());
  const [endAt, setEndAt] = useState(
    props.schedule?.end && "at" in props.schedule?.end
      ? props.schedule.end.at
      : null
  );
  const [endAfterXOccurences, setEndAfterXOccurences] = useState(
    props.schedule?.end && "afterXOccurences" in props.schedule?.end
      ? props.schedule.end.afterXOccurences
      : null
  );
  const [period, setPeriod] = useState("once");
  const [every, setEvery] = useState("");

  const tryNotify = useCallback(() => {
    if (!["once", "days", "weeks", "months", "years"].includes(period)) {
      // throw new Error("invalid period");
      return;
    }
    const r: FinanceSchedule = {
      period: period as FinanceSchedule["period"],
      startAt,
      ...(every ? { every: parseInt(every) } : {}),
    };
    if (endAt) r.end = { at: endAt };
    else if (endAfterXOccurences)
      r.end = { afterXOccurences: endAfterXOccurences };

    props.setSchedule(r);
  }, [endAfterXOccurences, endAt, every, period, props, startAt]);

  return (
    <div>
      <label>
        {" "}
        Start At{" "}
        <DateTimePicker
          value={startAt}
          onChange={(value) => {
            value.setHours(12, 0, 0);
            setStartAt(value);
            tryNotify();
          }}
        ></DateTimePicker>
        <br />
        <label>
          Period{" "}
          <select
            value={period}
            onChange={(ev) => {
              setPeriod(ev.target.value);
              tryNotify();
            }}
          >
            <option value="once">Once</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="Years">Years</option>
          </select>
        </label>
        {period !== "once" && (
          <>
            <br />
            <label>
              Repeat every{" "}
              <input
                type="number"
                value={every}
                style={{ width: 45 }}
                min={0}
                onChange={(ev) => {
                  setEvery(ev.target.value);
                  tryNotify();
                }}
              ></input>{" "}
              {period}
            </label>
            <br />
            End At
            <OptionalDateTimePicker
              value={endAt}
              onChange={(value) => {
                if (value) value.setHours(12, 0, 0);
                setEndAt(value);
                tryNotify();
              }}
            ></OptionalDateTimePicker>{" "}
            or after{" "}
            <input
              type="number"
              value={endAfterXOccurences ?? ""}
              onChange={(ev) =>
                setEndAfterXOccurences(parseInt(ev.target.value))
              }
              style={{ width: 45 }}
              min={0}
            />{" "}
            occurences
          </>
        )}
      </label>
    </div>
  );
}

function DateTimePicker(props: {
  value: Date;
  onChange: { (value: Date): void };
}) {
  const d = props.value;
  const pad = (v: number) => ("0" + v).slice(-2);
  const str = `${d.getFullYear()}-${pad(d.getMonth())}-${pad(d.getDate())}`;
  return (
    <input
      type="date"
      value={str}
      onChange={(ev) => props.onChange(new Date(ev.target.value))}
    />
  );
}

function OptionalDateTimePicker(props: {
  value: Date | null;
  onChange: { (value: Date | null): void };
}) {
  const [isEnabled, setEnabled] = useState(props.value !== null);
  let str = "";
  if (props.value) {
    const d = props.value;
    const pad = (v: number) => ("0" + v).slice(-2);
    str = `${d.getFullYear()}-${pad(d.getMonth())}-${pad(d.getDate())}`;
  }

  return (
    <span>
      <input
        type="checkbox"
        checked={isEnabled}
        onChange={(ev) => {
          if (isEnabled) props.onChange(null);
          setEnabled(!isEnabled);
        }}
      />
      <input
        type="date"
        value={str}
        onChange={(ev) => props.onChange(new Date(ev.target.value))}
        disabled={!isEnabled}
      />
    </span>
  );
}
