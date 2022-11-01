import { useCallback } from "react";
import { ModelTypeOf, useModel, useModelOptions } from "../../../extend";
import { TransactionDetails } from "../../../finance-simulator";
import { RevenueModel } from "../../../models/RevenueModel";

import { ModelActionButtons } from "../../shared/ModelActionButtons";
import { ScheduleForm } from "../../shared/ScheduleForm";
import { TransactionDetailsForm } from "../../shared/TransactionDetailsForm";

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
        update={useCallback(() => update("details"), [update])}
        memberId={props.memberId}
        limitDestToMemberAccounts={true}
      ></TransactionDetailsForm>

      <ScheduleForm
        schedule={revenue?.schedule}
        update={useCallback(() => update("schedule"), [update])}
      ></ScheduleForm>

      <ModelActionButtons $model={$revenue}></ModelActionButtons>
      {/* <pre>{JSON.stringify(revenue, null, 4)}</pre> */}
    </form>
  );
}
