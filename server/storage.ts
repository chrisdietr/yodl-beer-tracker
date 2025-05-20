import { 
  drinkers, beerConsumptions, stats,
  type Drinker, type InsertDrinker, 
  type BeerConsumption, type InsertBeerConsumption,
  type Stat, type StatsResponse, type DrinkerWithStats, type TimeSeriesData
} from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export interface IStorage {
  getDrinkers(): Promise<Drinker[]>;
  getDrinker(id: number): Promise<Drinker | undefined>;
  getDrinkerByUsername(username: string): Promise<Drinker | undefined>;
  createDrinker(drinker: InsertDrinker): Promise<Drinker>;
  getBeerConsumptions(): Promise<BeerConsumption[]>;
  getBeerConsumptionsByDrinker(drinkerId: number): Promise<BeerConsumption[]>;
  createBeerConsumption(consumption: InsertBeerConsumption): Promise<BeerConsumption>;
  getStats(): Promise<Stat[]>;
  createStats(totalBeers: number, currentPace: number): Promise<Stat>;
  getLeaderboard(): Promise<DrinkerWithStats[]>;
  getTimeSeriesData(timeRange: string): Promise<TimeSeriesData[]>;
  getAppStats(): Promise<StatsResponse>;
}

export class MemStorage implements IStorage {
  private drinkers: Map<number, Drinker>;
  private beerConsumptions: Map<number, BeerConsumption>;
  private stats: Map<number, Stat>;
  private drinkerIdCounter: number;
  private beerIdCounter: number;
  private statsIdCounter: number;
  private lastLeaderboard: DrinkerWithStats[];
  private initialTimeStamp: Date;

  constructor() {
    this.drinkers = new Map();
    this.beerConsumptions = new Map();
    this.stats = new Map();
    this.drinkerIdCounter = 1;
    this.beerIdCounter = 1;
    this.statsIdCounter = 1;
    this.lastLeaderboard = [];
    this.initialTimeStamp = new Date();
    
    // Add some initial data
    this.seedInitialData();
  }

  private seedInitialData() {
    // Add initial drinkers
    const initialDrinkers = [
      { username: "Chris", initial: "C" },
      { username: "Fran", initial: "F" },
      { username: "Maria", initial: "M" },
      { username: "Jorge", initial: "J" },
      { username: "Ana", initial: "A" },
    ];

    initialDrinkers.forEach(drinker => {
      this.createDrinker(drinker);
    });

    // Add some initial beer consumptions
    const now = new Date();
    
    // Create more consumptions for the first few drinkers
    this.addConsumptionsForDrinker(1, 18, now);
    this.addConsumptionsForDrinker(2, 15, now);
    this.addConsumptionsForDrinker(3, 9, now);
    this.addConsumptionsForDrinker(4, 7, now);
    this.addConsumptionsForDrinker(5, 5, now);

    // Create initial stats
    this.createStats(42, 3.5);
  }

  private addConsumptionsForDrinker(drinkerId: number, count: number, baseTime: Date) {
    for (let i = 0; i < count; i++) {
      const time = new Date(baseTime);
      // Distribute the beers over the last couple of hours
      time.setMinutes(time.getMinutes() - Math.floor(Math.random() * 120));
      
      const beerIdForMemo = this.beerIdCounter + 1;
      this.beerConsumptions.set(this.beerIdCounter++, {
        id: beerIdForMemo,
        drinkerId,
        timestamp: time,
        memo: `Beer ${i + 1} for drinker ${drinkerId}`
      });
    }
  }

  async getDrinkers(): Promise<Drinker[]> {
    return Array.from(this.drinkers.values());
  }

  async getDrinker(id: number): Promise<Drinker | undefined> {
    return this.drinkers.get(id);
  }

