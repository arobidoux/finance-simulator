import { Account } from "./Account";
import { AccountSummary } from "./AccountSummary";
import { getDayDiff, isScheduleNow } from "./Schedule";
import { ScheduledTransaction } from "./ScheduledTransaction";
import { Transaction } from "./Transaction";
import { v1 as uuidv1 } from "uuid";
import Debug from "debug";
import { Interest } from "./Interest";
/**
 * Represent an acount in which transaction can be stored, Loan can be added
 */

export interface InterestCalculatorHandle {
  (interest: Interest, balance: number, now: Date): number;
}

export interface SimulationOptions {
  interestRatePrecision?: number;
}
export class Simulation {
  protected accounts: Array<Account> = [];
  protected transactions: Array<Transaction> = [];
  protected scheduledTransactions: Array<ScheduledTransaction> = [];
  protected readonly startedOn: Date = new Date();
  protected currentDate: Date = this.startedOn;
  protected interestCalculators: Record<string, InterestCalculatorHandle> = {};
  protected _tick: number = 0;
  protected _interestRatePrecision: number = 1000;
  debug: Debug.Debugger;

  constructor(prevState?: string | SimulationOptions) {
    this.debug = Debug("Simulation");
    this.defineInterestCalculator(
      "full",
      (interest, balance) => balance * interest.rate
    );

    if (typeof prevState === "string") {
      console.debug("reviving prev state");
      const state = this.reviveState(prevState);
      this.startedOn = state.startedOn;
      this.currentDate = state.currentDate;
    } else if (prevState) {
      if (typeof prevState.interestRatePrecision !== "undefined") {
        this._interestRatePrecision = prevState.interestRatePrecision;
      }
    }
  }

  get interestRatePrecision() {
    return this._interestRatePrecision;
  }

  get tick(): number {
    return this._tick;
  }

  fork() {
    return new Simulation(JSON.stringify(this));
  }

  protected reviveState(prevState: string) {
    const state = JSON.parse(prevState, function reInflateDates(key, value) {
      return [
        "startedOn",
        "currentDate",
        "startAt",
        "at",
        "occuredOn",
        "createdOn",
      ].includes(key)
        ? new Date(value)
        : value;
    });
    this._tick = state.tick;
    this._interestRatePrecision = state.interestRatePrecision;
    this.accounts = state.accounts;
    this.transactions = state.transactions;
    this.scheduledTransactions = state.scheduledTransactions;
    return state;
  }

  toJSON() {
    console.debug("formating to json");
    return {
      startedOn: this.startedOn,
      tick: this._tick,
      interestRatePrecision: this._interestRatePrecision,
      currentDate: this.currentDate,
      accounts: this.accounts,
      transactions: this.transactions,
      scheduledTransactions: this.scheduledTransactions,
    };
  }

  getCurrentDate(): Date {
    return new Date(this.currentDate);
  }

  getSimulationAge(): number {
    return getDayDiff(this.startedOn, this.currentDate);
  }

  runUntil(untilHandle: {
    (simulation: Simulation, iteration: number): boolean;
  }) {
    let iteration = 0;
    while (!untilHandle(this, ++iteration)) {
      this.debug("running iteration %d", iteration);
      this.simulateNextDay();
    }
    this.debug("running stopped at iteration %d", iteration);
    return iteration;
  }

  async asyncRunUntil(untilHandle: {
    (simulation: Simulation, iteration: number): boolean | Promise<boolean>;
  }) {
    let iteration = 0;
    while (!(await untilHandle(this, ++iteration))) {
      this.debug("running iteration %d", iteration);
      this.simulateNextDay();
    }
    this.debug("running stopped at iteration %d", iteration);
    return iteration;
  }

  simulateNextDay() {
    this.currentDate = new Date(
      this.currentDate.getTime() + 24 * 60 * 60 * 1000
    );
    this.debug("simulating %o", this.currentDate);
    this.tickTransactions();
    this.tickInterests();
    this._tick++;
  }

  tickTransactions() {
    this.debug("Ticking transactions for %o", this.currentDate);
    for (const scheduledTransaction of this.scheduledTransactions) {
      if (isScheduleNow(scheduledTransaction.schedule, this.currentDate)) {
        this.debug("running transaction %o", scheduledTransaction);
        this.addTransaction({
          ...scheduledTransaction.details,
          occuredOn: this.currentDate,
        });
      } else {
        this.debug("ignoring transaction %o", scheduledTransaction);
      }
    }
  }

