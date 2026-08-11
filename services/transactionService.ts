import transactionRepository from "../db/repositories/transactionRepository";
import accountRepository from "../db/repositories/accountRepository";
import categoryRepository from "../db/repositories/categoryRepository";
import { ErrorCodes } from "../constants/errorCodes";
import { ServiceResult } from "../types/result";
import { success, failure } from "../utils/result";

import {
    CreateTransactionDTO,
    Transaction
} from "../types/transaction";

class TransactionService {

  async createTransaction(
    dto: CreateTransactionDTO
  ): Promise<ServiceResult<number>> {

    if (dto.amount <= 0) {
      return failure(
        ErrorCodes.VALIDATION_ERROR,
        "Amount must be greater than zero."
      );
    }

    const account =
      await accountRepository.getById(dto.account_id);

    if (!account) {
      return failure(
        ErrorCodes.ACCOUNT_NOT_FOUND,
        "Account not found."
      );
    }

    const category =
      await categoryRepository.getById(dto.category_id);

    if (!category) {
      return failure(
        ErrorCodes.CATEGORY_NOT_FOUND,
        "Category not found."
      );
    }

    if (category.type !== dto.type) {
      return failure(
        ErrorCodes.VALIDATION_ERROR,
        "Category type does not match transaction type."
      );
    }

    const id = await transactionRepository.create(dto);

    return success(id);
  }

  async getTransactions(): Promise<ServiceResult<Transaction[]>> {
    try {
      const transactions = await transactionRepository.getAll();
      return success(transactions);
    } catch (error) {
      return failure(
        ErrorCodes.DATABASE_ERROR,
        error instanceof Error ? error.message : "Failed to load transactions."
      );
    }
  }

  async getRecentTransactions(limit = 10): Promise<ServiceResult<Transaction[]>> {
    try {
      const transactions = await transactionRepository.getRecent(limit);
      return success(transactions);
    } catch (error) {
      return failure(
        ErrorCodes.DATABASE_ERROR,
        error instanceof Error ? error.message : "Failed to load recent transactions."
      );
    }
  }

  async deleteTransaction(id: number): Promise<ServiceResult<boolean>> {
    try {
      const deleted = await transactionRepository.delete(id);
      return success(deleted);
    } catch (error) {
      return failure(
        ErrorCodes.DATABASE_ERROR,
        error instanceof Error ? error.message : "Failed to delete transaction."
      );
    }
  }

  async updateTransaction(
    id: number,
    dto: CreateTransactionDTO
  ): Promise<ServiceResult<boolean>> {
    try {
      const updated = await transactionRepository.update(id, dto);
      return success(updated);
    } catch (error) {
      return failure(
        ErrorCodes.DATABASE_ERROR,
        error instanceof Error ? error.message : "Failed to update transaction."
      );
    }
  }
}

export default new TransactionService();