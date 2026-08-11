import { BaseRepository } from "./baseRepository";
import {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "../../types/category";

class CategoryRepository extends BaseRepository {
  async getExpenseCategories() {
    try {
      const db = await this.db();

      return db.getAllAsync<Category>(
        `
        SELECT *
        FROM categories
        WHERE type = ?
          AND is_archived = 0
        ORDER BY name;
        `,
        ["expense"]
      );
    } catch (error) {
      this.handleError("Get expense categories", error);
    }
  }

  async getIncomeCategories() {
    try {
      const db = await this.db();

      return db.getAllAsync<Category>(
        `
        SELECT *
        FROM categories
        WHERE type = ?
          AND is_archived = 0
        ORDER BY name;
        `,
        ["income"]
      );
    } catch (error) {
      this.handleError("Get income categories", error);
    }
  }

  async getById(id: number) {
    try {
      const db = await this.db();

      const category = await db.getFirstAsync<Category>(
        `
        SELECT *
        FROM categories
        WHERE id = ?;
        `,
        [id]
      );

      return category ?? null;
    } catch (error) {
      this.handleError("Get category by id", error);
    }
  }

  async create(dto: CreateCategoryDTO) {
    try {
      const db = await this.db();
      const now = new Date().toISOString();

      const isDefault = dto.is_default ?? 1;
      const isArchived = dto.is_archived ?? 0;

      const result = await db.runAsync(
        `
        INSERT INTO categories (
          name,
          type,
          icon,
          color,
          parent_id,
          is_default,
          is_archived,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          dto.name,
          dto.type,
          dto.icon ?? null,
          dto.color ?? null,
          dto.parent_id ?? null,
          isDefault,
          isArchived,
          now,
          now,
        ]
      );

      return this.getById(result.lastInsertRowId);
    } catch (error) {
      this.handleError("Create category", error);
    }
  }

  async update(id: number, dto: UpdateCategoryDTO) {
    try {
      const db = await this.db();

      const fields: string[] = [];
      const params: (string | number | null)[] = [];

      if (dto.name !== undefined) {
        fields.push("name = ?");
        params.push(dto.name);
      }

      if (dto.type !== undefined) {
        fields.push("type = ?");
        params.push(dto.type);
      }

      if (dto.icon !== undefined) {
        fields.push("icon = ?");
        params.push(dto.icon);
      }

      if (dto.color !== undefined) {
        fields.push("color = ?");
        params.push(dto.color);
      }

      if (dto.parent_id !== undefined) {
        fields.push("parent_id = ?");
        params.push(dto.parent_id);
      }

      if (dto.is_default !== undefined) {
        fields.push("is_default = ?");
        params.push(dto.is_default);
      }

      if (dto.is_archived !== undefined) {
        fields.push("is_archived = ?");
        params.push(dto.is_archived);
      }

      // Nothing to update
      if (fields.length === 0) {
        return this.getById(id);
      }

      fields.push("updated_at = ?");
      params.push(new Date().toISOString());

      params.push(id);

      await db.runAsync(
        `
        UPDATE categories
        SET ${fields.join(", ")}
        WHERE id = ?;
        `,
        params
      );

      return this.getById(id);
    } catch (error) {
      this.handleError("Update category", error);
    }
  }

  async archive(id: number): Promise<boolean> {
    try {
      const db = await this.db();
      const now = new Date().toISOString();

      await db.runAsync(
        `
        UPDATE categories
        SET is_archived = 1,
            updated_at = ?
        WHERE id = ?;
        `,
        [now, id]
      );

      return true;
    } catch (error) {
      this.handleError("Archive category", error);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const db = await this.db();

      await db.runAsync(
        `
        DELETE FROM categories
        WHERE id = ?;
        `,
        [id]
      );

      return true;
    } catch (error) {
      this.handleError("Delete category", error);
    }
  }
}

export default new CategoryRepository();