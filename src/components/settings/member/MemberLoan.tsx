import { ModelTypeOf, useModel, useModelOptions } from "../../../extend";
import { LoanModel } from "../../../models/LoanModel";
import { AmountForm } from "../../shared/AmountForm";
import { InterestForm } from "../../shared/InterestForm";

import { ModelActionButtons } from "../../shared/ModelActionButtons";
import { ScheduleForm } from "../../shared/ScheduleForm";

export function MemberLoan(props: {
  useModelOptions?: useModelOptions<ModelTypeOf<typeof LoanModel>>;
  memberId: string;
}) {
  const {
    entry: loan,
    update,
    ...$loan
  } = useModel(LoanModel, {
    ...props.useModelOptions,
    blank: true,
  });

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        console.log("saving loan");
      }}
      className={$loan.id ? "" : "new-entry"}
    >
      <input
        type="text"
        value={loan?.label ?? ""}
        onChange={(ev) => update("label", ev.target.value)}
      />
      <AmountForm
        value={loan?.startAmount}
        onChange={(value) => update("startAmount", value)}
        placeholder="Start Amount"
      ></AmountForm>
      <InterestForm
        interest={loan?.interest}
        update={update("interest")}
      ></InterestForm>
      : Payback
      <AmountForm
        value={loan?.payBack?.amount}
        onChange={(value) => update("payBack")("amount", value)}
      ></AmountForm>
      <ScheduleForm
        schedule={loan?.payBack?.schedule}
        update={update("payBack")("schedule")}
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
      <ModelActionButtons $model={$loan}></ModelActionButtons>
      {/* <pre>{JSON.stringify(loan, null, 4)}</pre> */}
    </form>
  );
}
