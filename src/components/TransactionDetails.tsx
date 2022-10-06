import { useContext } from "react";
import { TransactionDetails as FinanceTransactionDetails } from "../finance-simulator";
import { Amount } from "./Amount";
import { AccountMetaContext } from "./FinanceDashboard";

export function TransactionDetails(props: {
  details: FinanceTransactionDetails;
}) {
  const context = useContext(AccountMetaContext);

  return (
    <span>
      <b>Pay </b>
      <Amount amount={props.details.amount}></Amount> <b>from:</b>{" "}
      {context.resolve.format(props.details.fromAccountId)} <b>to:</b>{" "}
      {context.resolve.format(props.details.toAccountId)}
      <br /> <b>type:</b> {props.details.type} <b>label:</b>{" "}
      {props.details.label}
    </span>
  );
}
