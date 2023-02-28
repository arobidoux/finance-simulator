import { createModel, ModelTypeOf } from "../extend";
import { Schedule, TransactionDetails } from "../finance-simulator";

interface RevenueInterface {
  memberId: string;
  schedule: Partial<Schedule>;
  details: Partial<TransactionDetails>;
}

export const RevenueModel = createModel<RevenueInterface>({
  name: "revenue",
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

export type RevenueType = ModelTypeOf<typeof RevenueModel>;
