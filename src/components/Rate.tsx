import { useContext } from "react";
import { PrecisionContext } from "../contexts/PrecisionContext";

export function Rate(props: { rate: number }) {
  const ctx = useContext(PrecisionContext);
  const stepDown = ctx.interestRate / 1000;
  return <span> {Math.floor(props.rate / stepDown) / 1000}% </span>;
}
