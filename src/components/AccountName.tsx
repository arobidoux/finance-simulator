export function AccountName(props: {
  account: { label: string; type: string };
}) {
  return (
    <span>
      {props.account.label} ({props.account.type})
    </span>
  );
}
