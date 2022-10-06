import { Schedule as FinanceSchedule } from "../finance-simulator";

export function Schedule(props: { schedule: FinanceSchedule }) {
  if (props.schedule.period === "once")
    return (
      <span>
        <b>On:</b> {props.schedule.startAt.toDateString()}
      </span>
    );
  return (
    <span>
      <b>Starting on:</b> {props.schedule.startAt.toDateString()} <b>Every:</b>{" "}
      {props.schedule.every ?? 1} {props.schedule.period}
    </span>
  );
}
