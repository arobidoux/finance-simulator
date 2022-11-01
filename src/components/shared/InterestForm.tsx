import { NestedUpdateHandle } from "../../extend/Model/useModelResult";
import { Interest, Schedule } from "../../finance-simulator";
import { RateForm } from "./RateForm";
import { ScheduleForm } from "./ScheduleForm";

export function InterestForm(props: {
  interest?: Partial<Interest>;
  update: NestedUpdateHandle<Interest>;
}) {
  let schedule: any;

  if (props?.interest?.schedule && "calc" in props?.interest?.schedule)
    schedule = "Cannot update calc and apply for schedule";
  else if (
    !props?.interest?.schedule ||
    !("calc" in props?.interest?.schedule)
  ) {
    schedule = (
      <ScheduleForm
        schedule={props?.interest?.schedule as Schedule}
        update={props.update("schedule")}
      ></ScheduleForm>
    );
  }

  return (
    <>
      <label>
        Rate{" "}
        <RateForm
          value={props?.interest?.rate}
          onChange={(v) => props.update("rate", v)}
        ></RateForm>
      </label>{" "}
      {schedule}
    </>
  );
}
