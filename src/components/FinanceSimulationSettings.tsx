import { Member } from "./settings/Member";
import { ModelModalWithSelector } from "../extend";
import { useMemo, useState } from "react";
import { MemberModel } from "../models/MemberModel";

export function FinanceSimulationSettings(props: {}) {
  const members = (
    <ModelModalWithSelector
      model={MemberModel}
      renderSelector={({ rows, selectId, currentSelectedId }) => (
        <>
          {rows}
          <button onClick={() => selectId(null)}>+</button>
        </>
      )}
      renderRow={(member, id, { select }) => (
        <button key={id} onClick={select}>
          {member.name}
        </button>
      )}
      renderModal={(useModelOptions) => (
        <Member useModelOptions={useModelOptions}></Member>
      )}
    ></ModelModalWithSelector>
  );
  const [accountTypes, setAccountTypes] = useState([
    "checking",
    "saving",
    "other",
  ]);

  const accountTypeOptions = useMemo(
    () => (
      <>
        {accountTypes.map((accountType) => (
          <option value={accountType} key={accountType} />
        ))}
      </>
    ),
    [accountTypes]
  );

  return (
    <div>
      <h4>Members</h4>
      {members}
      <hr />
      <datalist id="account-type-data-list">{accountTypeOptions}</datalist>
    </div>
  );
}
