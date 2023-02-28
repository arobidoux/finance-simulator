import { useCallback, useContext, useState } from "react";
import { PrecisionContext } from "../contexts/PrecisionContext";
import { SessionStorageStore, StoreContext } from "../extend";
import { SimulationHelper } from "../finance-simulator";
import { SimulationOptions } from "../finance-simulator/Simulation";
import {
  AccountModel,
  AccountType,
  LoanModel,
  LoanType,
  MemberModel,
  MemberType,
  RevenueModel,
  RevenueType,
  ScheduledTransactionModel,
  ScheduledTransactionType,
  SimulationModel,
} from "../models";
import { FinanceSimulationSettings } from "./FinanceSimulationSettings";
import { FinanceSimulationRun } from "./simulationRun/FinanceSimulationRun";

export function FinanceDashboard(opts: {}) {
  const storeContext = useContext(StoreContext);
  const precisionContext = useContext(PrecisionContext);
  const store = storeContext.specialize(
    (m) => true,
    (model) => new SessionStorageStore({ key: `dashboard-${model.$.name}` })
  );

  const [simulation, setSimulation] = useState<SimulationHelper | null>(null);

  const launchSimulation = useCallback(() => {
    return Promise.all([
      store
        .forModel(AccountModel)
        .list()
        .then((r) => r.entries),
      store
        .forModel(LoanModel)
        .list()
        .then((r) => r.entries),
      store
        .forModel(MemberModel)
        .list()
        .then((r) => r.entries),
      store
        .forModel(RevenueModel)
        .list()
        .then((r) => r.entries),
      store
        .forModel(ScheduledTransactionModel)
        .list()
        .then((r) => r.entries),
      store.forModel(SimulationModel).get("1"),
    ]).then(
      ([
        accounts,
        loans,
        members,
        revenues,
        scheduledTransactions,
        simulationMeta,
      ]) => {
        const { sim } = prepSimulation(
          {
            accounts,
            loans,
            members,
            revenues,
            scheduledTransactions,
          },
          {
            interestRatePrecision: precisionContext.interestRate,
            startedOn: simulationMeta?.startedOn,
          }
        );
        setSimulation(sim);
      }
    );
  }, [store, precisionContext]);

  return (
    <StoreContext.Provider value={store}>
      <div style={{ textAlign: "left", display: "flex", padding: "10px" }}>
        <div style={{ flexGrow: 1 }}>
          {simulation && (
            <>
              <button onClick={() => setSimulation(null)}>Stop</button>
              <FinanceSimulationRun
                simulation={simulation}
              ></FinanceSimulationRun>
            </>
          )}
          {!simulation && (
            <>
              <button onClick={launchSimulation}>Run</button>
              <h4>Settings</h4>

              <FinanceSimulationSettings></FinanceSimulationSettings>
            </>
          )}
        </div>
      </div>
    </StoreContext.Provider>
  );
}

interface ListEntry<T> {
  id: string;
  data: T;
}

function prepSimulation(
  $: {
    members: Array<ListEntry<MemberType>>;
    accounts: Array<ListEntry<AccountType>>;
    loans: Array<ListEntry<LoanType>>;
    revenues: Array<ListEntry<RevenueType>>;
    scheduledTransactions: Array<ListEntry<ScheduledTransactionType>>;
  },
  opts?: SimulationOptions
): {
  sim: SimulationHelper;
  dicts: {
    members: Record<string, string>;
    accounts: Record<string, string>;
    loans: Record<string, string>;
    revenues: Record<string, string>;
    scheduledTransactions: Record<string, string>;
  };
} {
  const sim = new SimulationHelper(opts);

  const members = reduceDict($.members, ({ id, data }) => [
    id,
    sim.addMember(data).uuid,
  ]);

  const accounts = reduceDict($.accounts, ({ id, data }) => [
    id,
    sim.addAccount(data),
  ]);

  const loans = reduceDict(
    $.loans,
    ({ id, data: { accountId, payBack, ...loan } }) => [
      id,
      sim.addLoan({
        toAccountId: accounts[accountId],
        ...loan,
        ...(payBack
          ? {
              payBack: {
                ...payBack,
                fromAccountId: accounts[accountId],
                schedule: {
                  ...payBack.schedule,
                  period: payBack.schedule.period ?? "once",
                  startAt: payBack.schedule.startAt ?? loan.startAt,
                },
              },
            }
          : {}),
      }),
    ]
  );

  const revenues = reduceDict(
    $.revenues,
    ({ id, data: { details, schedule } }) => {
      if (
        !details.toAccountId ||
        !details.label ||
        !details.amount ||
        !schedule
      ) {
        throw new Error("invalid Revenue - " + id);
      }
      return [
        id,
        sim.addSalary({
          toAccountId: accounts[details.toAccountId],
          amount: details.amount,
          label: details.label,
          schedule: {
            ...schedule,
            startAt: schedule.startAt ?? new Date(),
            period: schedule.period ?? "once",
          },
        }),
      ];
    }
  );

  const scheduledTransactions = reduceDict(
    $.scheduledTransactions,
    ({ id, data }) => {
      const { details, schedule } = data;
      if (
        !details.fromAccountId ||
        !details.toAccountId ||
        !details.label ||
        !details.amount ||
        !schedule
      ) {
        throw new Error(
          "invalid Scheduled Transaction - " + id + ": " + JSON.stringify(data)
        );
      }
      return [
        id,
        sim.addScheduledTransaction({
          schedule: {
            ...schedule,
            period: schedule.period ?? "once",
            startAt: schedule.startAt ?? new Date(),
          },
          details: {
            label: details.label,
            amount: details.amount,
            type: details.type ?? "",
            fromAccountId: accounts[details.fromAccountId],
            toAccountId: accounts[details.toAccountId],
          },
        }),
      ];
    }
  );
  return {
    sim,
    dicts: {
      accounts,
      loans,
      members,
      revenues,
      scheduledTransactions,
    },
  };
}

function reduceDict<T, U>(arr: Array<T>, handle: { (entry: T): [string, U] }) {
  return arr.reduce(...curryDictionaryReducer(handle));
}

function curryDictionaryReducer<T, U>(handle: {
  (entry: T): [string, U];
}): [
  { (acc: { [key: string]: U }, entry: T): { [key: string]: U } },
  { [key: string]: U }
] {
  const org: { [key: string]: U } = {};

  return [
    (acc: { [key: string]: U }, entry: T): { [key: string]: U } => {
      const values = handle(entry);
      acc[values[0]] = values[1];
      return acc;
    },
    org,
  ];
}
