import { BaseRepository } from "./baseRepository";
import {
  Transaction,
  CreateTransactionDTO,
  TransactionType,
} from "../../features//transactions/types/transaction";
import accountRepository from "./accountRepository";

class TransactionRepository extends BaseRepository {
  async create(
    dto: CreateTransactionDTO,
    database?: Awaited<ReturnType<typeof this.db>>
  ) {
    try {
      const db = database ?? (await this.db());

      const now = new Date().toISOString();

      const result = await db.runAsync(
        `
          INSERT INTO transactions
          (
            from_account_id,
            to_account_id,
            category_id,
            type,
            amount,
            note,
            transaction_date,
            payment_method,
            location,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          dto.from_account_id ?? null,
          dto.to_account_id ?? null,
          dto.category_id ?? null,
          dto.type,
          dto.amount,
          dto.note ?? null,
          dto.transaction_date,
          dto.payment_method ?? null,
          dto.location ?? null,
          now,
          now,
        ]
      );

      return result.lastInsertRowId;
    } catch (error) {
      this.handleError("create transaction", error);
    }
  }

  async createTransaction(
    dto: CreateTransactionDTO
  ): Promise<number> {
    try {
      this.validateTransaction(dto);

      const db = await this.db();

      let transactionId = 0;

      await db.withExclusiveTransactionAsync(
        async (txn) => {
          transactionId = await this.create(dto, txn);

          await this.applyTransactionBalance(
            txn,
            {
              type: dto.type,
              amount: dto.amount,
              from_account_id:
                dto.from_account_id ?? null,
              to_account_id:
                dto.to_account_id ?? null,
            }
          );
        }
      );

      return transactionId;
    } catch (error) {
      this.handleError("Create transaction", error);
      throw error;
    }
  }

  async getAll(): Promise<Transaction[]> {
    try {
      const db = await this.db();

      return db.getAllAsync<Transaction>(`
        SELECT *
        FROM transactions
        WHERE deleted_at IS NULL
        ORDER BY transaction_date DESC,
                id DESC;
      `);
    } catch (error) {
      this.handleError("Get all transactions", error);
    }
  }

  async getRecent(
    limit = 10
  ): Promise<Transaction[]> {
    try {
      const db = await this.db();

      return db.getAllAsync<Transaction>(
        `
          SELECT *
          FROM transactions
          WHERE deleted_at IS NULL
          ORDER BY transaction_date DESC,
                  id DESC
          LIMIT ?;
        `,
        [limit]
      );
    } catch (error) {
      this.handleError(
        "Get recent transactions",
        error
      );
    }
  }

  async getById(id: number) {
    try {
      const db = await this.db();

      const transaction =
        await db.getFirstAsync<Transaction>(
          `
            SELECT *
            FROM transactions
            WHERE id = ?
            AND deleted_at IS NULL;
          `,
          [id]
        );

      return transaction ?? null;
    } catch (error) {
      this.handleError(
        "Get transactions by id",
        error
      );
    }
  }

  async update(
    id: number,
    dto: CreateTransactionDTO,
    database?: Awaited<ReturnType<typeof this.db>>
  ): Promise<boolean> {
    try {
      const db = database ?? (await this.db());

      const result = await db.runAsync(
        `
          UPDATE transactions
          SET
            from_account_id = ?,
            to_account_id = ?,
            category_id = ?,
            type = ?,
            amount = ?,
            note = ?,
            transaction_date = ?,
            payment_method = ?,
            location = ?,
            updated_at = ?
          WHERE id = ?
          AND deleted_at IS NULL;
        `,
        [
          dto.from_account_id ?? null,
          dto.to_account_id ?? null,
          dto.category_id ?? null,
          dto.type,
          dto.amount,
          dto.note ?? null,
          dto.transaction_date,
          dto.payment_method ?? null,
          dto.location ?? null,
          new Date().toISOString(),
          id,
        ]
      );

      return result.changes > 0;
    } catch (error) {
      this.handleError(
        "update transaction",
        error
      );

      throw error;
    }
  }

  async updateTransaction(
    id: number,
    dto: CreateTransactionDTO
  ): Promise<boolean> {
    try {
      this.validateTransaction(dto);

      const db = await this.db();

      let updated = false;

      await db.withExclusiveTransactionAsync(
        async (txn) => {
          const oldTransaction =
            await txn.getFirstAsync<Transaction>(
              `
                SELECT *
                FROM transactions
                WHERE id = ?
                AND deleted_at IS NULL;
              `,
              [id]
            );

          if (!oldTransaction) {
            throw new Error(
              "Transaction not found."
            );
          }

          // Reverse the old transaction
          await this.applyTransactionBalance(
            txn,
            oldTransaction,
            -1
          );

          // Update the transaction
          updated = await this.update(
            id,
            dto,
            txn
          );

          if (!updated) {
            throw new Error(
              "Failed to update transaction."
            );
          }

          // Apply the new transaction
          await this.applyTransactionBalance(
            txn,
            {
              type: dto.type,
              amount: dto.amount,
              from_account_id:
                dto.from_account_id ?? null,
              to_account_id:
                dto.to_account_id ?? null,
            },
            1
          );
        }
      );

      return updated;
    } catch (error) {
      this.handleError(
        "Update transaction",
        error
      );

      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const db = await this.db();

      await db.runAsync(
        `
          UPDATE transactions
          SET deleted_at = ?
          WHERE id = ?;
        `,
        [
          new Date().toISOString(),
          id,
        ]
      );

      return true;
    } catch (error) {
      this.handleError(
        "delete transactions",
        error
      );
    }
  }

  async deleteTransaction(
    id: number
  ): Promise<boolean> {
    try {
      const db = await this.db();

      let deleted = false;

      await db.withExclusiveTransactionAsync(
        async (txn) => {
          const transaction =
            await txn.getFirstAsync<Transaction>(
              `
                SELECT *
                FROM transactions
                WHERE id = ?
                AND deleted_at IS NULL;
              `,
              [id]
            );

          if (!transaction) {
            throw new Error(
              "Transaction not found."
            );
          }

          // Reverse the transaction's balance effect
          await this.applyTransactionBalance(
            txn,
            transaction,
            -1
          );

          const now =
            new Date().toISOString();

          const result = await txn.runAsync(
            `
              UPDATE transactions
              SET
                deleted_at = ?,
                updated_at = ?
              WHERE id = ?
              AND deleted_at IS NULL;
            `,
            [
              now,
              now,
              id,
            ]
          );

          if (result.changes === 0) {
            throw new Error(
              "Failed to delete transaction."
            );
          }

          deleted = true;
        }
      );

      return deleted;
    } catch (error) {
      this.handleError(
        "Delete transaction",
        error
      );

      throw error;
    }
  }

  private async applyTransactionBalance(
    db: Awaited<ReturnType<typeof this.db>>,
    transaction: {
      type: TransactionType;
      amount: number;
      from_account_id: number | null;
      to_account_id: number | null;
    },
    multiplier: 1 | -1 = 1
  ): Promise<void> {
    if (transaction.type === "income") {
      if (transaction.to_account_id == null) {
        throw new Error(
          "Destination account is required for income."
        );
      }

      const updated =
        await accountRepository.updateBalance(
          db,
          transaction.to_account_id,
          transaction.amount * multiplier
        );

      if (!updated) {
        throw new Error(
          "Failed to update account balance."
        );
      }

      return;
    }

    if (transaction.type === "expense") {
      if (transaction.from_account_id == null) {
        throw new Error(
          "Source account is required for expense."
        );
      }

      const updated =
        await accountRepository.updateBalance(
          db,
          transaction.from_account_id,
          -transaction.amount * multiplier
        );

      if (!updated) {
        throw new Error(
          "Failed to update account balance."
        );
      }

      return;
    }

    if (
      transaction.from_account_id == null ||
      transaction.to_account_id == null
    ) {
      throw new Error(
        "Transfer must have both source and destination accounts."
      );
    }

    if (
      transaction.from_account_id ===
      transaction.to_account_id
    ) {
      throw new Error(
        "Cannot transfer to the same account."
      );
    }

    const debited =
      await accountRepository.updateBalance(
        db,
        transaction.from_account_id,
        -transaction.amount * multiplier
      );

    if (!debited) {
      throw new Error(
        "Failed to update source account balance."
      );
    }

    const credited =
      await accountRepository.updateBalance(
        db,
        transaction.to_account_id,
        transaction.amount * multiplier
      );

    if (!credited) {
      throw new Error(
        "Failed to update destination account balance."
      );
    }
  }

  private validateTransaction(
    dto: CreateTransactionDTO
  ): void {
    if (dto.type === "income") {
      if (dto.from_account_id != null) {
        throw new Error(
          "Income transaction cannot have a source account."
        );
      }

      if (dto.to_account_id == null) {
        throw new Error(
          "Destination account is required for income."
        );
      }

      return;
    }

    if (dto.type === "expense") {
      if (dto.from_account_id == null) {
        throw new Error(
          "Source account is required for expense."
        );
      }

      if (dto.to_account_id != null) {
        throw new Error(
          "Expense transaction cannot have a destination account."
        );
      }

      return;
    }

    if (dto.type === "transfer") {
      if (
        dto.from_account_id == null ||
        dto.to_account_id == null
      ) {
        throw new Error(
          "Both source and destination accounts are required."
        );
      }

      if (
        dto.from_account_id ===
        dto.to_account_id
      ) {
        throw new Error(
          "Cannot transfer to the same account."
        );
      }

      return;
    }

    throw new Error(
      "Invalid transaction type."
    );
  }
}

export default new TransactionRepository();