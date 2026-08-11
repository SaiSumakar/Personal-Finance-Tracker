export interface Transaction {
  id: number;
  account_id: number;
  category_id: number;
  type: "expense" | "income" | "transfer";
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
  account_id: number;
  category_id: number;
  type: "expense" | "income" | "transfer";
  amount: number;
  note?: string;
  transaction_date: string;
  payment_method?: string;
  location?: string;
}