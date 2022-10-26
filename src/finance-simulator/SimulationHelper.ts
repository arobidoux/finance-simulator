import { Interest } from "./Interest";
import { getDayDiff, Schedule } from "./Schedule";
import { Simulation } from "./Simulation";
import { v1 as uuidv1 } from "uuid";

export class SimulationHelper extends Simulation {
  loans: Array<
    Loan & {
      loanAccountId: string;
      seedTransactionId: string;
      payBackTransactionId: string | null;
    }
  > = [];

  salaries: Array<Salary & { scheduledTransactionId: string }> = [];
  savings: Array<Saving & { scheduledTransactionId: string }> = [];
  members: Array<Member> = [];
  memberAliases: Record<string, string> = {};

  get $scheduledTransactions() {
    return this.scheduledTransactions;
  }
  get $accounts() {
    return this.accounts;
  }

  protected reviveState(prevState: string) {
    const state = super.reviveState(prevState);
    this.salaries = state.salaries ?? [];
    this.savings = state.savings ?? [];
    this.loans = state.loans ?? [];
    this.memberAliases = state.memberAliases ?? {};
    this.members = [];
    for (const member of state.members) {
      this.members.push(new Member(this, member));
    }
    return state;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      loans: this.loans,
      salaries: this.salaries,
      savings: this.savings,
      memberAliases: this.memberAliases,
      members: this.members,
    };
  }

  fork() {
    return new SimulationHelper(JSON.stringify(this));
  }

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
    let seedTransactionId: string,
      payBackTransactionId: string | null = null;
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
        schedule: {
          period: "once",
          startAt: loan.startDate,
        },
      });
    }

    if (loan.payBack) {
      payBackTransactionId = this.addScheduledTransaction({
        details: {
          amount: loan.payBack.amount,
          fromAccountId: loan.payBack.fromAccountId ?? loan.toAccountId,
          toAccountId: loanAccountId,
          type: "payback",
        },
        schedule: loan.payBack.schedule,
      });
    }

    this.loans.push({
      ...loan,
      loanAccountId,
      seedTransactionId,
      payBackTransactionId,
    });

    return loanAccountId;
  }

  addSalary(salary: Salary) {
    const scheduledTransactionId = this.addScheduledTransaction({
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

  addMember(
    opts: MemberOptions,
    key: string | { key: string; init: { (member: Member): void } }
  ) {
    const idempotentKey =
      typeof key === "string"
        ? key
        : key && "key" in key && key.key
        ? key.key
        : null;
    if (idempotentKey && idempotentKey in this.memberAliases) {
      const uuid = this.memberAliases[idempotentKey];
      const member = this.members.find((m) => m.uuid === uuid);
      if (member) return member;
    }

    const member = new Member(this, opts);
    this.members.push(member);

    if (idempotentKey) this.memberAliases[idempotentKey] = member.uuid;

    if (typeof key === "object" && typeof key?.init === "function")
      key.init(member);

    return member;
  }
}

export interface MemberOptions {
  name: string;
}
export class Member {
  protected simulation: SimulationHelper;

  protected _checkingAccountId: string | null = null;
  protected _name: string;
  protected _uuid: string;
  constructor(
    simulation: SimulationHelper,
    opts: MemberOptions & { uuid?: string; state?: any }
  ) {
    this.simulation = simulation;
    this._name = opts.name;
    this._uuid = opts.uuid ?? "mem-" + uuidv1();

    if (opts.state) {
      this._checkingAccountId = opts.state.checkingAccountId ?? null;
    }
  }

  toJSON() {
    return {
      state: {
        checkingAccountId: this._checkingAccountId,
      },
      name: this.name,
      uuid: this.uuid,
    };
  }

  get uuid() {
    return this._uuid;
  }
  get name() {
    return this._name;
  }

  get checkingAccountId() {
    if (this._checkingAccountId === null)
      this._checkingAccountId = this.simulation.addAccount({
        interest: null,
        label: "Checking Account of " + this.name,
        type: "checking",
      });
    return this._checkingAccountId;
  }
}

export interface Loan {
  label: string;
  interest: Interest;
  startAmount: number;
  toAccountId: string;
  startDate?: Date;
  payBack?: {
    fromAccountId?: string;
    amount: number;
    schedule: Schedule;
  };
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
