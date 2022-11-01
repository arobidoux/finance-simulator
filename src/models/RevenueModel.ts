import { createModel } from "../extend";
import { Schedule, TransactionDetails } from "../finance-simulator";

interface RevenueInterface {
  memberId: string;
  schedule: Partial<Schedule>;
  details: Partial<TransactionDetails>;
}

export const RevenueModel = createModel({
  name: "revenue",
  indexes: ["memberId"],
  sample: (): RevenueInterface => {
    throw new Error("cannot be sampled");
  },
  fromStore: (storedEntry: string) =>
    JSON.parse(storedEntry, (key, value) => {
      if (["at", "startAt"].includes(key)) return new Date(value);
      return value;
    }),
});
