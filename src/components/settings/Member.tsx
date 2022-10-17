import {
  createModel,
  ModelList,
  ModelTypeOf,
  useModel,
  useModelOptions,
  ModelRequestStatuses,
} from "../../extend";
import { accountModel, MemberAccount } from "./MemberAccount";
import { ModelActionButtons } from "./ModelActionButtons";

export const memberModel = createModel({
  name: "member",
  sample: () => {
    return {
      name: "John Smith",
    };
  },
});

export function Member(props: {
  useModelOptions?: useModelOptions<ModelTypeOf<typeof memberModel>>;
}) {
  const {
    entry: member,
    update,
    ...$member
  } = useModel(memberModel, props.useModelOptions);

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
          <ModelList model={accountModel} index={["memberId", $member.id]}>
            <MemberAccount></MemberAccount>
          </ModelList>
          {/* </details> */}
          <details>
            <summary>Revenues</summary>
            List of all revenues here
          </details>
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
