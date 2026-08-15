export interface Profile {
  id: number;
  preferred_name: string;
  picture_uri: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileDTO {
  preferredName?: string;
  pictureUri?: string | null;
}

export interface ProfileStats {
  trackingSince: string;
  transactions: number;
  categoriesUsed: number;
  totalIncome: number;
  totalExpenses: number;
  currentSavings: number;
}

export interface ProfileData {
  profile: Profile;
  stats: ProfileStats;
}
