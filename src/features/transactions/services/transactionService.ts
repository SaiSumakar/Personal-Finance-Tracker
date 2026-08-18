import transactionRepository from "../../../database/repositories/transactionRepository";
import accountRepository from "../../../database/repositories/accountRepository";
import categoryRepository from "../../../database/repositories/categoryRepository";
import { ErrorCodes } from "../../../constants/errorCodes";
import { ServiceResult } from "../../../types/result";
import { success, failure } from "../../../utils/result";

import {
  CreateTransactionDTO,
  Transaction,
} from "../types/transaction";

class TransactionService {
  private async validateTransaction(
    dto: CreateTransactionDTO
  ): Promise<ServiceResult<boolean>> {
    // Validate amount
    if (dto.amount <= 0) {
      return failure(
        ErrorCodes.VALIDATION_ERROR,
        "Amount must be greater than zero."
      );
    }

    // =========================
    // TRANSFER
    // =========================
    if (dto.type === "transfer") {
      if (
        dto.from_account_id == null ||
        dto.to_account_id == null
      ) {
        return failure(
          ErrorCodes.VALIDATION_ERROR,
          "Both source and destination accounts are required."
        );
      }

      if (
        dto.from_account_id === dto.to_account_id
      ) {
        return failure(
          ErrorCodes.VALIDATION_ERROR,
          "Cannot transfer to the same account."
        );
      }

      const fromAccount =
        await accountRepository.getById(
          dto.from_account_id
        );

      if (!fromAccount) {
        return failure(
          ErrorCodes.ACCOUNT_NOT_FOUND,
          "Source account not found."
        );
      }

      const toAccount =
        await accountRepository.getById(
          dto.to_account_id
        );

      if (!toAccount) {
        return failure(
          ErrorCodes.ACCOUNT_NOT_FOUND,
          "Destination account not found."
        );
      }

      return success(true);
    }

    // =========================
    // INCOME
    // =========================
    if (dto.type === "income") {
      if (dto.from_account_id != null) {
        return failure(
          ErrorCodes.VALIDATION_ERROR,
          "Income cannot have a source account."
        );
      }

      if (dto.to_account_id == null) {
        return failure(
          ErrorCodes.VALIDATION_ERROR,
          "Destination account is required."
        );
      }

      const account =
        await accountRepository.getById(
          dto.to_account_id
        );

      if (!account) {
        return failure(
          ErrorCodes.ACCOUNT_NOT_FOUND,
          "Destination account not found."
        );
      }
    }

    // =========================
    // EXPENSE
    // =========================
    if (dto.type === "expense") {
      if (dto.from_account_id == null) {
        return failure(
          ErrorCodes.VALIDATION_ERROR,
          "Source account is required."
        );
      }

      if (dto.to_account_id != null) {
        return failure(
          ErrorCodes.VALIDATION_ERROR,
          "Expense cannot have a destination account."
        );
      }

      const account =
        await accountRepository.getById(
          dto.from_account_id
        );

      if (!account) {
        return failure(
          ErrorCodes.ACCOUNT_NOT_FOUND,
          "Source account not found."
        );
      }
    }

    // =========================
    // CATEGORY
    // =========================
    if (dto.category_id == null) {
      return failure(
        ErrorCodes.VALIDATION_ERROR,
        "Category is required."
      );
    }

    const category =
      await categoryRepository.getById(
        dto.category_id
      );

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

    return success(true);
  }

  async createTransaction(
    dto: CreateTransactionDTO
  ): Promise<ServiceResult<number>> {
    try {
      const validation =
        await this.validateTransaction(dto);

      if (!validation.success) {
        return validation;
      }

      const id =
        await transactionRepository.createTransaction(dto);

      return success(id);
    } catch (error) {
      return failure(
        ErrorCodes.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : "Failed to create transaction."
      );
    }
  }

  async getTransactions(): Promise<
    ServiceResult<Transaction[]>
  > {
    try {
      const transactions =
        await transactionRepository.getAll();

      return success(transactions);
    } catch (error) {
      return failure(
        ErrorCodes.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : "Failed to load transactions."
      );
    }
  }

  async getRecentTransactions(
    limit = 10
  ): Promise<ServiceResult<Transaction[]>> {
    try {
      const transactions =
        await transactionRepository.getRecent(limit);

      return success(transactions);
    } catch (error) {
      return failure(
        ErrorCodes.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : "Failed to load recent transactions."
      );
    }
  }

  async deleteTransaction(
    id: number
  ): Promise<ServiceResult<boolean>> {
    try {
      const deleted =
        await transactionRepository.deleteTransaction(id);

      return success(deleted);
    } catch (error) {
      return failure(
        ErrorCodes.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : "Failed to delete transaction."
      );
    }
  }

  async updateTransaction(
    id: number,
    dto: CreateTransactionDTO
  ): Promise<ServiceResult<boolean>> {
    try {
      const validation =
        await this.validateTransaction(dto);

      if (!validation.success) {
        return validation;
      }

      const updated =
        await transactionRepository.updateTransaction(
          id,
          dto
        );

      return success(updated);
    } catch (error) {
      return failure(
        ErrorCodes.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : "Failed to update transaction."
      );
    }
  }
}

export default new TransactionService();