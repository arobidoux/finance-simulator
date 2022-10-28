import { ModelTypeOf, useModel, useModelOptions } from "../../extend";
import { ScheduledTransactionModel } from "../../models/ScheduledTransactionModel";

import { ModelActionButtons } from "./ModelActionButtons";
import { ScheduleForm } from "./ScheduleForm";
import { TransactionDetailsForm } from "./TransactionDetailsForm";

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

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        console.log("saving scheduled transaction");
      }}
      className={$scx.id ? "" : "new-entry"}
    >
      <TransactionDetailsForm
        details={scx?.details}
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
