import { TransactionDetails } from "./TransactionDetails";

export interface Transaction extends TransactionDetails {
  uuid: string;
  occuredOn: Date;
}
