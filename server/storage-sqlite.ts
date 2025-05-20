import { 
  drinkers, beerConsumptions, stats, appConfig, brzTokenHolders,
  type Drinker, type InsertDrinker, 
  type BeerConsumption, type InsertBeerConsumption,
  type Stat, type StatsResponse, type DrinkerWithStats, type TimeSeriesData
} from "@shared/schema";

// BRZ Token Holder interface
export interface BrzTokenHolder {
  id: number;
  username: string;
  initial: string;
  amount: number;
}
import { formatDistanceToNow } from "date-fns";
import { db } from "./db";
import { eq, desc, gte, and, lt } from "drizzle-orm";

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
  getBrzTokenHolders(): Promise<any[]>;
  seedInitialData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private lastLeaderboard: DrinkerWithStats[] = [];
  private initialTimeStamp: Date;

  constructor() {
    this.initialTimeStamp = new Date();
  }

  async seedInitialData(): Promise<void> {
    // Check if we already have all data
    const existingDrinkers = await this.getDrinkers();
    const existingConfigCount = await db.select().from(appConfig).execute();
    const existingBrzTokens = await db.select().from(brzTokenHolders).execute();
    
    const hasConfig = existingConfigCount.length > 0;
    const hasBrzTokens = existingBrzTokens.length > 0;
    
    // Add initial drinkers if none exist
    if (existingDrinkers.length === 0) {
      // Add initial drinkers
      const initialDrinkers = [
        { username: "Chris", initial: "C" },
        { username: "Fran", initial: "F" },
        { username: "Maria", initial: "M" },
        { username: "Jorge", initial: "J" },
        { username: "Ana", initial: "A" },
      ];

      for (const drinker of initialDrinkers) {
        await this.createDrinker(drinker);
      }

      // Add some initial beer consumptions
      const now = new Date();
      
      // Create more consumptions for the first few drinkers
      await this.addConsumptionsForDrinker(1, 18, now);
      await this.addConsumptionsForDrinker(2, 15, now);
      await this.addConsumptionsForDrinker(3, 9, now);
      await this.addConsumptionsForDrinker(4, 7, now);
      await this.addConsumptionsForDrinker(5, 5, now);

      // Create initial stats
      await this.createStats(54, 3);
    }
    
    // Add app configuration if none exists
    if (!hasConfig) {
      await db.insert(appConfig).values([
        { 
          key: "today_barrel_capacity", 
          value: "200", 
          updatedAt: new Date().toISOString() 
        },
        { 
          key: "record_barrel_capacity", 
          value: "200", 
          updatedAt: new Date().toISOString() 
        },
        { 
          key: "record_barrel_count", 
          value: "85", 
          updatedAt: new Date().toISOString() 
        }
      ]);
    }
    
    // Add BRZ token holders if none exist
    if (!hasBrzTokens) {
      await db.insert(brzTokenHolders).values([
        { username: "Maria", initial: "M", amount: 1250, updatedAt: new Date().toISOString() },
        { username: "Chris", initial: "C", amount: 980, updatedAt: new Date().toISOString() },
        { username: "Jorge", initial: "J", amount: 750, updatedAt: new Date().toISOString() },
        { username: "Ana", initial: "A", amount: 525, updatedAt: new Date().toISOString() }
      ]);
    }
  }

  private async addConsumptionsForDrinker(drinkerId: number, count: number, baseTime: Date) {
    for (let i = 0; i < count; i++) {
      const time = new Date(baseTime);
      // Distribute the beers over the last couple of hours
      time.setMinutes(time.getMinutes() - Math.floor(Math.random() * 120));
      
      await this.createBeerConsumption({
        drinkerId,
        memo: `Beer ${i + 1} for drinker ${drinkerId}`
      });
    }
  }

  async getDrinkers(): Promise<Drinker[]> {
    return await db.select().from(drinkers);
  }

  async getDrinker(id: number): Promise<Drinker | undefined> {
    const result = await db.select().from(drinkers).where(eq(drinkers.id, id));
    return result[0];
  }

  async getDrinkerByUsername(username: string): Promise<Drinker | undefined> {
    const result = await db.select().from(drinkers).where(
      eq(drinkers.username, username)
    );
    return result[0];
  }

  async createDrinker(drinker: InsertDrinker): Promise<Drinker> {
    const result = await db.insert(drinkers).values(drinker).returning();
    return result[0];
  }

  async getBeerConsumptions(): Promise<BeerConsumption[]> {
    return await db.select().from(beerConsumptions);
  }

  async getBeerConsumptionsByDrinker(drinkerId: number): Promise<BeerConsumption[]> {
    return await db.select().from(beerConsumptions)
      .where(eq(beerConsumptions.drinkerId, drinkerId));
  }

  async createBeerConsumption(consumption: InsertBeerConsumption): Promise<BeerConsumption> {
    // Ensure memo is not undefined or null
    const memo = consumption.memo || "";
    
    const result = await db.insert(beerConsumptions)
      .values({
        drinkerId: consumption.drinkerId,
        memo,
        timestamp: new Date().toISOString()
      })
      .returning();
    
    // Recalculate and update stats
    const allConsumptions = await this.getBeerConsumptions();
    const totalBeers = allConsumptions.length;
    
    // Calculate pace (beers per hour) based on the last hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    const oneHourAgoIso = oneHourAgo.toISOString();
    
    const beersLastHour = (await db.select().from(beerConsumptions)
      .where(gte(beerConsumptions.timestamp, oneHourAgoIso))).length;
    
    await this.createStats(totalBeers, beersLastHour);
    
    return result[0];
  }

  async getStats(): Promise<Stat[]> {
    return await db.select().from(stats);
  }

  async createStats(totalBeers: number, currentPace: number): Promise<Stat> {
    const result = await db.insert(stats)
      .values({
        timestamp: new Date().toISOString(),
        totalBeers,
        currentPace
      })
      .returning();
    
    return result[0];
  }

  async getBrzTokenHolders(): Promise<BrzTokenHolder[]> {
    // Get BRZ token holders from database
    const holders = await db.select().from(brzTokenHolders).orderBy(desc(brzTokenHolders.amount));
    return holders;
  }

  async getLeaderboard(): Promise<DrinkerWithStats[]> {
    const allDrinkers = await this.getDrinkers();
    const allConsumptions = await this.getBeerConsumptions();
    
    const currentLeaderboard: DrinkerWithStats[] = [];
    
    for (const drinker of allDrinkers) {
      const drinkerConsumptions = allConsumptions.filter(
        consumption => consumption.drinkerId === drinker.id
      );
      
      const count = drinkerConsumptions.length;
      
      // Find the most recent beer
      const sortedConsumptions = [...drinkerConsumptions].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      const lastBeer = sortedConsumptions.length > 0 
        ? formatDistanceToNow(new Date(sortedConsumptions[0].timestamp), { addSuffix: true })
        : undefined;
      
      currentLeaderboard.push({
        id: drinker.id,
        username: drinker.username,
        initial: drinker.initial,
        count,
        lastBeer,
        trend: "neutral" // Default to neutral
      });
    }
    
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
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    if (sortedConsumptions.length === 0) {
      return [];
    }
    
    const endTime = new Date();
    let startTime: Date;
    
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
        beer => {
          const beerTime = new Date(beer.timestamp);
          return beerTime >= currentTime && beerTime < nextTime;
        }
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
      beer => new Date(beer.timestamp) >= today
    );
    
    // Get the current pace (beers per hour)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const beersLastHour = allConsumptions.filter(
      beer => new Date(beer.timestamp) > oneHourAgo
    ).length;
    
    // Get configuration from the database
    const configItems = await db.select().from(appConfig);
    
    // Parse configuration values with defaults in case they're not found
    const todayBarrelCapacity = parseInt(
      configItems.find(item => item.key === "today_barrel_capacity")?.value || "200"
    );
    
    const recordBarrelCapacity = parseInt(
      configItems.find(item => item.key === "record_barrel_capacity")?.value || "200"
    );
    
    const recordBarrelCount = parseInt(
      configItems.find(item => item.key === "record_barrel_count")?.value || "85"
    );
    
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
        capacity: todayBarrelCapacity
      },
      recordBarrel: {
        count: recordBarrelCount,
        capacity: recordBarrelCapacity
      },
      drinkers: leaderboard,
      timeSeriesData
    };
  }
}

export const storage = new DatabaseStorage();