import { Account } from "./Account";
import { AccountSummary } from "./AccountSummary";
import { isScheduleNow } from "./Schedule";
import { ScheduledTransaction } from "./ScheduledTransaction";
import { Transaction } from "./Transaction";
import { v1 as uuidv1 } from "uuid";
import Debug from "debug";
import { AccountDetails } from "./AccountDetails";
/**
 * Represent an acount in which transaction can be stored, Loan can be added
 */
export class Simulation {
  protected accounts: Array<Account> = [];
  protected transactions: Array<Transaction> = [];
  protected scheduledTransactions: Array<ScheduledTransaction> = [];
  protected readonly startedOn: Date = new Date();
  protected currentDate: Date = this.startedOn;
  debug: Debug.Debugger;

  constructor() {
    this.debug = Debug("Simulation");
  }

  getCurrentDate(): Date {
    return new Date(this.currentDate);
  }

  runUntil(untilHandle: {
    (simulation: Simulation, iteration: number): boolean;
  }) {
    let iteration = 0;
    do {
      this.debug("running iteration %d", iteration);
      this.simulateNextDay();
    } while (!untilHandle(this, ++iteration));
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
        if (isScheduleNow(account.interest.calcSchedule, this.currentDate)) {
          this.debug("calculating interests on account %o", account);
          // add money to the interest to be charged
          this.addTransaction({
            amount: Math.floor(
              account.interest.rate * this.getAccountBalance(account.uuid)
            ),
            fromAccountId: "tbd-interest-calc",
            occuredOn: this.currentDate,
            toAccountId: `${account.uuid}-pending-interest`,
            type: "pending-interest",
          });
        } else {
          this.debug("not calculating interests on account %o", account);
        }
        if (isScheduleNow(account.interest.applySchedule, this.currentDate)) {
          this.debug("applying interests on account %o", account);
          // apply the interest to the principal
          this.addTransaction({
            amount: Math.floor(
              this.getAccountBalance(`${account.uuid}-pending-interest`) /
                100000
            ),
            fromAccountId: `${account.uuid}-pending-interest`,
            occuredOn: this.currentDate,
            toAccountId: account.uuid,
            type: "interest",
          });
        } else {
          this.debug("not applying interests on account %o", account);
        }
      }
    }
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

  getAccountDebits(accountId: string): Array<Transaction> {
    return this.transactions.filter((p) => p.toAccountId === accountId);
  }

  getAccountCredits(accountId: string): Array<Transaction> {
    return this.transactions.filter((p) => p.fromAccountId === accountId);
  }

  getAccountSummaries(): Array<AccountSummary> {
    return this.accounts.map((account) => {
      return {
        ...account,
        balance: this.getAccountBalance(account.uuid),
      };
    });
  }

  getAccountDetails(accountId: string): {
    balance: number;
    transactions: Array<Transaction>;
  } {
    return {
      balance: this.getAccountBalance(accountId),
      transactions: this.transactions.filter(
        (tx) => tx.toAccountId === accountId || tx.fromAccountId === accountId
      ),
    };
  }

  getAccountBalance(accountId: string) {
    return this.transactions.reduce(
      (acc, tx) =>
        acc +
        (tx.toAccountId === accountId
          ? tx.amount
          : tx.fromAccountId === accountId
          ? -1 * tx.amount
          : 0),
      0
    );
  }
}
