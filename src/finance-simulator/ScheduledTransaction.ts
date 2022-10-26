import { Schedule } from "./Schedule";
import { TransactionDetails } from "./TransactionDetails";

export interface ScheduledTransaction {
  uuid: string;
  schedule: Schedule;
  details: TransactionDetails;
}
