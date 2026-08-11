import { create } from "zustand";
import categoryService from "../services/categoryService";
import {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "../types/category";

interface CategoryStore {
  expenseCategories: Category[];
  incomeCategories: Category[];
  loading: boolean;
  error: string | null;

  loadCategories: () => Promise<void>;

  addCategory: (
    dto: CreateCategoryDTO
  ) => Promise<boolean>;

  updateCategory: (
    id: number,
    dto: UpdateCategoryDTO
  ) => Promise<boolean>;

  archiveCategory: (
    id: number
  ) => Promise<boolean>;

  deleteCategory: (
    id: number
  ) => Promise<boolean>;
}

export const useCategoryStore =
  create<CategoryStore>((set, get) => ({
    expenseCategories: [],
    incomeCategories: [],
    loading: false,
    error: null,

    async loadCategories() {
      set({
        loading: true,
        error: null,
      });

      const expense =
        await categoryService.getExpenseCategories();

      const income =
        await categoryService.getIncomeCategories();

      if (
        !expense.success ||
        !income.success
      ) {
        set({
          loading: false,
        });

        return;
      }

      set({
        loading: false,
        expenseCategories: expense.data,
        incomeCategories: income.data,
        error: null,
      });
    },

    async addCategory(dto) {
      const result =
        await categoryService.createCategory(dto);

      if (!result.success) {
        set({ error: result.error.message });

        return false;
      }

      await get().loadCategories();

      return true;
    },

    async updateCategory(id, dto) {
      const result =
        await categoryService.updateCategory(
          id,
          dto
        );

      if (!result.success) {
        set({ error: result.error.message });

        return false;
      }

      await get().loadCategories();

      return true;
    },

    async archiveCategory(id) {
      const result =
        await categoryService.archiveCategory(id);

      if (!result.success) {
        set({ error: result.error.message });

        return false;
      }

      await get().loadCategories();

      return true;
    },

    async deleteCategory(id) {
      const result =
        await categoryService.deleteCategory(id);

      if (!result.success) {
        set({ error: result.error.message });

        return false;
      }

      await get().loadCategories();

      return true;
    },
  }));