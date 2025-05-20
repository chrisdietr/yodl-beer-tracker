import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBeerConsumptionSchema, insertDrinkerSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get application stats (dashboard data)
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getAppStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting stats:", error);
      res.status(500).json({ message: "Error fetching application stats" });
    }
  });

  // Get time series data for chart
  app.get("/api/stats/timeseries", async (req: Request, res: Response) => {
    try {
      const timeRange = req.query.timeRange as string || "day";
      const validTimeRanges = ["hour", "day", "all"];
      
      if (!validTimeRanges.includes(timeRange)) {
        return res.status(400).json({ message: "Invalid time range. Use 'hour', 'day', or 'all'." });
      }
      
      const timeSeriesData = await storage.getTimeSeriesData(timeRange);
      res.json(timeSeriesData);
    } catch (error) {
      console.error("Error getting time series data:", error);
      res.status(500).json({ message: "Error fetching time series data" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req: Request, res: Response) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      res.status(500).json({ message: "Error fetching leaderboard" });
    }
  });

  // Add a new drinker
  app.post("/api/drinkers", async (req: Request, res: Response) => {
    try {
      const result = insertDrinkerSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid drinker data", errors: result.error.errors });
      }
      
      const existingDrinker = await storage.getDrinkerByUsername(result.data.username);
      if (existingDrinker) {
        return res.status(409).json({ message: "Drinker already exists" });
      }
      
      const drinker = await storage.createDrinker(result.data);
      res.status(201).json(drinker);
    } catch (error) {
      console.error("Error creating drinker:", error);
      res.status(500).json({ message: "Error creating drinker" });
    }
  });

  // Add a new beer consumption
  app.post("/api/consumptions", async (req: Request, res: Response) => {
    try {
      const result = insertBeerConsumptionSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid consumption data", errors: result.error.errors });
      }
      
      const drinker = await storage.getDrinker(result.data.drinkerId);
      if (!drinker) {
        return res.status(404).json({ message: "Drinker not found" });
      }
      
      const consumption = await storage.createBeerConsumption(result.data);
      
      // Get updated stats after adding consumption
      const updatedStats = await storage.getAppStats();
      
      res.status(201).json({
        consumption,
        stats: updatedStats
      });
    } catch (error) {
      console.error("Error creating consumption:", error);
      res.status(500).json({ message: "Error creating consumption" });
    }
  });

  // Let's mock a webhook endpoint for external beer data
  app.post("/api/webhook/beer", async (req: Request, res: Response) => {
    try {
      const { user_name, memo } = req.body;
      
      if (!user_name || !memo || typeof memo !== 'string' || !memo.toLowerCase().includes('beer')) {
        return res.status(400).json({ 
          message: "Invalid webhook data. Requires user_name and memo containing 'beer'" 
        });
      }
      
      // Find or create drinker
      let drinker = await storage.getDrinkerByUsername(user_name);
      
      if (!drinker) {
        // Create a new drinker if not found
        const initial = user_name.charAt(0).toUpperCase();
        drinker = await storage.createDrinker({ username: user_name, initial });
      }
      
      // Record the beer consumption
      await storage.createBeerConsumption({
        drinkerId: drinker.id,
        memo: memo
      });
      
      res.status(200).json({ message: "Beer consumption recorded successfully" });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Error processing webhook" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
