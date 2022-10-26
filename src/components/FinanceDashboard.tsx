import { FinanceSimulationSettings } from "./FinanceSimulationSettings";

export function FinanceDashboard(opts: {}) {
  return (
    <div style={{ textAlign: "left", display: "flex", padding: "10px" }}>
      <div style={{ flexGrow: 1 }}>
        <h4>Settings</h4>
        <FinanceSimulationSettings></FinanceSimulationSettings>
      </div>
    </div>
  );
}
