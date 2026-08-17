export interface Account {
  id: number;
  name: string;
  type: string;
  currency: string;
  opening_balance: number;
  current_balance: number;
  color: string | null;
  icon: string | null;
  is_archived: number;
  created_at: string;
  updated_at: string;
}

export interface createAccountDTO {
  name: string;
  type: string;
  currency: string;
  opening_balance: number;
  color?: string | null;
  icon?: string | null;
  is_archived?: number;
}

export interface updateAccountDTO {
  name: string;
  type: string;
  currency: string;
  opening_balance: number;
  color?: string | null;
  icon?: string | null;
}