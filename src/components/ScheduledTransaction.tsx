import { ScheduledTransaction as FinanceScheduledTransaction } from "../finance-simulator";

import { Schedule } from "./Schedule";
import { TransactionDetails } from "./TransactionDetails";

export function ScheduledTransaction(props: {
  stx: FinanceScheduledTransaction;
}) {
  return (
    <div style={{ margin: "10px" }}>
      <TransactionDetails details={props.stx.details}></TransactionDetails>
      <br />
      <Schedule schedule={props.stx.schedule}></Schedule>
    </div>
  );
}
