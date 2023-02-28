import { createModel, ModelTypeOf } from "../extend";
import { Schedule, TransactionDetails } from "../finance-simulator";

export const ScheduledTransactionModel = createModel<{
  memberId: string;
  schedule: Partial<Schedule>;
  details: Partial<TransactionDetails>;
}>({
  name: "scheduled-transaction",
  indexes: ["memberId"],
  sample: () => {
    throw new Error("cannot be sampled");
  },
  fromStore: (storedEntry: string) =>
    JSON.parse(storedEntry, (key, value) => {
      if (["at", "startAt"].includes(key)) return new Date(value);
      return value;
    }),
});

export type ScheduledTransactionType = ModelTypeOf<
  typeof ScheduledTransactionModel
>;
