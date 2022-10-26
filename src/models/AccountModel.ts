import { createModel } from "../extend";
import { Account } from "../finance-simulator";

export const AccountModel = createModel({
  name: "account",
  indexes: ["memberId"],
  sample: (): { memberId: string } & Omit<Account, "uuid"> => {
    return {
      memberId: "mem-123",
      label: "EOP",
      type: "checking",
      interest: null,
    };
  },
});
