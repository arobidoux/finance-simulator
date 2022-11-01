import { useContext } from "react";
import { PrecisionContext } from "../../contexts/PrecisionContext";

export function RateForm(props: {
  value?: number;
  onChange: { (value: number): void };
}) {
  const ctx = useContext(PrecisionContext);
  const stepDown = ctx.interestRate / 1000;
  return <span> {Math.floor((props.value ?? 0) / stepDown) / 1000}% </span>;
}
