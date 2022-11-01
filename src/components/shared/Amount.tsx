export function Amount(props: { amount: number }) {
  const isNegative = props.amount < 0 ? true : false;
  const workOf = isNegative ? props.amount * -1 : props.amount;
  const cents = workOf % 100;
  const units = [];
  let remainder = (workOf - cents) / 100;

  do {
    const part = remainder % 1000;
    units.unshift(("000" + part).slice(-3));
    remainder = (remainder - part) / 1000;
  } while (remainder > 0);

  // remove leading 0's on the first group
  units[0] = parseInt(units[0]);

  return (
    <>
      {isNegative && "-"}
      {units.join(",")}.{("00" + cents).slice(-2)}$
    </>
  );
}
