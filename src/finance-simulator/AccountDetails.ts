import { AccountSummary } from "./AccountSummary";
import { Transaction } from "./Transaction";

export interface AccountDetails extends AccountSummary {
  transactions: Array<Transaction>;
}
