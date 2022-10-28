import { useState } from "react";
import { NestedUpdateHandle } from "../../extend/Model/useModelResult";
import { Schedule } from "../../finance-simulator";

export function ScheduleForm(props: {
  schedule?: Partial<Schedule>;
  update: NestedUpdateHandle<Schedule>;
}) {
  const [endStyle, setEndStyle] = useState("none");
  return (
    <>
      <label>
        Start At{" "}
        <input
          type="date"
          value={props.schedule?.startAt?.toISOString()?.substring(0, 10) ?? ""}
          onChange={(ev) => props.update("startAt", new Date(ev.target.value))}
        />
      </label>{" "}
      repeat{" "}
      {props.schedule?.startAt &&
        props.schedule?.period &&
        props.schedule.period !== "once" && (
          <label>
            {" "}
            every{" "}
            <input
              type="number"
              min={0}
              step={1}
              style={{ width: "3em" }}
              value={props.schedule?.every ?? 1}
              onChange={(ev) =>
                props.update("every", parseInt(ev.target.value))
              }
            />
          </label>
        )}
      <select
        disabled={typeof props.schedule?.startAt === "undefined"}
        value={props.schedule?.period ?? "once"}
        onChange={(ev) =>
          props.update("period", ev.target.value as Schedule["period"])
        }
      >
        <option value="once">once</option>
        <option value="days">days</option>
        <option value="weeks">weeks</option>
        <option value="months">months</option>
        <option value="years">years</option>
      </select>
      {props.schedule?.startAt &&
        props.schedule?.period &&
        props.schedule.period !== "once" && (
          <>
            <br />
            <label>
              <input
                type="radio"
                value="at"
                name="endStyle"
                checked={endStyle === "none"}
                onChange={(ev) => {
                  setEndStyle("none");
                  props.update("end", null);
                }}
              />
              Forever{" "}
            </label>
            <label>
              <input
                type="radio"
                value="at"
                name="endStyle"
                checked={endStyle === "at"}
                onChange={(ev) => setEndStyle("at")}
              />
              Stop At{" "}
            </label>
            <input
              type="date"
              disabled={endStyle !== "at"}
              min={props.schedule.startAt.toISOString().substring(0, 10)}
              value={
                props.schedule?.end && "at" in props.schedule.end
                  ? props.schedule.end.at.toISOString()?.substring(0, 10)
                  : ""
              }
              onChange={(ev) =>
                props.update("end", { at: new Date(ev.target.value) })
              }
            />
            <label>
              <input
                type="radio"
                value="after"
                name="endStyle"
                checked={endStyle === "after"}
                onChange={(ev) => setEndStyle("after")}
              />
              Stop After{" "}
            </label>
            <input
              type="number"
              style={{ width: "3em" }}
              disabled={endStyle !== "after"}
              value={
                props.schedule?.end && "afterXOccurences" in props.schedule.end
                  ? props.schedule.end.afterXOccurences
                  : ""
              }
              onChange={(ev) =>
                props.update("end", {
                  afterXOccurences: parseInt(ev.target.value),
                })
              }
            />{" "}
            occurences
          </>
        )}
    </>
  );
}
