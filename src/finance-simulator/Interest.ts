import { Schedule } from "./Schedule";

export interface Interest {
  // expressed as percent * 1000, so 5% would be 5000
  rate: number;
  calcSchedule: Schedule;
  applySchedule: Schedule;
}
