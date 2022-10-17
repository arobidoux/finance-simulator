export function DateTimePicker(props: {
  value: Date;
  onChange: { (value: Date): void };
}) {
  const d = props.value;
  const pad = (v: number) => ("0" + v).slice(-2);
  const str = `${d.getFullYear()}-${pad(d.getMonth())}-${pad(d.getDate())}`;
  return (
    <input
      type="date"
      value={str}
      onChange={(ev) => props.onChange(new Date(ev.target.value))}
    />
  );
}
