import categoryRepository from "../db/repositories/categoryRepository";
import { ErrorCodes } from "../constants/errorCodes";
import { ServiceResult } from "../types/result";
import { success, failure } from "../utils/result";
import {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "../types/category";

class CategoryService {
  async getExpenseCategories(): Promise<ServiceResult<Category[]>> {
    try {
      const categories =
        await categoryRepository.getExpenseCategories();

      return success(categories);
    } catch (error) {
      return failure(
        ErrorCodes.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : "Failed to load expense categories."
      );
    }
  }

  async getIncomeCategories(): Promise<ServiceResult<Category[]>> {
    try {
      const categories =
        await categoryRepository.getIncomeCategories();

      return success(categories);
    } catch (error) {
      return failure(
        ErrorCodes.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : "Failed to load income categories."
      );
    }
  }

  async getById(
    id: number
  ): Promise<ServiceResult<Category | null>> {
    try {
      const category =
        await categoryRepository.getById(id);

      return success(category);
    } catch (error) {
      return failure(
        ErrorCodes.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : "Failed to get category."
      );
    }
  }

  async createCategory(
    dto: CreateCategoryDTO
  ): Promise<ServiceResult<Category | null>> {
    try {
      const category =
        await categoryRepository.create(dto);

      return success(category);
    } catch (error) {
      return failure(
        ErrorCodes.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : "Failed to create category."
      );
    }
  }

  async updateCategory(
    id: number,
    dto: UpdateCategoryDTO
  ): Promise<ServiceResult<Category | null>> {
    try {
      const category =
        await categoryRepository.update(id, dto);

      return success(category);
    } catch (error) {
      return failure(
        ErrorCodes.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : "Failed to update category."
      );
    }
  }

  async archiveCategory(
    id: number
  ): Promise<ServiceResult<boolean>> {
    try {
      const result =
        await categoryRepository.archive(id);

      return success(result);
    } catch (error) {
      return failure(
        ErrorCodes.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : "Failed to archive category."
      );
    }
  }

  async deleteCategory(
    id: number
  ): Promise<ServiceResult<boolean>> {
    try {
      const result =
        await categoryRepository.delete(id);

      return success(result);
    } catch (error) {
      return failure(
        ErrorCodes.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : "Failed to delete category."
      );
    }
  }
}

export default new CategoryService();