import { BaseRepository } from "./baseRepository";
import { Account, createAccountDTO, updateAccountDTO } from "../../features/accounts/types/account";

class AccountRepository extends BaseRepository {
  async getAll(): Promise<Account[]> {
    try {
      const db = await this.db();

      return await db.getAllAsync<Account>(`
        SELECT *
        FROM accounts
        WHERE is_archived = 0
        ORDER BY name;
      `);
    } catch (error) {
      this.handleError("Get all accounts", error); 
    }
  }

  async getById(id: number): Promise<Account | null> {
    try {
      const db = await this.db();

      const account = await db.getFirstAsync<Account>(
        `
        SELECT *
        FROM accounts
        WHERE id = ?;
        `,
        [id]
      );

      return account ?? null;
    } catch (error) {
      this.handleError("Get Account by ID", error); 
    }
  }

  async getDefault(): Promise<Account | null> {
    try {
      const db = await this.db();

      const account = await db.getFirstAsync<Account>(`
        SELECT *
        FROM accounts
        WHERE is_archived = 0
        ORDER BY id
        LIMIT 1;
      `);

      return account ?? null;
    } catch (error) {
      this.handleError("Get default", error); 
    }
  }

  async create(dto: createAccountDTO): Promise<Account | null> {
    try {
      const db = await this.db();
      const now = new Date().toISOString();

      const result = await db.runAsync(`
        INSERT INTO accounts
        (
          name,
          type,
          currency,
          opening_balance,
          current_balance,
          color,
          icon,
          is_archived,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          dto.name,
          dto.type,
          dto.currency,
          dto.opening_balance,
          dto.opening_balance,
          dto.color ?? null,
          dto.icon ?? null,
          dto.is_archived ?? 0,
          now,
          now,
        ]
      );

      const accountId = result.lastInsertRowId as number;
      return await this.getById(accountId);
    } catch (error) {
      this.handleError("create account", error);
    }
  }

  async update(
    id: number,
    dto: updateAccountDTO
  ): Promise<Account | null> {
    try {
      const db = await this.db();
      const now = new Date().toISOString();

      const existingAccount = await this.getById(id);

      if (!existingAccount) {
        return null;
      }

      const openingBalanceDifference =
        dto.opening_balance - existingAccount.opening_balance;

      const newCurrentBalance =
        existingAccount.current_balance +
        openingBalanceDifference;

      await db.runAsync(
        `
        UPDATE accounts
        SET
          name = ?,
          type = ?,
          currency = ?,
          opening_balance = ?,
          current_balance = ?,
          color = ?,
          icon = ?,
          updated_at = ?
        WHERE id = ?;
        `,
        [
          dto.name,
          dto.type,
          dto.currency,
          dto.opening_balance,
          newCurrentBalance,
          dto.color ?? null,
          dto.icon ?? null,
          now,
          id,
        ]
      );

      return await this.getById(id);
    } catch (error) {
      this.handleError("Update account", error);
    }
  }

  async archive(id: number): Promise<boolean> {
    try {
      const db = await this.db();
      const now = new Date().toISOString();

      await db.runAsync(
        `
        UPDATE accounts
        SET is_archived = 1,
            updated_at = ?
        WHERE id = ?;
        `,
        [now, id]
      );

      return true;
    } catch (error) {
      this.handleError("Archive account", error);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const db = await this.db();

      await db.runAsync(
        `
        DELETE FROM accounts
        WHERE id = ?;
        `,
        [id]
      );

      return true;
    } catch (error) {
      this.handleError("Delete account", error);
    }
  }
}

export default new AccountRepository();