import { Member } from "./settings/Member";
import { ModelModalWithSelector, useModel } from "../extend";
import { useMemo, useState } from "react";
import { SimulationModel, MemberModel } from "../models";
import { ModelActionButtons } from "./shared/ModelActionButtons";

export function FinanceSimulationSettings(props: {}) {
  const { entry: simulationMeta, ...$simulationMeta } = useModel(
    SimulationModel,
    { id: "1" }
  );
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
      <h4>Meta</h4>
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          $simulationMeta.commit();
        }}
      >
        <input
          type="date"
          value={(simulationMeta?.startedOn ?? new Date())
            .toISOString()
            .substring(0, 10)}
          onChange={(ev) =>
            $simulationMeta.update("startedOn", new Date(ev.target.value))
          }
        />
        <ModelActionButtons $model={$simulationMeta}></ModelActionButtons>
      </form>
      <h4>Members</h4>
      <div style={{ paddingLeft: "25px" }}>{members}</div>
      <hr />

      <datalist id="account-type-data-list">{accountTypeOptions}</datalist>
    </div>
  );
}