  async getDrinkerByUsername(username: string): Promise<Drinker | undefined> {
    return Array.from(this.drinkers.values()).find(
      (drinker) => drinker.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createDrinker(drinker: InsertDrinker): Promise<Drinker> {
    const id = this.drinkerIdCounter++;
    const newDrinker: Drinker = { ...drinker, id };
    this.drinkers.set(id, newDrinker);
    return newDrinker;
  }

  async getBeerConsumptions(): Promise<BeerConsumption[]> {
    return Array.from(this.beerConsumptions.values());
  }

  async getBeerConsumptionsByDrinker(drinkerId: number): Promise<BeerConsumption[]> {
    return Array.from(this.beerConsumptions.values()).filter(
      (consumption) => consumption.drinkerId === drinkerId
    );
  }

  async createBeerConsumption(consumption: InsertBeerConsumption): Promise<BeerConsumption> {
    const id = this.beerIdCounter++;
    const timestamp = new Date();
    
    // Default memo to empty string if it's null or undefined
    const memoString = typeof consumption.memo === 'string' ? consumption.memo : "";
    
    const newConsumption: BeerConsumption = { 
      id, 
      drinkerId: consumption.drinkerId, 
      timestamp, 
      memo: memoString 
    };
    
    this.beerConsumptions.set(id, newConsumption);
    
    // Recalculate and update stats
    const allConsumptions = await this.getBeerConsumptions();
    const totalBeers = allConsumptions.length;
    
    // Calculate pace (beers per hour) based on the last hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const beersLastHour = allConsumptions.filter(
      beer => beer.timestamp > oneHourAgo
    ).length;
    
    this.createStats(totalBeers, beersLastHour);
    
    return newConsumption;
  }

  async getStats(): Promise<Stat[]> {
    return Array.from(this.stats.values());
  }

  async createStats(totalBeers: number, currentPace: number): Promise<Stat> {
    const id = this.statsIdCounter++;
    const timestamp = new Date();
    const newStat: Stat = { id, timestamp, totalBeers, currentPace };
    this.stats.set(id, newStat);
    return newStat;
  }

  async getLeaderboard(): Promise<DrinkerWithStats[]> {
    const drinkers = await this.getDrinkers();
    const allConsumptions = await this.getBeerConsumptions();
    
    const currentLeaderboard: DrinkerWithStats[] = await Promise.all(
      drinkers.map(async (drinker) => {
        const drinkerConsumptions = allConsumptions.filter(
          (consumption) => consumption.drinkerId === drinker.id
        );
        
        const count = drinkerConsumptions.length;
        
        // Find the most recent beer
        const sortedConsumptions = [...drinkerConsumptions].sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );
        
        const lastBeer = sortedConsumptions.length > 0 
          ? formatDistanceToNow(sortedConsumptions[0].timestamp, { addSuffix: true })
          : undefined;
        
        return {
          id: drinker.id,
          username: drinker.username,
          initial: drinker.initial,
          count,
          lastBeer,
          trend: "neutral" // Default to neutral
        };
      })
    );
    
    // Sort by count, highest first
    currentLeaderboard.sort((a, b) => b.count - a.count);
    
    // Determine trends by comparing with the last leaderboard
    if (this.lastLeaderboard.length > 0) {
      currentLeaderboard.forEach(drinker => {
        const previousPosition = this.lastLeaderboard.findIndex(d => d.id === drinker.id);
        const currentPosition = currentLeaderboard.findIndex(d => d.id === drinker.id);
        
        if (previousPosition === -1) {
          drinker.trend = "neutral"; // New entry
        } else if (currentPosition < previousPosition) {
          drinker.trend = "up"; // Moved up in rankings
        } else if (currentPosition > previousPosition) {
          drinker.trend = "down"; // Moved down in rankings
        } else {
          // Compare counts
          const previousCount = this.lastLeaderboard[previousPosition].count;
          if (drinker.count > previousCount) {
            drinker.trend = "up";
          } else if (drinker.count < previousCount) {
            drinker.trend = "down";
          } else {
            drinker.trend = "neutral";
          }
        }
      });
    }
    
    // Save this leaderboard for next comparison
    this.lastLeaderboard = [...currentLeaderboard];
    
    return currentLeaderboard;
  }

