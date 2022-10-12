import { useContext, useMemo, useState } from "react";
import { SimulationContext } from "../contexts/SimulationContext";
import { SimulationHelper } from "../finance-simulator";

import { Amount } from "./Amount";
import { FinanceAccountTransactions } from "./FinanceAccountTransactions";
import { Interest } from "./Interest";

export function FinanceSnapshot(props: { today?: Date; accountId?: string }) {
  const { accountId, today } = props;
  const { simulation } = useContext(SimulationContext);
  const [tab, setTab] = useState("all");
  const tick = simulation.tick;

  const result = useMemo(() => {
    if (accountId) {
      const details = simulation.getAccountDetails(accountId, {
        until: today,
      });
      const meta = simulation.getAccountMeta(accountId);

      return (
        <div data-tick={tick}>
          <button onClick={() => setTab("all")}>
            All{tab === "all" && "✓"}
          </button>
          <button onClick={() => setTab("account")}>
            {" "}
            Account {tab === "account" && "✓"}
          </button>
          <button onClick={() => setTab("loans")}>
            Loans{tab === "loans" && "✓"}
          </button>
          {["all", "account"].includes(tab) && (
            <>
              <h4>
                {meta.label} ({meta.type})
              </h4>
              Balance: <Amount amount={details.balance}></Amount> <br />
              Interest: <Interest interest={meta.interest}></Interest>
              <br />
              <FinanceAccountTransactions
                accountId={accountId}
                transactions={details.transactions}
              ></FinanceAccountTransactions>
            </>
          )}
          {["all", "loans"].includes(tab) && (
            <>
              <h4>Loans</h4>
              <Loans simulation={simulation} accountId={accountId}></Loans>
            </>
          )}
        </div>
      );
    } else {
      const details = simulation.getAccountSummaries({ until: today });
      return <div>{JSON.stringify(details)}</div>;
    }
  }, [tick, simulation, today, accountId, tab]);

  return <div>{result}</div>;
}

function Loans(props: { simulation: SimulationHelper; accountId: string }) {
  const { simulation, accountId } = props;
  const loans = simulation.loans.filter(
    (loan) => loan.toAccountId === accountId
  );

  return loans.length === 0 ? (
    <p>No Loans</p>
  ) : (
    <div>
      {loans.map((loan) => {
        const details = simulation.getAccountDetails(loan.loanAccountId);
        const meta = simulation.getAccountMeta(loan.loanAccountId);
        return (
          <div key={"loan-" + loan.loanAccountId}>
            <h4>
              {loan.label} ({meta.type})
            </h4>
            Balance: <Amount amount={details.balance}></Amount> <br />
            Interest: <Interest interest={meta.interest}></Interest>
            <FinanceAccountTransactions
              accountId={loan.loanAccountId}
              transactions={details.transactions}
              colapseSimilar={true}
            ></FinanceAccountTransactions>
          </div>
        );
      })}
    </div>
  );
}
