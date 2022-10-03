export interface TransactionDetails {
  amount: number;
  fromAccountId: string;
  toAccountId: string;
  type: string;
  label?: string;
}
