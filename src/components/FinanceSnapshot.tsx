import { useMemo } from "react";
import { SimulationHelper } from "../finance-simulator";
import { Amount } from "./Amount";
import { FinanceAccountTransactions } from "./FinanceAccountTransactions";
import { Interest } from "./Interest";

export function FinanceSnapshot(props: {
  simulation: SimulationHelper;
  today?: Date;
  accountId?: string;
}) {
  const { accountId, today, simulation } = props;
  const tick = simulation.tick;

  const result = useMemo(() => {
    if (accountId) {
      const details = simulation.getAccountDetails(accountId, {
        until: today,
      });
      const meta = simulation.getAccountMeta(accountId);

      const loans = simulation.loans.filter(
        (loan) => loan.toAccountId === accountId
      );

      const loanDetails =
        loans.length === 0 ? (
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
      return (
        <div>
          <h4 data-tick={tick}>
            {meta.label} ({meta.type})
          </h4>
          Balance: <Amount amount={details.balance}></Amount> <br />
          Interest: <Interest interest={meta.interest}></Interest>
          <br />
          <FinanceAccountTransactions
            accountId={accountId}
            transactions={details.transactions}
          ></FinanceAccountTransactions>
          <h4>Loans</h4>
          {loanDetails}
        </div>
      );
    } else {
      const details = simulation.getAccountSummaries({ until: today });
      return <div>{JSON.stringify(details)}</div>;
    }
  }, [tick, simulation, today, accountId]);

  return <div>{result}</div>;
}
