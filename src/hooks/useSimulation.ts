import { useDeferredValue } from "react";
import { SimulationHelper } from "../finance-simulator";
import {
  useNativeObjectStore,
  UseNativeObjectStoreOptions,
} from "./useNativeObjectStore";

export interface UseSimulationOptions
  extends UseNativeObjectStoreOptions<SimulationHelper> {
  prevState?: string;
}
export const INTEREST_RATE_PRECISION = 1000000;

export function useSimulation(opts: UseSimulationOptions) {
  const provideSimulation = useNativeObjectStore<
    SimulationHelper,
    UseSimulationOptions
  >(
    "simulation",
    (/*opts,store*/) =>
      new SimulationHelper(
        opts.prevState ?? { interestRatePrecision: INTEREST_RATE_PRECISION }
      )
    //   [
    //     (inst: Simulation) => JSON.stringify(inst),
    //     (raw: string) => new Simulation(raw),
    //   ]
  );

  const { instance } = provideSimulation(opts);
  // return instance;
  return useDeferredValue(instance);
}
