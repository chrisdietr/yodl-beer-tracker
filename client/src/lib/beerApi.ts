import { apiRequest } from "./queryClient";
import { StatsResponse, DrinkerWithStats, TimeSeriesData } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

// API endpoints
const API_ENDPOINTS = {
  stats: "/api/stats",
  leaderboard: "/api/leaderboard",
  timeSeries: "/api/stats/timeseries",
  consumptions: "/api/consumptions",
  drinkers: "/api/drinkers",
  webhook: "/api/webhook/beer"
};

// Hook to fetch app stats
export function useAppStats() {
  return useQuery<StatsResponse>({
    queryKey: [API_ENDPOINTS.stats],
  });
}

// Hook to fetch leaderboard
export function useLeaderboard() {
  return useQuery<DrinkerWithStats[]>({
    queryKey: [API_ENDPOINTS.leaderboard],
  });
}

// Hook to fetch time series data
export function useTimeSeriesData(timeRange: 'hour' | 'day' | 'all') {
  return useQuery<TimeSeriesData[]>({
    queryKey: [API_ENDPOINTS.timeSeries, timeRange],
    queryFn: async () => {
      const res = await fetch(`${API_ENDPOINTS.timeSeries}?timeRange=${timeRange}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to fetch time series data');
      }
      return res.json();
    },
  });
}

// Hook to add beer consumption
export function useAddBeerConsumption() {
  return useMutation({
    mutationFn: async ({ drinkerId, memo }: { drinkerId: number, memo?: string }) => {
      const res = await apiRequest('POST', API_ENDPOINTS.consumptions, { drinkerId, memo });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate stats and leaderboard queries to refetch data
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.stats] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.leaderboard] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.timeSeries] });
    },
  });
}

// Hook to add new drinker
export function useAddDrinker() {
  return useMutation({
    mutationFn: async ({ username, initial }: { username: string, initial: string }) => {
      const res = await apiRequest('POST', API_ENDPOINTS.drinkers, { username, initial });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.stats] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.leaderboard] });
    },
  });
}
