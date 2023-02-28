// import { useContext, useState } from "react";
// import { PrecisionContext } from "../../contexts/PrecisionContext";

export function RateForm(props: {
  value?: number;
  onChange: { (value: number): void };
  placeholder?: string;
}) {
  // const ctx = useContext(PrecisionContext);
  // const [editingAmount, setEditingAmount] = useState(false);
  // const rateStr = ctx.interestRate.toString();
  // const pow = rateStr.length - rateStr.replaceAll("0", "").length;

  return (
    <>
      <span style={{ position: "relative", right: "-15px", top: "1px" }}>
        %
      </span>
      <input
        type="number"
        style={{ paddingLeft: "15px", width: "7em" }}
        value={
          props.value
          // ? editingAmount
          //   ? props.value / ctx.interestRate
          //   : (props.value / ctx.interestRate).toFixed(pow)
          // : ""
        }
        onChange={(ev) => {
          // setEditingAmount(true);
          props.onChange(
            parseInt(ev.target.value)
            // Math.floor(parseFloat(ev.target.value) * ctx.interestRate)
          );
        }}
        // onBlur={(ev) => setEditingAmount(false)}
        placeholder={props.placeholder ?? "rate %"}
      />
    </>
  );
}
