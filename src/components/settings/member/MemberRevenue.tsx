import { useModel, useModelOptions } from "../../../extend";
import { TransactionDetails } from "../../../finance-simulator";
import { RevenueModel, RevenueType } from "../../../models";

import { ModelActionButtons } from "../../shared/ModelActionButtons";
import { ScheduleForm } from "../../shared/ScheduleForm";
import { TransactionDetailsForm } from "../../shared/TransactionDetailsForm";

export function MemberRevenue(props: {
  useModelOptions?: useModelOptions<RevenueType>;
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

      <ModelActionButtons $model={$revenue}></ModelActionButtons>
      {/* <pre>{JSON.stringify(revenue, null, 4)}</pre> */}
    </form>
  );
}
