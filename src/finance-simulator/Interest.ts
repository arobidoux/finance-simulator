import { Schedule } from "./Schedule";

export interface Interest {
  applyRate?: string;
  // expressed as percent * 1000, so 5% would be 5000
  // can be overriden in the Simulation class
  rate: number;
  schedule:
    | Schedule
    | {
        calc: Schedule;
        apply: Schedule;
      };
}
