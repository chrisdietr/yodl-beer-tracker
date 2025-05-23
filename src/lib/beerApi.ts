import { apiRequest } from "./queryClient";
import { StatsResponse, DrinkerWithStats, TimeSeriesData } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

// BRZ token holder interface
export interface BrzTokenHolder {
  id: number;
  username: string;
  initial: string;
  amount: number;
  updatedAt: string;
}

// API endpoints
const API_ENDPOINTS = {
  stats: "/api/stats",
  leaderboard: "/api/leaderboard",
  timeSeries: "/api/stats/timeseries",
  consumptions: "/api/consumptions",
  drinkers: "/api/drinkers",
  webhook: "/api/webhook/beer",
  brzTokenHolders: "/api/brz-token-holders"
};

const WEBHOOK_URL = import.meta.env.VITE_BEER_WEBHOOK_URL;

console.log('VITE_BEER_WEBHOOK_URL:', import.meta.env.VITE_BEER_WEBHOOK_URL);

// --- Data transformation helpers ---

type Payment = {
  count_payments_senderEnsPrimaryName: number;
  payments_invoiceAmount: string;
  payments_blockTimestamp: string;
  payments_senderEnsPrimaryName: string;
  payments_beerAmount: string;
};

function transformPaymentsToStats(payments: Payment[], timeRange = 'day') {
  // Group by sender
  const drinkerMap = new Map();
  let totalBeers = 0;
  let topDrinker = null;
  let currentPace = 0;
  let todayCount = 0;
  let today = new Date().toISOString().slice(0, 10);
  let recordCount = 0;
  let recordDate = null;
  let timeSeriesData = [];

  // Group by hour for time series
  const timeSeriesMap = new Map();

  for (const p of payments) {
    const name = p.payments_senderEnsPrimaryName || 'Unknown';
    const amount = parseFloat(p.payments_beerAmount);
    const timestamp = p.payments_blockTimestamp;
    const date = timestamp.slice(0, 10);
    totalBeers += amount;
    // Leaderboard
    if (!drinkerMap.has(name)) {
      drinkerMap.set(name, {
        id: name, // use ENS as id
        username: name,
        initial: name[0]?.toUpperCase() || '?',
        count: 0,
        lastBeer: timestamp,
        trend: 'neutral',
      });
    }
    const d = drinkerMap.get(name);
    d.count += amount;
    if (!d.lastBeer || d.lastBeer < timestamp) d.lastBeer = timestamp;
    // Today count
    if (date === today) todayCount += amount;
    // Time series (always by minute)
    // Group by minute, set seconds to 00 for valid ISO
    let key = timestamp.slice(0, 16) + ':00'; // YYYY-MM-DDTHH:MM:00
    timeSeriesMap.set(key, (timeSeriesMap.get(key) || 0) + amount);
    // Record
    if (!recordDate || d.count > recordCount) {
      recordCount = d.count;
      recordDate = date;
    }
  }
  // Leaderboard array
  const drinkers = Array.from(drinkerMap.values()).sort((a, b) => b.count - a.count);
  if (drinkers.length > 0) {
    topDrinker = {
      id: drinkers[0].id,
      name: drinkers[0].username,
      initial: drinkers[0].initial,
      count: drinkers[0].count,
    };
  }
  // Current pace: beers in last hour
  const now = Date.now();
  currentPace = payments.filter((p: Payment) => now - new Date(p.payments_blockTimestamp).getTime() < 3600_000).reduce((sum: number, p: Payment) => sum + parseFloat(p.payments_beerAmount), 0);
  // Time series array
  timeSeriesData = Array.from(timeSeriesMap.entries()).map(([timestamp, count]) => ({ timestamp, count }));
  timeSeriesData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  // Barrel capacities (arbitrary, e.g. 200 for today, 200 for record)
  const todayBarrel = { count: todayCount, capacity: 200 };
  const recordBarrel = { count: recordCount, capacity: 200 };
  return {
    totalBeers: Math.round(totalBeers),
    topDrinker,
    currentPace: Math.round(currentPace),
    todayBarrel,
    recordBarrel,
    drinkers,
    timeSeriesData,
  };
}

// --- API hooks ---

export function useAppStats(timeRange = 'day') {
  return useQuery({
    queryKey: [WEBHOOK_URL, timeRange],
    queryFn: async () => {
      console.log('Fetching from:', WEBHOOK_URL);
      const res = await fetch(WEBHOOK_URL);
      console.log('res:', res);
      const body = await res.text();
      console.log('res body:', body);
      if (!res.ok) throw new Error('Failed to fetch payments data');
      let payments;
      try {
        payments = JSON.parse(body);
      } catch (e) {
        throw new Error('Failed to parse payments data as JSON');
      }
      if (!Array.isArray(payments)) {
        throw new Error('Payments data is not an array');
      }
      try {
        return transformPaymentsToStats(payments, timeRange);
      } catch (error) {
        console.error('Error transforming payments data:', error);
        throw error;
      }
    },
    refetchInterval: 5000,
  });
}

// The following hooks are now stubs or not used, as the dashboard is read-only from the webhook.
export function useLeaderboard() {
  return { data: [], isLoading: false };
}
export function useTimeSeriesData() {
  return { data: [], isLoading: false };
}
export function useAddBeerConsumption() {
  return { mutate: () => {}, isLoading: false };
}
export function useAddDrinker() {
  return { mutate: () => {}, isLoading: false };
}
export function useBrzTokenHolders(): { data: BrzTokenHolder[]; isLoading: boolean } {
  return { data: [], isLoading: false };
}
