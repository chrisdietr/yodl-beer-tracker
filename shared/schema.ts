import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Beer drinker model
export const drinkers = pgTable("drinkers", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  initial: text("initial").notNull(),
});

// Beer consumption model
export const beerConsumptions = pgTable("beer_consumptions", {
  id: serial("id").primaryKey(),
  drinkerId: integer("drinker_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  memo: text("memo").notNull().default(""),
});

// Stats model to store historical data
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  totalBeers: integer("total_beers").notNull(),
  currentPace: integer("current_pace").notNull(),
});

// Schema for inserting new drinkers
export const insertDrinkerSchema = createInsertSchema(drinkers).pick({
  username: true,
  initial: true,
});

// Schema for inserting new beer consumptions
export const insertBeerConsumptionSchema = createInsertSchema(beerConsumptions).pick({
  drinkerId: true,
  memo: true,
});

// Types
export type Drinker = typeof drinkers.$inferSelect;
export type InsertDrinker = z.infer<typeof insertDrinkerSchema>;
export type BeerConsumption = typeof beerConsumptions.$inferSelect;
export type InsertBeerConsumption = z.infer<typeof insertBeerConsumptionSchema>;
export type Stat = typeof stats.$inferSelect;

// Response types for the frontend
export type DrinkerWithStats = {
  id: number;
  username: string;
  initial: string;
  count: number;
  lastBeer?: string;
  trend?: "up" | "down" | "neutral";
};

export type TimeSeriesData = {
  timestamp: string;
  count: number;
};

export type StatsResponse = {
  totalBeers: number;
  topDrinker: {
    id: number;
    name: string;
    initial: string;
    count: number;
  } | null;
  currentPace: number;
  todayBarrel: {
    count: number;
    capacity: number;
  };
  recordBarrel: {
    count: number;
    capacity: number;
  };
  drinkers: DrinkerWithStats[];
  timeSeriesData: TimeSeriesData[];
};
