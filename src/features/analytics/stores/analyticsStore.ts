import { create } from "zustand";

import analyticsService from "../services/analyticsService";
import { AnalyticsData, AnalyticsTimePeriod } from "../types/analytics";

interface AnalyticsStore {
  data: AnalyticsData | null;
  selectedPeriod: AnalyticsTimePeriod;
  isLoading: boolean;
  error: string | null;
  fetchAnalyticsData: (period?: AnalyticsTimePeriod) => Promise<void>;
  setSelectedPeriod: (period: AnalyticsTimePeriod) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  data: null,
  selectedPeriod: "month",
  isLoading: false,
  error: null,

  fetchAnalyticsData: async (period = "month") => {
    set({ isLoading: true, error: null, selectedPeriod: period });

    try {
      const analyticsData = await analyticsService.getAnalyticsData(period);
      set({ data: analyticsData, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch analytics data";

      set({ error: errorMessage, isLoading: false });
    }
  },

  setSelectedPeriod: (period) => {
    set({ selectedPeriod: period });
  },
}));