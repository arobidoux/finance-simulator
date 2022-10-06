import { Interest as FinanceInterest } from "../finance-simulator";
import { Schedule } from "./Schedule";
import { Rate } from "./Rate";

export function Interest(props: { interest?: FinanceInterest | null }) {
  if (!props.interest) {
    return <span>No Interest</span>;
  }
  const schedule =
    "calc" in props.interest.schedule ? (
      <span>
        <b>Calculate:</b>{" "}
        <Schedule schedule={props.interest.schedule.apply}></Schedule>
        <b>Apply:</b>{" "}
        <Schedule schedule={props.interest.schedule.apply}></Schedule>
      </span>
    ) : (
      <Schedule schedule={props.interest.schedule}></Schedule>
    );
  const calRate =
    "calc" in props.interest.schedule
      ? props.interest.schedule.calc
      : props.interest.schedule;
  const aka =
    calRate.period === "days" && (calRate.every ?? 1) === 1 ? (
      <span>
        <b>Yearly:</b>
        <Rate rate={props.interest.rate * 365}></Rate>
      </span>
    ) : null;
  return (
    <span>
      <b>rate:</b> <Rate rate={props.interest.rate}></Rate> {schedule} {aka}
    </span>
  );
}
