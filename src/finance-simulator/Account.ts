import { Interest } from "./Interest";

export interface Account {
  uuid: string;
  label: string;
  type: string;
  interest: Interest | null;
}
