import { BaseRepository } from "./baseRepository";
import {
  Transaction,
  CreateTransactionDTO,
} from "../../features//transactions/types/transaction";

class TransactionRepository extends BaseRepository {
  async create(dto: CreateTransactionDTO) {
    try {
      const db = await this.db();

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
    dto: CreateTransactionDTO
  ): Promise<boolean> {
    try {
      const db = await this.db();

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
}

export default new TransactionRepository();