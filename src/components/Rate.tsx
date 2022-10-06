import { INTEREST_RATE_PRECISION } from "../hooks/useSimulation";

export function Rate(props: { rate: number }) {
  const stepDown = INTEREST_RATE_PRECISION / 1000;
  return <span> {Math.floor(props.rate / stepDown) / 1000}% </span>;
}
