import {
  ModelList,
  ModelTypeOf,
  useModel,
  useModelOptions,
  ModelRequestStatuses,
} from "../../extend";
import { AccountModel } from "../../models/AccountModel";
import { MemberModel } from "../../models/MemberModel";
import { RevenueModel } from "../../models/RevenueModel";
import { MemberAccount } from "./MemberAccount";
import { MemberRevenue } from "./MemberRevenue";
import { ModelActionButtons } from "./ModelActionButtons";

export function Member(props: {
  useModelOptions?: useModelOptions<ModelTypeOf<typeof MemberModel>>;
}) {
  const {
    entry: member,
    update,
    ...$member
  } = useModel(MemberModel, props.useModelOptions);

  return (
    <>
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          $member.commit();
        }}
      >
        <h4>
          Edit {$member.id ? "Member " : "New Member "}
          {member?.name
            ? member.name + ($member.hasChanges("name") ? "*" : "")
            : ""}
          {$member.id && " #" + $member.id}
        </h4>
        <label>
          Name{" "}
          <input
            type="text"
            value={member?.name ?? ""}
            onChange={(ev) => update("name", ev.target.value)}
          />
        </label>{" "}
      </form>
      {$member.request.status === ModelRequestStatuses.FOUND && $member.id && (
        <>
          {/* <details>
            <summary>Accounts</summary> */}
          <ModelList model={AccountModel} index={["memberId", $member.id]}>
            <MemberAccount></MemberAccount>
          </ModelList>
          {/* </details> */}
          <hr />
          {/* <details>
            <summary>Revenues</summary> */}
          <ModelList model={RevenueModel} index={["memberId", $member.id]}>
            <MemberRevenue memberId={$member.id}></MemberRevenue>
          </ModelList>
          {/* </details> */}
          <details>
            <summary>Savings</summary>
            List of all savings here
          </details>
          <br />
        </>
      )}
      <ModelActionButtons $model={$member}></ModelActionButtons>
    </>
  );
}
