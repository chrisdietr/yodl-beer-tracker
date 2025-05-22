import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatsResponse, DrinkerWithStats } from "@shared/schema";
import { createBubbles } from "@/lib/bubbleEffect";
import AppHeader from "@/components/AppHeader";
import StatsOverview from "@/components/StatsOverview";
import Leaderboard from "@/components/Leaderboard";
import ConsumptionChart from "@/components/ConsumptionChart";
import BarrelVisualization from "@/components/BarrelVisualization";
import PizzaDayFooter from "@/components/PizzaDayFooter";
import { NotificationProvider, NotificationContainer, useNotification } from "@/components/Notification";
import { useAppStats } from "@/lib/beerApi";

export default function HomePage() {
  return (
    <NotificationProvider>
      <HomePageContent />
    </NotificationProvider>
  );
}

function HomePageContent() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showNotification } = useNotification();
  
  // Reference to track previous leaderboard state for comparison
  const prevLeaderboardRef = useRef<DrinkerWithStats[]>([]);

  // Fetch app stats from webhook (no timeRange)
  const { data: stats, isLoading, error, refetch } = useAppStats();

  // Refetch data handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };
  
  // Check for ranking changes and notify when detected
  useEffect(() => {
    if (stats && stats.drinkers.length > 0) {
      // Skip first load as we have no previous data to compare
      if (prevLeaderboardRef.current.length === 0) {
        prevLeaderboardRef.current = [...stats.drinkers];
        return;
      }
      
      // Compare current rankings with previous rankings
      const currentLeaderboard = stats.drinkers;
      const prevLeaderboard = prevLeaderboardRef.current;
      
      // Look for position changes
      currentLeaderboard.forEach((drinker, index) => {
        const prevIndex = prevLeaderboard.findIndex(d => d.id === drinker.id);
        
        // Skip if drinker is new
        if (prevIndex === -1) return;
        
        // Detect position improvements
        if (prevIndex > index) {
          const positionsImproved = prevIndex - index;
          showNotification(
            `${drinker.username} moved up ${positionsImproved} ${positionsImproved === 1 ? 'position' : 'positions'} in the rankings! 🏆`,
            'success'
          );
        }
        
        // Detect count increases (even if position didn't change)
        const prevDrinker = prevLeaderboard[prevIndex];
        if (drinker.count > prevDrinker.count) {
          const difference = drinker.count - prevDrinker.count;
          showNotification(
            `${drinker.username} just drank ${difference} more ${difference === 1 ? 'beer' : 'beers'}! 🍻`,
            'info'
          );
        }
      });
      
      // Update reference for next comparison
      prevLeaderboardRef.current = [...currentLeaderboard];
    }
  }, [stats, showNotification]);
  
  // For new record achievements
  useEffect(() => {
    if (stats && stats.todayBarrel.count > 0) {
      // Check if we've reached certain milestones
      const count = stats.todayBarrel.count;
      
      if (count === 25) {
        showNotification("Milestone reached! 25 beers consumed today! 🍻", "success");
      } else if (count === 50) {
        showNotification("Milestone reached! 50 beers consumed today! 🔥", "success");
      } else if (count === 100) {
        showNotification("Century milestone! 100 beers consumed today! 🚀", "success");
      }
    }
  }, [stats?.todayBarrel.count, showNotification]);

  // Effect to update lastUpdated when data is refetched
  useEffect(() => {
    if (stats) {
      setLastUpdated(new Date());
    }
  }, [stats]);

  // Create beer bubbles effect on mount
  useEffect(() => {
    createBubbles();
    
    // Start the auto-refresh loop
    const interval = setInterval(() => {
      handleRefresh();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Data</h2>
          <p className="text-gray-700">
            Failed to load beer data. Please try again later.
          </p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 px-4 py-2 bg-beer-amber text-white rounded-md hover:bg-beer-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NotificationContainer />
      {/* Beer-themed background with bubbles */}
      <div id="background-container" className="fixed inset-0 overflow-hidden pointer-events-none z-0"></div>
      
      {/* Main container */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <AppHeader lastUpdated={lastUpdated} isRefreshing={isRefreshing} onRefresh={handleRefresh} />
        
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin mb-4">
              <i className="ri-loader-4-line text-4xl text-beer-amber"></i>
            </div>
            <p className="text-xl text-barrel-light">Loading beer data...</p>
          </div>
        ) : stats ? (
          <>
            <StatsOverview stats={stats} />
            
            {/* Main content area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Leaderboard drinkers={stats.drinkers} isLoading={isLoading} />
              
              <div className="lg:col-span-2">
                <ConsumptionChart 
                  timeSeriesData={stats.timeSeriesData}
                  isLoading={isLoading}
                />
                
                <BarrelVisualization 
                  todayBarrel={stats.todayBarrel}
                  drinkers={stats.drinkers}
                />
              </div>
            </div>
            
            <PizzaDayFooter />
          </>
        ) : null}
      </div>
    </div>
  );
}
