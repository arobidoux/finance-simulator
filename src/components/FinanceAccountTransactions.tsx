import { useState } from "react";
import { Transaction } from "../finance-simulator";
import { Amount } from "./Amount";

export function FinanceAccountTransactions(props: {
  transactions: Array<Transaction>;
  accountId: string;
  colapseSimilar?: boolean;
}) {
  const { accountId, transactions } = props;
  const [colapseSimilar, setColapseSimilar] = useState(
    props.colapseSimilar ?? false
  );

  let balance = 0;
  let trx = transactions;
  if (colapseSimilar)
    trx = transactions.reduce<{
      txs: Array<Transaction>;
      lastTx: Transaction | null;
    }>(
      (acc, tx) => {
        if (
          acc.lastTx &&
          acc.lastTx.type === tx.type &&
          acc.lastTx.fromAccountId === tx.fromAccountId &&
          acc.lastTx.toAccountId === tx.toAccountId
        ) {
          acc.lastTx.amount += tx.amount;
          acc.lastTx.occuredOn = tx.occuredOn;
          acc.lastTx.uuid = tx.uuid;
        } else {
          acc.txs.push((acc.lastTx = { ...tx }));
        }

        return acc;
      },
      { txs: [], lastTx: null }
    ).txs;

  const txrowsWork = trx.reduce<{
    rows: Array<any>;
    lastTx: Transaction | null;
  }>(
    (acc, tx) => {
      if (
        acc.lastTx &&
        acc.lastTx.occuredOn.getMonth() !== tx.occuredOn.getMonth()
      ) {
        acc.rows.push(
          <tr
            key={`month-${acc.lastTx.occuredOn.getFullYear()}-${acc.lastTx.occuredOn.getMonth()}`}
          >
            <th colSpan={4}>
              {acc.lastTx.occuredOn.toLocaleString("default", {
                month: "long",
              })}{" "}
              {acc.lastTx.occuredOn.getFullYear()}
            </th>
          </tr>
        );
      }
      const isCredit = tx.fromAccountId === accountId;
      const amountOffset = isCredit ? -1 * tx.amount : tx.amount;
      balance += amountOffset;
      acc.rows.push(
        <TransactionRow
          key={tx.uuid}
          amount={amountOffset}
          balance={balance}
          tx={tx}
        ></TransactionRow>
      );
      acc.lastTx = tx;
      return acc;
    },
    { rows: [], lastTx: null }
  );

  if (txrowsWork.lastTx)
    txrowsWork.rows.push(
      <tr
        key={`month-${txrowsWork.lastTx.occuredOn.getFullYear()}-${txrowsWork.lastTx.occuredOn.getMonth()}`}
      >
        <th colSpan={4}>
          {txrowsWork.lastTx.occuredOn.toLocaleString("default", {
            month: "long",
          })}{" "}
          {txrowsWork.lastTx.occuredOn.getFullYear()}
        </th>
      </tr>
    );

  const txrows = txrowsWork.rows.reverse();

  return (
    <div>
      <h3>Transactions</h3>
      <label>
        {" "}
        Collapse Similar{" "}
        <input
          type="checkbox"
          onChange={() => setColapseSimilar(!colapseSimilar)}
          checked={colapseSimilar}
        ></input>
      </label>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Label</th>
            <th>Type</th>
            <th>Operation</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>{txrows}</tbody>
      </table>
    </div>
  );
}

function TransactionRow(opts: {
  tx: Transaction;
  amount: number;
  balance: number;
}) {
  const { tx, amount, balance } = opts;

  return (
    <tr>
      <td>{tx.occuredOn.toLocaleDateString()}</td>
      <td>{tx.label}</td>
      <td>{tx.type}</td>
      <td>
        <Amount amount={amount}></Amount>
      </td>
      <td>
        <Amount amount={balance}></Amount>
      </td>
    </tr>
  );
}
