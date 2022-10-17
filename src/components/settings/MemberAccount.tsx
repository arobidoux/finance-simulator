import {
  createModel,
  ModelTypeOf,
  useModel,
  useModelOptions,
} from "../../extend";
import { Account as FinanceAccount } from "../../finance-simulator";
import { ModelActionButtons } from "./ModelActionButtons";

export const accountModel = createModel({
  name: "account",
  indexes: ["memberId"],
  sample: (): { memberId: string } & Omit<FinanceAccount, "uuid"> => {
    return {
      memberId: "mem-123",
      label: "EOP",
      type: "checking",
      interest: null,
    };
  },
});
export function MemberAccount(props: {
  useModelOptions?: useModelOptions<ModelTypeOf<typeof accountModel>>;
}) {
  const {
    entry: account,
    update,
    ...$account
  } = useModel(accountModel, props.useModelOptions);

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        console.log("saving account");
      }}
    >
      <label>
        {" "}
        Label{" "}
        <input
          type="text"
          value={account?.label ?? ""}
          onChange={(ev) => update("label", ev.target.value)}
        />
      </label>
      <label>
        {" "}
        Type{" "}
        <select
          value={account?.type ?? ""}
          onChange={(ev) => update("type", ev.target.value)}
        >
          <option value="checking">Checking</option>
          <option value="saving">Saving</option>
          <option value="other">Other</option>
        </select>
      </label>

      <ModelActionButtons $model={$account}></ModelActionButtons>
    </form>
  );
}
