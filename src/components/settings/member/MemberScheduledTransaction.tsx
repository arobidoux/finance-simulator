import { ModelTypeOf, useModel, useModelOptions } from "../../../extend";
import { TransactionDetails } from "../../../finance-simulator";
import { ScheduledTransactionModel } from "../../../models/ScheduledTransactionModel";

import { ModelActionButtons } from "../../shared/ModelActionButtons";
import { ScheduleForm } from "../../shared/ScheduleForm";
import { TransactionDetailsForm } from "../../shared/TransactionDetailsForm";

export function MemberScheduledTransaction(props: {
  useModelOptions?: useModelOptions<
    ModelTypeOf<typeof ScheduledTransactionModel>
  >;
  memberId: string;
}) {
  const {
    entry: scx,
    update,
    ...$scx
  } = useModel(ScheduledTransactionModel, {
    ...props.useModelOptions,
    blank: true,
  });

  const forcedDetails = {
    type: "scheduled",
  } as Partial<TransactionDetails>;

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        console.log("saving scheduled transaction");
      }}
      className={$scx.id ? "" : "new-entry"}
    >
      <TransactionDetailsForm
        details={{ ...scx?.details, ...forcedDetails }}
        forcedDetails={forcedDetails}
        update={update("details")}
        memberId={props.memberId}
      ></TransactionDetailsForm>
      <br />
      <ScheduleForm
        schedule={scx?.schedule}
        update={update("schedule")}
      ></ScheduleForm>

      <ModelActionButtons $model={$scx}></ModelActionButtons>
      {/* <pre>{JSON.stringify(scx, null, 4)}</pre> */}
    </form>
  );
}
