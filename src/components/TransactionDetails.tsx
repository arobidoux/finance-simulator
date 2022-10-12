import { useContext } from "react";
import { TransactionDetails as FinanceTransactionDetails } from "../finance-simulator";
import { Amount } from "./Amount";
import { SimulationContext } from "../contexts/SimulationContext";
import { AccountName } from "./AccountName";

export function TransactionDetails(props: {
  details: FinanceTransactionDetails;
}) {
  const { simulation } = useContext(SimulationContext);

  return (
    <span>
      <b>Pay </b>
      <Amount amount={props.details.amount}></Amount> <b>from:</b>{" "}
      <AccountName
        account={simulation.getAccountMeta(props.details.fromAccountId)}
      ></AccountName>{" "}
      <b>to:</b>{" "}
      <AccountName
        account={simulation.getAccountMeta(props.details.toAccountId)}
      ></AccountName>
      <br /> <b>type:</b> {props.details.type} <b>label:</b>{" "}
      {props.details.label}
    </span>
  );
}
