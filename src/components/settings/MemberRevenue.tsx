import { ModelTypeOf, useModel, useModelOptions } from "../../extend";
import { TransactionDetails } from "../../finance-simulator";
import { RevenueModel } from "../../models/RevenueModel";

import { ModelActionButtons } from "./ModelActionButtons";
import { ScheduleForm } from "./ScheduleForm";
import { TransactionDetailsForm } from "./TransactionDetailsForm";

export function MemberRevenue(props: {
  useModelOptions?: useModelOptions<ModelTypeOf<typeof RevenueModel>>;
  memberId: string;
}) {
  const {
    entry: revenue,
    update,
    ...$revenue
  } = useModel(RevenueModel, { ...props.useModelOptions, blank: true });

  const forcedDetails = {
    fromAccountId: "manual:bank",
    type: "salary",
  } as Partial<TransactionDetails>;
  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        console.log("saving revenue");
      }}
      className={$revenue.id ? "" : "new-entry"}
    >
      <TransactionDetailsForm
        details={{ ...revenue?.details, ...forcedDetails }}
        forcedDetails={forcedDetails}
        update={update("details")}
        memberId={props.memberId}
        limitDestToMemberAccounts={true}
      ></TransactionDetailsForm>

      <ScheduleForm
        schedule={revenue?.schedule}
        update={update("schedule")}
      ></ScheduleForm>

      {/* 
      <label>
        {" "}
        Type{" "}
        <input
          value={account?.type ?? ""}
          onChange={(ev) => update("type", ev.target.value)}
          list="account-type-data-list"
        ></input>
      </label>
        */}
      <ModelActionButtons $model={$revenue}></ModelActionButtons>
      <pre>{JSON.stringify(revenue, null, 4)}</pre>
    </form>
  );
}
