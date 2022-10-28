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
import { ScheduledTransactionModel } from "../../models/ScheduledTransactionModel";
import { MemberAccount } from "./MemberAccount";
import { MemberRevenue } from "./MemberRevenue";
import { MemberScheduledTransaction } from "./MemberScheduledTransaction";
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
        <ModelActionButtons $model={$member}></ModelActionButtons>
      </form>
      {$member.request.status === ModelRequestStatuses.FOUND && $member.id && (
        <>
          {/* <details> */}
          <h3>Accounts</h3>
          <ModelList
            model={AccountModel}
            index={$member.toForeignIndexFor(AccountModel, "memberId")}
          >
            <MemberAccount></MemberAccount>
          </ModelList>
          {/* </details> */}
          <hr />
          {/* <details> */}
          <h3>Revenues</h3>
          <ModelList
            model={RevenueModel}
            index={$member.toForeignIndexFor(RevenueModel, "memberId")}
          >
            <MemberRevenue memberId={$member.id}></MemberRevenue>
          </ModelList>
          {/* </details> */}
          {/* <details> */}
          <h3>Scheduled Trnsactions</h3>
          <ModelList
            model={ScheduledTransactionModel}
            index={$member.toForeignIndexFor(
              ScheduledTransactionModel,
              "memberId"
            )}
          >
            <MemberScheduledTransaction
              memberId={$member.id}
            ></MemberScheduledTransaction>
          </ModelList>
          {/* </details> */}
          <br />
        </>
      )}
    </>
  );
}
