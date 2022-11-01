import { ModelTypeOf, useModel, useModelOptions } from "../../../extend";
import { AccountModel } from "../../../models/AccountModel";

import { ModelActionButtons } from "../../shared/ModelActionButtons";

export function MemberAccount(props: {
  useModelOptions?: useModelOptions<ModelTypeOf<typeof AccountModel>>;
}) {
  const {
    entry: account,
    update,
    ...$account
  } = useModel(AccountModel, props.useModelOptions);

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        console.log("saving account");
      }}
      className={$account.id ? "" : "new-entry"}
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
        <input
          value={account?.type ?? ""}
          onChange={(ev) => update("type", ev.target.value)}
          list="account-type-data-list"
        ></input>
      </label>

      <ModelActionButtons $model={$account}></ModelActionButtons>
    </form>
  );
}
