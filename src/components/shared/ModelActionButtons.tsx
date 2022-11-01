import { ModelRequestStatuses } from "../../extend";

export function ModelActionButtons(props: {
  $model: {
    reset: () => void;
    hasChanges: () => boolean;
    commit: () => void;
    delete: () => void;
    request: { status: string };
  };
}) {
  return (
    <>
      {props.$model.request.status === ModelRequestStatuses.FOUND &&
        props.$model.hasChanges() && (
          <button type="button" onClick={() => props.$model.reset()}>
            Discard changes
          </button>
        )}
      <button
        type="button"
        onClick={() => props.$model.commit()}
        disabled={!props.$model.hasChanges()}
      >
        Save
      </button>
      {props.$model.request.status === ModelRequestStatuses.FOUND && (
        <button
          type="button"
          onClick={() =>
            // window.confirm(`delete $props.{model?.name} #${props.$model.id}`) &&
            props.$model.delete()
          }
        >
          Delete
        </button>
      )}
    </>
  );
}
