import { createModel } from "../extend";
import { Schedule, TransactionDetails } from "../finance-simulator";

export const ScheduledTransactionModel = createModel({
  name: "scheduled-transaction",
  indexes: ["memberId"],
  sample: (): {
    memberId: string;
    schedule: Partial<Schedule>;
    details: Partial<TransactionDetails>;
  } => {
    throw new Error("cannot be sampled");
  },
  fromStore: (storedEntry: string) =>
    JSON.parse(storedEntry, (key, value) => {
      if (["at", "startAt"].includes(key)) return new Date(value);
      return value;
    }),
});
