import { createModel } from "../extend";
import { Interest, Schedule } from "../finance-simulator";

interface LoanInterface {
  memberId: string;
  label: string;
  interest: Interest;
  startAmount: number;
  accountId: string;
  startAt: Date;
  payBack?: {
    amount: number;
    schedule: Partial<Schedule>;
  };
}

export const LoanModel = createModel<LoanInterface>({
  name: "loan",
  indexes: ["memberId"],
  sample: (): LoanInterface => {
    throw new Error("cannot be sampled");
  },
  fromStore: (storedEntry: string) =>
    JSON.parse(storedEntry, (key, value) => {
      if (["at", "startAt"].includes(key)) return new Date(value);
      return value;
    }),
});
