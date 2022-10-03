import { Schedule } from "./Schedule";
import { TransactionDetails } from "./TransactionDetails";

export interface ScheduledTransaction {
  uuid: string;
  createdOn: Date;
  schedule: Schedule;
  details: TransactionDetails;
}
