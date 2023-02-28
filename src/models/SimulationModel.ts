import { createModel, ModelTypeOf } from "../extend";

export const SimulationModel = createModel<{ startedOn: Date }>({
  name: "simulation",
  sample: () => {
    return {
      startedOn: new Date(),
    };
  },
  fromStore: (storedEntry: string) =>
    JSON.parse(storedEntry, (key, value) => {
      if (["startedOn"].includes(key)) return new Date(value);
      return value;
    }),
});

export type SimulationType = ModelTypeOf<typeof SimulationModel>;
