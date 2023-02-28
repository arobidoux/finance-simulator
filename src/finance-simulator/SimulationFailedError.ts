import { Simulation } from "./Simulation";
import { Transaction } from "./Transaction";

export interface SimulationFailedDetails {
  transaction?: Transaction;
}
export class SimulationFailedError extends Error {
  simulation: Simulation;
  details: SimulationFailedDetails;
  constructor(
    simulation: Simulation,
    error: string,
    details: SimulationFailedDetails
  ) {
    super(error);
    this.simulation = simulation;
    this.details = details;
  }
}
