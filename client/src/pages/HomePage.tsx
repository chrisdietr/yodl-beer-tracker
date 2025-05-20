import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatsResponse } from "@shared/schema";
import { createBubbles } from "@/lib/bubbleEffect";
import AppHeader from "@/components/AppHeader";
import StatsOverview from "@/components/StatsOverview";
import Leaderboard from "@/components/Leaderboard";
import ConsumptionChart from "@/components/ConsumptionChart";
import BarrelVisualization from "@/components/BarrelVisualization";
import PizzaDayFooter from "@/components/PizzaDayFooter";
import { NotificationProvider, NotificationContainer } from "@/components/Notification";

export default function HomePage() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'all'>('day');

  // Fetch app stats
  const { data: stats, isLoading, error, refetch } = useQuery<StatsResponse>({
    queryKey: ['/api/stats'],
    refetchInterval: 10000 // Auto-refresh every 10 seconds
  });

  // Refetch data handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

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
    <NotificationProvider>
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
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                />
                
                <BarrelVisualization 
                  todayBarrel={stats.todayBarrel}
                  recordBarrel={stats.recordBarrel}
                />
              </div>
            </div>
            
            <PizzaDayFooter />
          </>
        ) : null}
      </div>
      
      <NotificationContainer />
    </NotificationProvider>
  );
}
