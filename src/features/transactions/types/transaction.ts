export type TransactionType =
  | "income"
  | "expense"
  | "transfer";

export interface Transaction {
  id: number;
  from_account_id: number | null;
  to_account_id: number | null;
  category_id: number | null;
  type: TransactionType;
  amount: number;
  note: string | null;
  transaction_date: string;
  payment_method: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateTransactionDTO {
  from_account_id?: number | null;
  to_account_id?: number | null;
  category_id?: number | null;
  type: TransactionType;
  amount: number;
  note?: string | null;
  transaction_date: string;
  payment_method?: string | null;
  location?: string | null;
}