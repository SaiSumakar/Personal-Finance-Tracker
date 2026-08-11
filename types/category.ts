export interface Category {
  id: number;
  name: string;
  type: "expense" | "income";
  icon: string | null;
  color: string | null;
  parent_id: number | null;
  is_default: 0 | 1;
  is_archived: 0 | 1;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateCategoryDTO {
  name: string;
  type: "expense" | "income";
  icon?: string | null;
  color?: string | null;
  parent_id?: number | null;
  is_default?: 0 | 1;
  is_archived?: 0 | 1;
}

export interface UpdateCategoryDTO {
  name?: string;
  type?: "expense" | "income";
  icon?: string | null;
  color?: string | null;
  parent_id?: number | null;
  is_default?: 0 | 1;
  is_archived?: 0 | 1;
}