import { getDayDiff, getMonthDiff } from "../Schedule";

it.each([
  [1, "2022-01-01T00:00:00.000z", "2022-01-02T00:00:00.000z"],
  [31, "2022-01-01T00:00:00.000z", "2022-02-01T00:00:00.000z"],
  [14, "2022-01-01T00:00:00.000z", "2022-01-15T00:00:00.000z"],
])("Can get the day difference %d", (diff, from, to) => {
  expect(getDayDiff(new Date(from), new Date(to))).toBe(diff);
});

it.each([
  [1, "2022-01-01T00:00:00.000z", "2022-02-01T00:00:00.000z"],
  [0, "2022-01-05T00:00:00.000z", "2022-02-01T00:00:00.000z"],
  [1, "2022-01-05T00:00:00.000z", "2022-02-05T00:00:00.000z"],
  [12, "2022-01-01T00:00:00.000z", "2023-01-01T00:00:00.000z"],
])("Can get the month difference for %d", (diff, from, to) => {
  expect(getMonthDiff(new Date(from), new Date(to))).toBe(diff);
});
