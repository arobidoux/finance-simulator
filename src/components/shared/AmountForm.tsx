import { useState } from "react";

export function AmountForm(props: {
  value: number | undefined;
  onChange: { (value: number): void };
  placeholder?: string;
}) {
  const [editingAmount, setEditingAmount] = useState(false);
  return (
    <>
      <span style={{ position: "relative", right: "-10px", top: "1px" }}>
        $
      </span>
      <input
        type="number"
        style={{ paddingLeft: "10px", width: "7em" }}
        value={
          props.value
            ? editingAmount
              ? props.value / 100
              : (props.value / 100).toFixed(2)
            : ""
        }
        onChange={(ev) => {
          setEditingAmount(true);
          props.onChange(Math.floor(parseFloat(ev.target.value) * 100));
        }}
        onBlur={(ev) => setEditingAmount(false)}
        placeholder={props.placeholder ?? "amount $"}
      />
    </>
  );
}
