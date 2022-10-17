import { useState } from "react";

export function OptionalDateTimePicker(props: {
  value: Date | null;
  onChange: { (value: Date | null): void };
}) {
  const [isEnabled, setEnabled] = useState(props.value !== null);
  let str = "";
  if (props.value) {
    const d = props.value;
    const pad = (v: number) => ("0" + v).slice(-2);
    str = `${d.getFullYear()}-${pad(d.getMonth())}-${pad(d.getDate())}`;
  }

  return (
    <span>
      <input
        type="checkbox"
        checked={isEnabled}
        onChange={(ev) => {
          if (isEnabled) props.onChange(null);
          setEnabled(!isEnabled);
        }}
      />
      <input
        type="date"
        value={str}
        onChange={(ev) => props.onChange(new Date(ev.target.value))}
        disabled={!isEnabled}
      />
    </span>
  );
}
