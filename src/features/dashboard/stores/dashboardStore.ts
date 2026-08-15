import { create } from "zustand";

import dashboardService from "../services/dashboardService";
import { DashboardData } from "../types/dashboard";

interface DashboardStore {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const dashboardData = await dashboardService.getDashboardData();
      set({ data: dashboardData, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch dashboard data";
      set({ error: errorMessage, isLoading: false });
    }
  },
}));
