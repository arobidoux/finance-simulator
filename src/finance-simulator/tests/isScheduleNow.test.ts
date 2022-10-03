import { isScheduleNow, Schedule } from "../Schedule";
describe("daily schedule", () => {
  const schedule: Schedule = {
    end: {
      afterXOccurences: 5,
    },
    period: "days",
    every: 1,
    startAt: new Date("2022-01-01"),
  };
  it.each([
    ["2022-01-01"],
    ["2022-01-02"],
    ["2022-01-03"],
    ["2022-01-04"],
    ["2022-01-05"],
  ])("is valid for %s", (d) => {
    expect(isScheduleNow(schedule, new Date(d))).toBeTruthy();
  });

  it.each([["2021-12-31"], ["2022-01-06"], ["2022-01-07"]])(
    "is invalid for %s",
    (d) => {
      expect(isScheduleNow(schedule, new Date(d))).toBeFalsy();
    }
  );
});

describe("weekly schedule", () => {
  const schedule: Schedule = {
    end: {
      afterXOccurences: 6,
    },
    period: "weeks",
    every: 1,
    startAt: new Date("2022-01-01"),
  };
  it.each([
    ["2022-01-01"],
    ["2022-01-08"],
    ["2022-01-15"],
    ["2022-01-22"],
    ["2022-01-29"],
    ["2022-02-05"],
  ])("is valid for %s", (d) => {
    expect(isScheduleNow(schedule, new Date(d))).toBeTruthy();
  });

  it.each([["2022-01-02"], ["2022-01-09"], ["2022-02-12"]])(
    "is invalid for %s",
    (d) => {
      expect(isScheduleNow(schedule, new Date(d))).toBeFalsy();
    }
  );
});

describe("monthly schedule", () => {
  const schedule: Schedule = {
    end: {
      afterXOccurences: 7,
    },
    period: "months",
    every: 2,
    startAt: new Date("2022-01-01T05:00:00.000z"),
  };
  it.each([
    ["2022-01-01"],
    ["2022-03-01"],
    ["2022-05-01"],
    ["2022-07-01"],
    ["2022-09-01"],
    ["2022-11-01"],
    ["2023-01-01"],
  ])("is valid for %s", (d) => {
    expect(
      isScheduleNow(schedule, new Date(d + "T05:00:00.000z"))
    ).toBeTruthy();
  });

  it.each([["2022-01-02"], ["2022-02-01"], ["2023-03-01"]])(
    "is invalid for %s",
    (d) => {
      expect(
        isScheduleNow(schedule, new Date(d + "T05:00:00.000z"))
      ).toBeFalsy();
    }
  );
});

describe("yearly schedule", () => {
  const schedule: Schedule = {
    end: {
      afterXOccurences: 5,
    },
    period: "years",
    every: 5,
    startAt: new Date("2022-01-01T05:00:00.000z"),
  };
  it.each([
    ["2022-01-01"],
    ["2027-01-01"],
    ["2032-01-01"],
    ["2037-01-01"],
    ["2042-01-01"],
  ])("is valid for %s", (d) => {
    expect(
      isScheduleNow(schedule, new Date(d + "T05:00:00.000z"))
    ).toBeTruthy();
  });

  it.each([["2022-01-02"], ["2023-01-01"], ["2047-01-01"]])(
    "is invalid for %s",
    (d) => {
      expect(
        isScheduleNow(schedule, new Date(d + "T05:00:00.000z"))
      ).toBeFalsy();
    }
  );
});
