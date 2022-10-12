import { createContext } from "react";
import { SimulationHelper } from "../finance-simulator";

// interface SimulationContextInterface {
//   simulation: SimulationHelper;
//   save: {():void}
// }

export const SimulationContext = createContext({
  simulation: new SimulationHelper(),
  save: function () {},
});
