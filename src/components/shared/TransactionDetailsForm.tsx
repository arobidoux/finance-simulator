import { useMemo } from "react";
import { useModelCache } from "../../extend";

import { useModelList } from "../../extend/Model/useModelList";
import { NestedUpdateHandle } from "../../extend/Model/useModelResult";
import { TransactionDetails } from "../../finance-simulator";
import { AccountModel } from "../../models/AccountModel";
import { MemberModel } from "../../models/MemberModel";
import { AmountForm } from "./AmountForm";
import { MemberName } from "./MemberName";

export function TransactionDetailsForm(props: {
  details?: Partial<TransactionDetails>;
  forcedDetails?: Partial<TransactionDetails>;
  update?: NestedUpdateHandle<TransactionDetails>;
  memberId: string;
  limitDestToMemberAccounts?: boolean;
}) {
  const memberCache = useModelCache(MemberModel);
  const index = useMemo<["memberId", string] | undefined>(
    () =>
      props.limitDestToMemberAccounts
        ? ["memberId", props.memberId]
        : undefined,
    [props.limitDestToMemberAccounts, props.memberId]
  );
  const { entries: accounts } = useModelList(AccountModel, {
    index,
  });

  const fromAccounts = accounts
    .filter((act) => act.result.memberId === props.memberId)
    .map((e) => {
      return { id: e.id, label: <>{e.result.label}</> };
    });

  const toAccounts = props.limitDestToMemberAccounts
    ? fromAccounts
    : accounts.map((e) => {
        let label = <>{e.result.label}</>;
        if (e.result.memberId === props.memberId) {
          label = <>(your) {label}</>;
        } else {
          label = (
            <>
              <MemberName
                memberId={e.result.memberId}
                cache={memberCache}
              ></MemberName>{" "}
              - {label}
            </>
          );
        }
        return {
          id: e.id,
          label,
        };
      });

  return (
    <>
      {typeof props.forcedDetails?.fromAccountId === "undefined" && (
        <select
          value={props.details?.fromAccountId}
          onChange={(ev) => props.update?.("fromAccountId", ev.target.value)}
        >
          <option value="">(pick)</option>
          {fromAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.label}
            </option>
          ))}
        </select>
      )}
      {typeof props.forcedDetails?.toAccountId === "undefined" && (
        <select
          value={props.details?.toAccountId}
          disabled={!props.details?.fromAccountId}
          onChange={(ev) => props.update?.("toAccountId", ev.target.value)}
        >
          {toAccounts
            .filter((account) => account.id !== props.details?.fromAccountId)
            .map((account) => (
              <option key={account.id} value={account.id}>
                {account.label}
              </option>
            ))}
        </select>
      )}

      {typeof props.forcedDetails?.amount === "undefined" && (
        <AmountForm
          value={props.details?.amount}
          onChange={(value) => props.update?.("amount", value)}
        ></AmountForm>
      )}
      {typeof props.forcedDetails?.type === "undefined" && (
        <input
          type="text"
          style={{ width: "7em" }}
          value={props.details?.type ?? ""}
          onChange={(ev) => props.update?.("type", ev.target.value)}
          placeholder="type"
        />
      )}
      {typeof props.forcedDetails?.label === "undefined" && (
        <input
          type="text"
          value={props.details?.label ?? ""}
          onChange={(ev) => props.update?.("label", ev.target.value)}
          placeholder="label"
        />
      )}
    </>
  );
}
