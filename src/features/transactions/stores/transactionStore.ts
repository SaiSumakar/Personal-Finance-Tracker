import { create } from "zustand";
import transactionService from "../services/transactionService";
import {
  Transaction,
  CreateTransactionDTO,
} from "../types/transaction";

interface TransactionStore {
  transactions: Transaction[];
  recentTransactions: Transaction[];
  selectedTransaction: Transaction | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  loadTransactions: () => Promise<void>;
  loadRecentTransactions: () => Promise<void>;
  addTransaction: (
    dto: CreateTransactionDTO
  ) => Promise<boolean>;
  updateTransaction: (
    id: number,
    dto: CreateTransactionDTO
  ) => Promise<boolean>;
  deleteTransaction: (
    id: number
  ) => Promise<boolean>;
  selectTransaction: (
    transaction: Transaction | null
  ) => void;
  clearError: () => void;
}

export const useTransactionStore =
create<TransactionStore>((set, get) => ({
  transactions: [],
  recentTransactions: [],
  selectedTransaction: null,
  loading: false,
  refreshing: false,
  error: null,
  async loadTransactions() {
    set({
      loading: true,
      error: null,
    });

    const result =
      await transactionService.getTransactions();

    if (!result.success) {
      set({
        loading: false,
        error: result.error.message,
      });
      return;
    }

    set({
      loading: false,
      transactions: result.data,
    });

  },

  async loadRecentTransactions() {
    const result =
      await transactionService.getRecentTransactions();

    if (!result.success) {
      set({
        error: result.error.message,
      });
      return;
    }

    set({
      recentTransactions: result.data,
    });
  },

  async addTransaction(dto) {
    const result =
      await transactionService.createTransaction(dto);

    if (!result.success) {
      set({
        error: result.error.message,
      });
      return false;
    }

    await get().loadTransactions();
    await get().loadRecentTransactions();

    return true;
  },

  async updateTransaction(id, dto) {
    const result =
      await transactionService.updateTransaction(id, dto);

    if (!result.success) {
      set({
        error: result.error.message,
      });

      return false;
    }

    await get().loadTransactions();
    await get().loadRecentTransactions();

    return true;
  },

  async deleteTransaction(id) {
    const result =
      await transactionService.deleteTransaction(id);

    if (!result.success) {
      set({
        error: result.error.message,
      });

      return false;
    }

    await get().loadTransactions();
    await get().loadRecentTransactions();

    return true;
  },

  selectTransaction(transaction) {
    set({
      selectedTransaction: transaction,
    });
  },

  clearError() {
    set({
      error: null,
    });
  },
}));