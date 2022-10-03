export interface Schedule {
  startAt: Date;
  end?:
    | {
        at: Date;
      }
    | {
        afterXOccurences: number;
      }
    | null;
  period: "once" | "days" | "weeks" | "months" | "years";
  every?: number;
}

export function getDayDiff(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}
export function getMonthDiff(from: Date, to: Date): number {
  const yearsWorth = (to.getFullYear() - from.getFullYear()) * 12;
  const monthsWorth = to.getMonth() - from.getMonth();
  // if we are before the initial date, do not count the partial month yet
  const offsetCheck = to.getDate() >= from.getDate() ? 0 : -1;

  return yearsWorth + monthsWorth + offsetCheck;
}
export function isScheduleNow(schedule: Schedule, now: Date): boolean {
  const isStarted = now >= schedule.startAt;
  const isEnded = schedule.end && "at" in schedule.end && schedule.end.at < now;

  const stopAfter =
    schedule.end && "afterXOccurences" in schedule.end
      ? schedule.end.afterXOccurences
      : -1;

  if (!isStarted || isEnded) return false;

  switch (schedule.period) {
    case "once":
      if (getDayDiff(now, schedule.startAt) !== 0) return false;
      return true;

    case "days":
    case "weeks":
      const elapsedDaysSinceStart = getDayDiff(schedule.startAt, now);
      const daysPerPeriod =
        (schedule.period === "days" ? 1 : 7) * (schedule.every ?? 1);

      if (
        stopAfter !== -1 &&
        elapsedDaysSinceStart / daysPerPeriod >= stopAfter
      ) {
        return false;
      }

      if (elapsedDaysSinceStart % daysPerPeriod !== 0) return false;

      return true;
    case "months":
    case "years":
      // only trigger on the same date
      const isSameDate = now.getDate() === schedule.startAt.getDate();
      if (!isSameDate) return false;

      const elapsedMonthSinceStart = getMonthDiff(schedule.startAt, now);
      const monthPerPeriod =
        (schedule.period === "months" ? 1 : 12) * (schedule.every ?? 1);

      if (stopAfter !== -1) {
        const doneSoFar = elapsedMonthSinceStart / monthPerPeriod;
        if (doneSoFar >= stopAfter) return false;
      }

      const monthUntilNext = elapsedMonthSinceStart % monthPerPeriod;
      if (monthUntilNext !== 0) return false;

      return true;
  }

  throw new Error("oops");
}
