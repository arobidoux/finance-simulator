import { createModel, ModelTypeOf, useModel } from "../extend";
import { useModelOptions } from "../extend/Model/useModelOptions";
import { ModelRequestFound } from "../extend/Model/ModelRequestFound";
import { ModelRequestStatuses } from "../extend/Model/ModelRequestStatuses";

export const memberModel = createModel({
  sample: () => {
    return {
      name: "John Smith",
      email: "johnsmith@exemple.com",
    };
  },
})
  .$migrate({
    sample: (prev) => {
      return { ...prev, gender: "male" };
    },
    migrate: (old) => {
      return { ...old, gender: "unknown" };
    },
  })
  .$migrate({
    sample: (prev) => {
      return { ...prev, phone: "555-555-5555" as string | null };
    },
    migrate: (old) => {
      return { ...old, phone: null };
    },
  });

export function Member(props: {
  request?: ModelRequestFound<ModelTypeOf<typeof memberModel>>;
  useModelOpts?: useModelOptions<ModelTypeOf<typeof memberModel>>;
}) {
  const {
    entry: member,
    update,
    ...$member
  } = useModel(memberModel, { request: props.request, ...props.useModelOpts });

  return (
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
        Name
        <input
          type="text"
          value={member?.name ?? ""}
          onChange={(ev) => update("name", ev.target.value)}
        />
      </label>{" "}
      <br />
      <label>
        Email
        <input
          type="text"
          value={member?.email ?? ""}
          onChange={(ev) => update("email", ev.target.value)}
        />
      </label>
      <br />
      <label>
        Gender
        <input
          type="text"
          value={member?.gender ?? ""}
          onChange={(ev) => update("gender", ev.target.value)}
        />
      </label>
      <br />
      <label>
        Phone
        <input
          type="text"
          value={member?.phone ?? ""}
          onChange={(ev) =>
            update("phone", ev.target.value === "" ? null : ev.target.value)
          }
        />
      </label>
      <br />
      <button
        type="button"
        onClick={() => $member.reset()}
        disabled={!$member.hasChanges()}
      >
        Discard changes
      </button>
      <button type="submit" disabled={!$member.hasChanges()}>
        Save
      </button>
      {$member.request.status === ModelRequestStatuses.FOUND && (
        <button
          type="button"
          onClick={() =>
            // window.confirm(`delete ${member?.name} #${$member.id}`) &&
            $member.delete()
          }
        >
          Delete
        </button>
      )}
    </form>
  );
}
