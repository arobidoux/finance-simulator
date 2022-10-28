import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { BaseStoreContext, StoreContext } from "../../extend";
import { NestedUpdateHandle } from "../../extend/Model/useModelResult";
import { TransactionDetails } from "../../finance-simulator";
import { AccountModel } from "../../models/AccountModel";
import { MemberModel } from "../../models/MemberModel";

function TransactionDetailsForm_loadAccounts(
  memberId: string,
  storeContext: BaseStoreContext,
  setFromAccounts: Dispatch<
    SetStateAction<Array<{ id: string; label: string }>>
  >,
  setToAccounts: Dispatch<SetStateAction<Array<{ id: string; label: string }>>>,
  limitDestToMemberAccounts: boolean = false
) {
  storeContext
    .forModel(AccountModel)
    .list(undefined, ["memberId", memberId])
    .then((page) => {
      const accounts = page.entries.map((e) => {
        return { id: e.id, label: e.data.label };
      });
      setFromAccounts(accounts);
      if (limitDestToMemberAccounts === true) setToAccounts(accounts);
    });
  if (!limitDestToMemberAccounts)
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

export function TransactionDetailsForm(props: {
  details?: Partial<TransactionDetails>;
  forcedDetails?: Partial<TransactionDetails>;
  update: NestedUpdateHandle<TransactionDetails>;
  memberId: string;
  limitDestToMemberAccounts?: boolean;
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
      setToAccounts,
      props.limitDestToMemberAccounts
    );
    return storeContext.registerForChangesOn([MemberModel, AccountModel], () =>
      TransactionDetailsForm_loadAccounts(
        props.memberId,
        storeContext,
        setFromAccounts,
        setToAccounts,
        props.limitDestToMemberAccounts
      )
    );
  }, [props.memberId, storeContext, props.limitDestToMemberAccounts]);
  const [editingAmount, setEditingAmount] = useState(false);

  return (
    <>
      {typeof props.forcedDetails?.fromAccountId === "undefined" && (
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
      )}
      {typeof props.forcedDetails?.toAccountId === "undefined" && (
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
      )}
      {typeof props.forcedDetails?.amount === "undefined" && (
        <>
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
              props.update(
                "amount",
                Math.floor(parseFloat(ev.target.value) * 100)
              );
            }}
            onBlur={(ev) => setEditingAmount(false)}
            placeholder="amount $"
          />
        </>
      )}
      {typeof props.forcedDetails?.type === "undefined" && (
        <input
          type="text"
          style={{ width: "7em" }}
          value={props.details?.type ?? ""}
          onChange={(ev) => props.update("type", ev.target.value)}
          placeholder="type"
        />
      )}
      {typeof props.forcedDetails?.type === "undefined" && (
        <input
          type="text"
          value={props.details?.label ?? ""}
          onChange={(ev) => props.update("label", ev.target.value)}
          placeholder="label"
        />
      )}
    </>
  );
}
