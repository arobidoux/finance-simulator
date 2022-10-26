import { SimulationHelper } from "../SimulationHelper";

it("can run a simple simulation", () => {
  const s = new SimulationHelper();

  const accountId = s.addAccount({
    label: "Operation",
    interest: null,
    type: "operation",
  });

  s.addSalary({
    amount: 100,
    label: "Paie",
    toAccountId: accountId,
    schedule: {
      period: "weeks",
      every: 2,
      startAt: new Date(),
    },
  });

  s.runUntil((s, i) => i > 15);
  //   console.debug(s.getAccountSummaries());
  //   console.debug(s.getAccountDebits(accountId));
  const balance = s.getAccountBalance(accountId);
  expect(balance).toBe(200);
});

it("can handle a simple loan", () => {
  const s = new SimulationHelper();

  const accountId = s.addAccount({
    label: "Operation",
    interest: null,
    type: "operation",
  });

  s.addSalary({
    amount: 100,
    label: "Paie",
    toAccountId: accountId,
    schedule: {
      period: "weeks",
      every: 2,
      startAt: new Date(),
    },
  });

  const now = new Date();
  const loanAccountId = s.addLoan({
    interest: {
      rate: 5000 / 365,
      schedule: {
        period: "days",
        startAt: now,
      },
    },
    label: "Test Loan",
    startAmount: 1000,
    toAccountId: accountId,
  });

  s.addScheduledTransaction({
    details: {
      amount: 75,
      fromAccountId: accountId,
      toAccountId: loanAccountId,
      type: "pay-back",
    },
    schedule: { period: "weeks", every: 2, startAt: now },
  });

  const iteration = s.runUntil((s, i) => i > 45);
  //   const iteration = s.runUntil(
  //     (s, i) => s.getAccountBalance(loanAccountId) >= 0
  //   );
  console.log("completed in %d iterations", iteration);
  console.debug(s.getAccountDetails(accountId));
  console.debug(s.getAccountDetails(loanAccountId));
  //   console.debug(s.getAccountDetails(loanAccountId + "-pending-interest"));
});
