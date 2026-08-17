import { BaseRepository } from "./baseRepository";
import {
  Transaction,
  CreateTransactionDTO,
} from "../../features//transactions/types/transaction";
import accountRepository from "./accountRepository";

class TransactionRepository extends BaseRepository {
  async create(dto: CreateTransactionDTO, database?: Awaited<ReturnType<typeof this.db>>) {
    try {
      const db = database ?? (await this.db());

      const now = new Date().toISOString();

      const result = await db.runAsync(
        `
        INSERT INTO transactions
        (
          account_id,
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          dto.account_id,
          dto.category_id,
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
      const db = await this.db();

      let transactionId = 0;

      await db.withExclusiveTransactionAsync(async (txn) => {
        // Create transaction using the transaction connection
        transactionId = await this.create(dto, txn);

        // Income increases balance
        // Expense decreases balance
        const balanceChange =
          dto.type === "income"
            ? dto.amount
            : -dto.amount;

        // Update account using the SAME transaction
        const updated =
          await accountRepository.updateBalance(
            txn,
            dto.account_id,
            balanceChange
          );

        if (!updated) {
          throw new Error(
            "Failed to update account balance."
          );
        }
      });

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

  async getRecent(limit = 10): Promise<Transaction[]> {
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
      this.handleError("Get recent transactions", error);
    }
  }

  async getById(id: number) {
    try {
      const db = await this.db();

      const transaction = await db.getFirstAsync<Transaction>(
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
      this.handleError("Get transactions by id", error); 
    }
  }

  async update(
    id: number,
    dto: CreateTransactionDTO,
    database?: Awaited<ReturnType<typeof this.db>>
  ): Promise<boolean> {
    try {
      const db = database ?? (await this.db());

      await db.runAsync(
        `
        UPDATE transactions
        SET
          account_id = ?,
          category_id = ?,
          type = ?,
          amount = ?,
          note = ?,
          transaction_date = ?,
          payment_method = ?,
          location = ?,
          updated_at = ?
        WHERE id = ?;
        `,
        [
          dto.account_id,
          dto.category_id,
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

      return true;
    } catch (error) {
      this.handleError("update transactions", error); 
    }
  }

  async updateTransaction(
    id: number,
    dto: CreateTransactionDTO
  ): Promise<boolean> {
    try {
      const db = await this.db();

      let updated = false;

      await db.withExclusiveTransactionAsync(async (txn) => {
        // Get the existing transaction first
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
          throw new Error("Transaction not found.");
        }

        // Reverse the old transaction's effect on the account
        const oldBalanceChange =
          oldTransaction.type === "income"
            ? oldTransaction.amount
            : -oldTransaction.amount;

        const reversed =
          await accountRepository.updateBalance(
            txn,
            oldTransaction.account_id,
            -oldBalanceChange
          );

        if (!reversed) {
          throw new Error(
            "Failed to reverse old account balance."
          );
        }

        // Update transaction using the SAME transaction connection
        updated = await this.update(id, dto, txn);

        if (!updated) {
          throw new Error(
            "Failed to update transaction."
          );
        }

        // Apply the new transaction's effect
        const newBalanceChange =
          dto.type === "income"
            ? dto.amount
            : -dto.amount;

        const applied =
          await accountRepository.updateBalance(
            txn,
            dto.account_id,
            newBalanceChange
          );

        if (!applied) {
          throw new Error(
            "Failed to update new account balance."
          );
        }
      });

      return updated;
    } catch (error) {
      this.handleError("Update transaction", error);
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
      this.handleError("delete transactions", error);   
    }
  }

  async deleteTransaction(id: number): Promise<boolean> {
    try {
      const db = await this.db();

      let deleted = false;

      await db.withExclusiveTransactionAsync(async (txn) => {
        // Get the existing transaction first
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
          throw new Error("Transaction not found.");
        }

        // Determine the transaction's original effect
        const balanceChange =
          transaction.type === "income"
            ? transaction.amount
            : -transaction.amount;

        // Reverse the transaction's effect
        const reversed =
          await accountRepository.updateBalance(
            txn,
            transaction.account_id,
            -balanceChange
          );

        if (!reversed) {
          throw new Error(
            "Failed to update account balance."
          );
        }

        // Soft delete the transaction
        const result = await txn.runAsync(
          `
          UPDATE transactions
          SET deleted_at = ?,
              updated_at = ?
          WHERE id = ?
          AND deleted_at IS NULL;
          `,
          [
            new Date().toISOString(),
            new Date().toISOString(),
            id,
          ]
        );

        if (result.changes === 0) {
          throw new Error(
            "Failed to delete transaction."
          );
        }

        deleted = true;
      });

      return deleted;
    } catch (error) {
      this.handleError("Delete transaction", error);
    }
  }
}

export default new TransactionRepository();