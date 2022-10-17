import { useCallback, useState } from "react";
import { Schedule as FinanceSchedule } from "../../finance-simulator";
import { DateTimePicker } from "./DateTimePicker";
import { OptionalDateTimePicker } from "./OptionalDateTimePicker";

export function EditSchedule(props: {
  setSchedule: { (schedule: FinanceSchedule): void };
  schedule?: FinanceSchedule;
}) {
  const [startAt, setStartAt] = useState(props.schedule?.startAt ?? new Date());
  const [endAt, setEndAt] = useState(
    props.schedule?.end && "at" in props.schedule?.end
      ? props.schedule.end.at
      : null
  );
  const [endAfterXOccurences, setEndAfterXOccurences] = useState(
    props.schedule?.end && "afterXOccurences" in props.schedule?.end
      ? props.schedule.end.afterXOccurences
      : null
  );
  const [period, setPeriod] = useState("once");
  const [every, setEvery] = useState("");

  const tryNotify = useCallback(() => {
    if (!["once", "days", "weeks", "months", "years"].includes(period)) {
      // throw new Error("invalid period");
      return;
    }
    const r: FinanceSchedule = {
      period: period as FinanceSchedule["period"],
      startAt,
      ...(every ? { every: parseInt(every) } : {}),
    };
    if (endAt) r.end = { at: endAt };
    else if (endAfterXOccurences)
      r.end = { afterXOccurences: endAfterXOccurences };

    props.setSchedule(r);
  }, [endAfterXOccurences, endAt, every, period, props, startAt]);

  return (
    <div>
      <label>
        {" "}
        Start At{" "}
        <DateTimePicker
          value={startAt}
          onChange={(value) => {
            value.setHours(12, 0, 0);
            setStartAt(value);
            tryNotify();
          }}
        ></DateTimePicker>
        <br />
        <label>
          Period{" "}
          <select
            value={period}
            onChange={(ev) => {
              setPeriod(ev.target.value);
              tryNotify();
            }}
          >
            <option value="once">Once</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="Years">Years</option>
          </select>
        </label>
        {period !== "once" && (
          <>
            <br />
            <label>
              Repeat every{" "}
              <input
                type="number"
                value={every}
                style={{ width: 45 }}
                min={0}
                onChange={(ev) => {
                  setEvery(ev.target.value);
                  tryNotify();
                }}
              ></input>{" "}
              {period}
            </label>
            <br />
            End At
            <OptionalDateTimePicker
              value={endAt}
              onChange={(value) => {
                if (value) value.setHours(12, 0, 0);
                setEndAt(value);
                tryNotify();
              }}
            ></OptionalDateTimePicker>{" "}
            or after{" "}
            <input
              type="number"
              value={endAfterXOccurences ?? ""}
              onChange={(ev) =>
                setEndAfterXOccurences(parseInt(ev.target.value))
              }
              style={{ width: 45 }}
              min={0}
            />{" "}
            occurences
          </>
        )}
      </label>
    </div>
  );
}
