import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Beer drinker model
export const drinkers = sqliteTable("drinkers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  initial: text("initial").notNull(),
});

// Beer consumption model
export const beerConsumptions = sqliteTable("beer_consumptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  drinkerId: integer("drinker_id").notNull(),
  timestamp: text("timestamp").notNull().$defaultFn(() => new Date().toISOString()),
  memo: text("memo").notNull().default(""),
});

// Stats model to store historical data
export const stats = sqliteTable("stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  timestamp: text("timestamp").notNull().$defaultFn(() => new Date().toISOString()),
  totalBeers: integer("total_beers").notNull(),
  currentPace: integer("current_pace").notNull(),
});

// App configuration model to store settings
export const appConfig = sqliteTable("app_config", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// BRZ token holders model
export const brzTokenHolders = sqliteTable("brz_token_holders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
  initial: text("initial").notNull(),
  amount: integer("amount").notNull(),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
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
