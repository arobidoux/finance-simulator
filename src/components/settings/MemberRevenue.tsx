import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  BaseStoreContext,
  ModelTypeOf,
  StoreContext,
  useModel,
  useModelOptions,
} from "../../extend";
import { NestedUpdateHandle } from "../../extend/Model/useModelResult";
import { Schedule, TransactionDetails } from "../../finance-simulator";
import { AccountModel } from "../../models/AccountModel";
import { MemberModel } from "../../models/MemberModel";
import { RevenueModel } from "../../models/RevenueModel";

import { ModelActionButtons } from "./ModelActionButtons";

export function MemberRevenue(props: {
  useModelOptions?: useModelOptions<ModelTypeOf<typeof RevenueModel>>;
  memberId: string;
}) {
  const {
    entry: revenue,
    update,
    ...$revenue
  } = useModel(RevenueModel, { ...props.useModelOptions, blank: true });

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        console.log("saving revenue");
      }}
      className={$revenue.id ? "" : "new-entry"}
    >
      <TransactionDetailsForm
        details={revenue?.details}
        update={update("details")}
        memberId={props.memberId}
      ></TransactionDetailsForm>
      <br />
      <ScheduleForm
        schedule={revenue?.schedule}
        update={update("schedule")}
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
      <ModelActionButtons $model={$revenue}></ModelActionButtons>
      <pre>{JSON.stringify(revenue, null, 4)}</pre>
    </form>
  );
}

function ScheduleForm(props: {
  schedule?: Partial<Schedule>;
  update: NestedUpdateHandle<Schedule>;
}) {
  const [endStyle, setEndStyle] = useState("at");
  return (
    <>
      <label>
        Start At{" "}
        <input
          type="date"
          value={props.schedule?.startAt?.toISOString()?.substring(0, 10) ?? ""}
          onChange={(ev) => props.update("startAt", new Date(ev.target.value))}
        />
      </label>
      <label>
        {" "}
        repeat{" "}
        <select
          disabled={typeof props.schedule?.startAt === "undefined"}
          value={props.schedule?.period ?? "once"}
          onChange={(ev) =>
            props.update("period", ev.target.value as Schedule["period"])
          }
        >
          <option value="once">once</option>
          <option value="days">dayly</option>
          <option value="weeks">weekly</option>
          <option value="months">monthly</option>
          <option value="years">yearly</option>
        </select>
      </label>
      {props.schedule?.startAt &&
        props.schedule?.period &&
        props.schedule.period !== "once" && (
          <>
            <br />
            <label>
              {" "}
              every
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
              {" " + props.schedule.period + " "}
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

function TransactionDetailsForm_loadAccounts(
  memberId: string,
  storeContext: BaseStoreContext,
  setFromAccounts: Dispatch<
    SetStateAction<Array<{ id: string; label: string }>>
  >,
  setToAccounts: Dispatch<SetStateAction<Array<{ id: string; label: string }>>>
) {
  storeContext
    .forModel(AccountModel)
    .list(undefined, ["memberId", memberId])
    .then((page) =>
      setFromAccounts(
        page.entries.map((e) => {
          return { id: e.id, label: e.data.label };
        })
      )
    );
  storeContext
    .forModel(AccountModel)
    .list()
    .then((page) => {
      const memberStore = storeContext.forModel(MemberModel);

      const memberIdToFetch = page.entries.reduce((acc, entry) => {
        if (
          entry.data.memberId !== memberId &&
          !acc.includes(entry.data.memberId)
        )
          acc.push(entry.data.memberId);
        return acc;
      }, [] as string[]);

      return Promise.all(
        memberIdToFetch.map((memberId) =>
          Promise.all([memberId, memberStore.get(memberId)])
        )
      ).then((members) => {
        setToAccounts(
          page.entries.map((e) => {
            let label = e.data.label;
            if (e.data.memberId === memberId) {
              label = "(your) " + label;
            } else {
              const member = members.find((m) => m[0] === e.data.memberId);
              label = (member?.[1]?.name ?? e.data.memberId) + " - " + label;
            }
            return {
              id: e.id,
              label,
            };
          })
        );
      });
    });
}

function TransactionDetailsForm(props: {
  details?: Partial<TransactionDetails>;
  update: NestedUpdateHandle<TransactionDetails>;
  memberId: string;
}) {
  const storeContext = useContext(StoreContext);

  const [fromAccounts, setFromAccounts] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [toAccounts, setToAccounts] = useState<
    Array<{ id: string; label: string }>
  >([]);
  useEffect(() => {
    TransactionDetailsForm_loadAccounts(
      props.memberId,
      storeContext,
      setFromAccounts,
      setToAccounts
    );
    return storeContext.registerForChangesOn([MemberModel, AccountModel], () =>
      TransactionDetailsForm_loadAccounts(
        props.memberId,
        storeContext,
        setFromAccounts,
        setToAccounts
      )
    );
  }, [props.memberId, storeContext]);
  const [editingAmount, setEditingAmount] = useState(false);
  return (
    <>
      <select
        value={props.details?.fromAccountId}
        onChange={(ev) => props.update("fromAccountId", ev.target.value)}
      >
        <option value="">(pick)</option>
        {fromAccounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.label}
          </option>
        ))}
      </select>
      <select
        value={props.details?.toAccountId}
        disabled={!props.details?.fromAccountId}
        onChange={(ev) => props.update("toAccountId", ev.target.value)}
      >
        {toAccounts
          .filter((account) => account.id !== props.details?.fromAccountId)
          .map((account) => (
            <option key={account.id} value={account.id}>
              {account.label}
            </option>
          ))}
      </select>
      <span style={{ position: "relative", right: "-10px", top: "1px" }}>
        $
      </span>
      <input
        type="number"
        style={{ paddingLeft: "10px", width: "7em" }}
        value={
          props.details?.amount
            ? editingAmount
              ? props.details?.amount / 100
              : (props.details?.amount / 100).toFixed(2)
            : ""
        }
        onChange={(ev) => {
          setEditingAmount(true);
          props.update("amount", Math.floor(parseFloat(ev.target.value) * 100));
        }}
        onBlur={(ev) => setEditingAmount(false)}
        placeholder="amount $"
      />
      <input
        type="text"
        style={{ width: "7em" }}
        value={props.details?.type ?? ""}
        onChange={(ev) => props.update("type", ev.target.value)}
        placeholder="type"
      />
      <input
        type="text"
        value={props.details?.label ?? ""}
        onChange={(ev) => props.update("label", ev.target.value)}
        placeholder="label"
      />
    </>
  );
}
