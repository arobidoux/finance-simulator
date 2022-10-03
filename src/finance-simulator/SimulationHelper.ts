import { Interest } from "./Interest";
import { getDayDiff, Schedule } from "./Schedule";
import { Simulation } from "./Simulation";

export class SimulationHelper extends Simulation {
  loans: Array<
    Loan & {
      loanAccountId: string;
      seedTransactionId: string;
    }
  > = [];

  salaries: Array<Salary & { scheduledTransactionId: string }> = [];
  savings: Array<Saving & { scheduledTransactionId: string }> = [];

  /**
   * A loan is really just an amount of money that is provided to an account,
   * from a ficticious account. Said ficticious account has interest, and the
   * balance needs to be repaid at some point
   */
  addLoan(loan: Loan) {
    const loanAccountId = this.addAccount({
      interest: loan.interest,
      label: loan.label,
      type: "loan",
    });
    const loanTransaction = {
      amount: loan.startAmount,
      fromAccountId: loanAccountId,
      toAccountId: loan.toAccountId,
      type: "loan",
    };
    let seedTransactionId: string;
    if (
      typeof loan.startDate === "undefined" ||
      getDayDiff(loan.startDate, this.getCurrentDate()) === 0
    ) {
      // create the transaction now
      seedTransactionId = this.addTransaction({
        occuredOn: new Date(),
        ...loanTransaction,
      });
    } else {
      // schedule the initial transaction
      seedTransactionId = this.addScheduledTransaction({
        details: loanTransaction,
        createdOn: new Date(),
        schedule: {
          period: "once",
          startAt: loan.startDate,
        },
      });
    }

    this.loans.push({
      ...loan,
      loanAccountId,
      seedTransactionId,
    });

    return loanAccountId;
  }

  addSalary(salary: Salary) {
    const scheduledTransactionId = this.addScheduledTransaction({
      createdOn: new Date(),
      details: {
        amount: salary.amount,
        fromAccountId: "boss",
        toAccountId: salary.toAccountId,
        type: "salary",
        label: salary.label,
      },
      schedule: salary.schedule,
    });
    this.salaries.push({ ...salary, scheduledTransactionId });
  }

  addSavings(saving: Saving) {
    const scheduledTransactionId = this.addScheduledTransaction({
      createdOn: new Date(),
      details: {
        amount: saving.amount,
        fromAccountId: saving.fromAccountId,
        toAccountId: saving.toAccountId,
        type: "saving",
        label: saving.label,
      },
      schedule: saving.schedule,
    });
    this.savings.push({ ...saving, scheduledTransactionId });
  }
}

export interface Loan {
  label: string;
  interest: Interest;
  startAmount: number;
  toAccountId: string;
  startDate?: Date;
}

export interface Salary {
  label: string;
  toAccountId: string;
  amount: number;
  schedule: Schedule;
}

export interface Saving {
  label: string;
  toAccountId: string;
  fromAccountId: string;
  amount: number;
  schedule: Schedule;
}