  tickInterests() {
    this.debug("ticking interests for %o", this.currentDate);
    for (const account of this.accounts) {
      if (account.interest) {
        const getCalcTransaction = (interest: Interest) => {
          const interestApplyType = interest.applyRate ?? "full";
          if (!(interestApplyType in this.interestCalculators))
            throw new Error(
              "Invalid interest applyRate value " + interestApplyType
            );

          return {
            amount: this.interestCalculators[interestApplyType](
              interest,
              this.getAccountBalance(account.uuid),
              this.currentDate
            ),
            fromAccountId: "tbd-interest-calc",
            occuredOn: this.currentDate,
          };
        };
        if ("calc" in account.interest.schedule) {
          const pendingInterestAccountId = `${account.uuid}-pending-interest`;
          if (isScheduleNow(account.interest.schedule.calc, this.currentDate)) {
            this.debug("calculating interests on account %o", account);
            // add money to the interest to be charged
            this.addTransaction({
              ...getCalcTransaction(account.interest),
              toAccountId: pendingInterestAccountId,
              type: "pending-interest",
            });
          } else {
            this.debug("not calculating interests on account %o", account);
          }
          if (
            isScheduleNow(account.interest.schedule.apply, this.currentDate)
          ) {
            this.debug("applying interests on account %o", account);
            // apply the interest to the principal
            this.addTransaction({
              amount: Math.floor(
                this.getAccountBalance(pendingInterestAccountId) /
                  (100 * this._interestRatePrecision)
              ),
              fromAccountId: pendingInterestAccountId,
              occuredOn: this.currentDate,
              toAccountId: account.uuid,
              type: "interest",
            });
          } else {
            this.debug("not applying interests on account %o", account);
          }
        } else {
          this.debug("applying interests on account %o", account);
          const baseTx = getCalcTransaction(account.interest);
          this.addTransaction({
            ...baseTx,
            amount: Math.floor(
              baseTx.amount / (100 * this._interestRatePrecision)
            ),
            toAccountId: account.uuid,
            type: "interest",
          });
        }
      }
    }
  }

  defineInterestCalculator(alias: string, handle: InterestCalculatorHandle) {
    this.interestCalculators[alias] = handle;
  }

  addAccount(account: Omit<Account, "uuid">): string {
    const uuid = "act-" + uuidv1();
    this.accounts.push({ ...account, uuid });
    this.debug("adding account %s %o", uuid, account);
    return uuid;
  }
  addTransaction(transaction: Omit<Transaction, "uuid">): string {
    const uuid = "tx-" + uuidv1();
    this.transactions.push({ ...transaction, uuid });
    this.debug("adding transaction %s %o", uuid, transaction);
    return uuid;
  }
  addScheduledTransaction(
    scheduledTransaction: Omit<ScheduledTransaction, "uuid">
  ): string {
    const uuid = "sx-" + uuidv1();
    this.scheduledTransactions.push({ ...scheduledTransaction, uuid });
    this.debug(
      "adding scheduled transaction %s %o",
      uuid,
      scheduledTransaction
    );
    return uuid;
  }

  getAccountDebits(
    accountId: string,
    opts?: { until?: Date }
  ): Array<Transaction> {
    let filter: TransactionFilterHandle;
    const filterAccount = (filter = curryFilterTransactionToAccount(accountId));
    if (opts?.until) {
      const filterUntil = curryFilterTransactionUntil(opts.until);
      filter = (p: Transaction) => filterAccount(p) && filterUntil(p);
    }

    return this.transactions.filter(filter);
  }

  getAccountCredits(
    accountId: string,
    opts?: { until?: Date }
  ): Array<Transaction> {
    let filter: TransactionFilterHandle;
    const filterAccount = (filter =
      curryFilterTransactionFromAccount(accountId));
    if (opts?.until) {
      const filterUntil = curryFilterTransactionUntil(opts.until);
      filter = (p: Transaction) => filterAccount(p) && filterUntil(p);
    }
    return this.transactions.filter(filter);
  }

  getAccountSummaries(opts?: { until?: Date }): Array<AccountSummary> {
    return this.accounts.map((account) => {
      return {
        ...account,
        balance: this.getAccountBalance(account.uuid, opts),
      };
    });
  }

  getAccountMeta(accountId: string): {
    interest: Interest | null;
    label: string;
    type: string;
  } {
    const account = this.accounts.find((a) => a.uuid === accountId);
    if (account) {
      return {
        interest: account.interest,
        label: account.label,
        type: account.type,
      };
    }
    return {
      interest: null,
      label: "**" + accountId,
      type: "un-registered",
    };
  }

  getAccountDetails(
    accountId: string,
    opts?: { until?: Date }
  ): {
    balance: number;
    transactions: Array<Transaction>;
  } {
    const filterUntil = curryFilterTransactionUntil(opts?.until);
    return {
      balance: this.getAccountBalance(accountId, opts),
      transactions: this.transactions.filter(
        (tx) =>
          filterUntil(tx) &&
          (tx.toAccountId === accountId || tx.fromAccountId === accountId)
      ),
    };
  }

  getAccountBalance(accountId: string, opts?: { until?: Date }) {
    const filterUntil = curryFilterTransactionUntil(opts?.until);
    return this.transactions.reduce(
      (acc, tx) =>
        acc +
        (!filterUntil(tx)
          ? 0
          : tx.toAccountId === accountId
          ? tx.amount
          : tx.fromAccountId === accountId
          ? -1 * tx.amount
          : 0),
      0
    );
  }
}

interface TransactionFilterHandle {
  (tx: Transaction): boolean;
}
function curryFilterTransactionToAccount(
  accountId: string
): TransactionFilterHandle {
  return (tx: Transaction) => tx.toAccountId === accountId;
}

function curryFilterTransactionFromAccount(
  accountId: string
): TransactionFilterHandle {
  return (tx: Transaction) => tx.fromAccountId === accountId;
}
function curryFilterTransactionUntil(until?: Date): TransactionFilterHandle {
  return typeof until === "undefined"
    ? (tx: Transaction) => true
    : (tx: Transaction) => tx.occuredOn <= until;
}
