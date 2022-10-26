import { createModel } from "../extend";
import { Schedule, TransactionDetails } from "../finance-simulator";

export const RevenueModel = createModel({
  name: "revenue",
  indexes: ["memberId"],
  sample: (): {
    memberId: string;
    schedule: Partial<Schedule>;
    details: Partial<TransactionDetails>;
  } => {
    throw new Error("cannot be sampled");
  },
});
