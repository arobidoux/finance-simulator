import { SyntheticEvent, useState } from "react";
import { Account as FinanceAccount } from "../finance-simulator";

export function NewAccountForm(props: {
  addAccount: { (account: Omit<FinanceAccount, "uuid">): void };
}) {
  const [type, setType] = useState("checking");
  const [label, setLabel] = useState("EOP");

  function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();
    props.addAccount({
      label,
      type,
      interest: null,
    });
  }
  return (
    <form onSubmit={handleSubmit}>
      <label>
        {" "}
        Label{" "}
        <input
          type="text"
          value={label}
          onChange={(ev) => setLabel(ev.target.value)}
        />
      </label>
      <label>
        {" "}
        Type{" "}
        <select value={type} onChange={(ev) => setType(ev.target.value)}>
          <option value="checking">Checking</option>
          <option value="saving">Saving</option>
          <option value="other">Other</option>
        </select>
      </label>
      <button type="submit">Add</button>
    </form>
  );
}