  async getTimeSeriesData(timeRange: string): Promise<TimeSeriesData[]> {
    const allConsumptions = await this.getBeerConsumptions();
    
    // Sort by timestamp
    const sortedConsumptions = [...allConsumptions].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    if (sortedConsumptions.length === 0) {
      return [];
    }
    
    let startTime: Date;
    const endTime = new Date();
    
    // Determine start time based on timeRange
    switch (timeRange) {
      case "hour":
        startTime = new Date(endTime);
        startTime.setHours(endTime.getHours() - 1);
        break;
      case "day":
        startTime = new Date(endTime);
        startTime.setHours(0, 0, 0, 0);
        break;
      case "all":
      default:
        startTime = this.initialTimeStamp;
        break;
    }
    
    // Create time intervals for the data
    const timeSeriesData: TimeSeriesData[] = [];
    
    // Use different interval sizes based on time range
    let intervalSize: number;
    let intervalUnit: 'minute' | 'hour';
    
    switch (timeRange) {
      case "hour":
        intervalSize = 5; // 5-minute intervals for last hour
        intervalUnit = 'minute';
        break;
      case "day":
        intervalSize = 1; // 1-hour intervals for today
        intervalUnit = 'hour';
        break;
      case "all":
      default:
        intervalSize = 2; // 2-hour intervals for all time
        intervalUnit = 'hour';
        break;
    }
    
    // Create intervals with more data points
    let currentTime = new Date(startTime);
    let cumulativeCount = 0;
    
    // Ensure we create enough data points for visualization
    while (currentTime <= endTime) {
      const nextTime = new Date(currentTime);
      
      if (intervalUnit === 'minute') {
        nextTime.setMinutes(currentTime.getMinutes() + intervalSize);
      } else {
        nextTime.setHours(currentTime.getHours() + intervalSize);
      }
      
      // Count beers in this interval
      const beersInInterval = sortedConsumptions.filter(
        beer => beer.timestamp >= currentTime && beer.timestamp < nextTime
      ).length;
      
      // Update running total
      cumulativeCount += beersInInterval;
      
      timeSeriesData.push({
        timestamp: currentTime.toISOString(),
        count: cumulativeCount
      });
      
      currentTime = nextTime;
    }
    
    // If there are less than 2 data points, create some artificial points
    // to ensure the chart can be properly visualized
    if (timeSeriesData.length < 2) {
      const lastPoint = timeSeriesData[timeSeriesData.length - 1];
      
      // Create a new point 30 minutes before the end time
      const earlierPoint = new Date(endTime);
      if (timeRange === "hour") {
        earlierPoint.setMinutes(earlierPoint.getMinutes() - 30);
      } else {
        earlierPoint.setHours(earlierPoint.getHours() - 1);
      }
      
      // Insert at the beginning to maintain chronological order
      timeSeriesData.unshift({
        timestamp: earlierPoint.toISOString(),
        count: Math.floor(lastPoint.count * 0.7) // 70% of the current count
      });
      
      // For hour and day views, add one more point in the middle
      if (timeRange !== "all") {
        const middlePoint = new Date(endTime);
        if (timeRange === "hour") {
          middlePoint.setMinutes(middlePoint.getMinutes() - 15);
        } else {
          middlePoint.setHours(middlePoint.getHours() - 0.5);
        }
        
        timeSeriesData.splice(1, 0, {
          timestamp: middlePoint.toISOString(),
          count: Math.floor(lastPoint.count * 0.85) // 85% of the current count 
        });
      }
    }
    
    return timeSeriesData;
  }

  async getAppStats(): Promise<StatsResponse> {
    const allConsumptions = await this.getBeerConsumptions();
    const leaderboard = await this.getLeaderboard();
    const timeSeriesData = await this.getTimeSeriesData("day");
    
    // Get the top drinker
    const topDrinker = leaderboard.length > 0 ? leaderboard[0] : null;
    
    // Calculate today's consumption
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayConsumptions = allConsumptions.filter(
      beer => beer.timestamp >= today
    );
    
    // Get the current pace (beers per hour)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const beersLastHour = allConsumptions.filter(
      beer => beer.timestamp > oneHourAgo
    ).length;
    
    return {
      totalBeers: allConsumptions.length,
      topDrinker: topDrinker ? {
        id: topDrinker.id,
        name: topDrinker.username,
        initial: topDrinker.initial,
        count: topDrinker.count
      } : null,
      currentPace: beersLastHour,
      todayBarrel: {
        count: todayConsumptions.length,
        capacity: 50 // Fixed capacity for today
      },
      recordBarrel: {
        count: 85, // Fixed record for demo
        capacity: 100
      },
      drinkers: leaderboard,
      timeSeriesData
    };
  }
}

export const storage = new MemStorage();
