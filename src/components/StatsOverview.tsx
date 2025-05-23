import { StatsResponse } from "@shared/schema";
import { useBrzTokenHolders, type BrzTokenHolder } from "../lib/beerApi";

interface StatsOverviewProps {
  stats: StatsResponse;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  // Fetch BRZ token holders data from API
  const { data: brzTokenHolders, isLoading: isLoadingBrz } = useBrzTokenHolders();
  // Determine pace message based on current pace
  const getPaceMessage = (pace: number) => {
    if (pace === 0) return "No beers in the last hour! Time to get started! 🎯";
    if (pace < 1) return "Just getting warmed up! 🌡️";
    if (pace < 2) return "Slow and steady wins the race! 🐢"; 
    if (pace < 3) return "Finding your rhythm! 🎵";
    if (pace < 4) return "Cruising along nicely! ⛵";
    if (pace < 5) return "That's a solid pace! 🍻";
    if (pace < 6) return "The party is picking up! 🎉";
    if (pace < 7) return "You're in the groove! 🕺";
    if (pace < 8) return "Now we're cooking! 🔥";
    if (pace < 9) return "This is getting serious! 💪";
    if (pace < 10) return "Now we're talking! Party on! 🎸";
    if (pace < 12) return "You're on fire! 🔥🔥";
    if (pace < 15) return "Absolutely crushing it! 💯";
    if (pace < 20) return "You're a beer drinking machine! 🤖";
    return "Wow! That's legendary pace! 🚀";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total beers card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-beer-amber relative overflow-hidden">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-barrel-dark">Total Beers</h3>
          <i className="ri-beer-fill text-2xl text-beer-amber"></i>
        </div>
        <div className="flex items-end">
          <span className="text-4xl font-bungee text-beer-amber">{stats.totalBeers}</span>
          <span className="text-sm text-barrel-light ml-2 mb-1">beers consumed</span>
        </div>
        
        {/* Barrel visualization */}
        <div className="mt-4 flex justify-center">
          <div className="w-24 h-20 relative">
            {/* Barrel body */}
            <div className="absolute inset-0 bg-barrel-light rounded-lg border-2 border-barrel-dark overflow-hidden">
              {/* Beer level - max at 100% */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-beer-amber transition-all duration-1000 ease-out" 
                style={{ height: `${Math.min((stats.totalBeers / 100) * 100, 100)}%` }}
              ></div>
              
              {/* Barrel rings */}
              <div className="absolute top-1/4 left-0 right-0 h-1 bg-barrel-dark"></div>
              <div className="absolute top-3/4 left-0 right-0 h-1 bg-barrel-dark"></div>
              
              {/* Barrel tap */}
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-4 bg-barrel-dark rounded-r"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Jugger (celebratory) section with Runner Up inside same card */}
      {stats.drinkers && stats.drinkers.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-yellow-400 flex flex-col justify-between relative overflow-hidden animate-pulse-card" style={{ minHeight: 160 }}>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex space-x-1 z-10">
            <span className="text-2xl">🔥</span>
            <span className="text-2xl">🔥</span>
            <span className="text-2xl">🔥</span>
          </div>
          {/* Top Jugger */}
          <div className="flex items-center justify-between mt-8 mb-2 w-full">
            <div className="flex items-center min-w-0">
              <div className="w-12 h-12 bg-beer-amber rounded-full flex items-center justify-center border-4 border-yellow-400 overflow-hidden relative shadow-lg shrink-0">
                <span className="text-xl font-bold text-white drop-shadow">{stats.drinkers[0].initial}</span>
              </div>
              <div className="ml-3 min-w-0">
                <span className="text-xs text-barrel-light font-bungee uppercase tracking-widest">Top Jugger</span>
                <h4 className="text-base font-bold text-barrel-dark flex items-center break-words whitespace-normal max-w-[140px] md:max-w-[200px]">
                  {stats.drinkers[0].username}
                  <span className="ml-2 text-xl">🏆</span>
                </h4>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bungee text-beer-amber flex items-center">
                {stats.drinkers[0].count}
                <span className="ml-2 text-2xl">🔥</span>
              </span>
              <span className="text-xs text-yellow-500 font-bold mt-1">Legendary Chug!</span>
            </div>
          </div>
          {/* Runner Up (inside same card) */}
          {stats.drinkers.length > 1 && (
            <div className="flex items-center justify-between mt-2 w-full border-t border-yellow-100 pt-2">
              <div className="flex items-center min-w-0">
                <div className="w-10 h-10 bg-hops-green rounded-full flex items-center justify-center border-2 border-hops-green overflow-hidden relative shadow shrink-0">
                  <span className="text-lg font-bold text-white drop-shadow">{stats.drinkers[1].initial}</span>
                </div>
                <div className="ml-3 min-w-0">
                  <span className="text-xs text-barrel-light font-bungee uppercase tracking-widest">Runner Up</span>
                  <h4 className="text-base font-bold text-barrel-dark flex items-center break-words whitespace-normal max-w-[120px] md:max-w-[180px]">
                    {stats.drinkers[1].username}
                    <span className="ml-2 text-lg">🥈</span>
                  </h4>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xl font-bungee text-hops-green flex items-center">
                  {stats.drinkers[1].count}
                </span>
                <span className="text-xs text-hops-green font-bold mt-1">Keep it up!</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Current pace card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-barrel-brown">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-barrel-dark">Current Pace</h3>
          <i className="ri-speed-up-fill text-2xl text-barrel-brown"></i>
        </div>
        <div className="flex items-end">
          <span className="text-4xl font-bungee text-barrel-brown">{stats.currentPace}</span>
          <span className="text-sm text-barrel-light ml-2 mb-1">beers per hour</span>
        </div>
        <div className="mt-4 text-center">
          <span className="text-3xl font-medium text-hops-green">
            {getPaceMessage(stats.currentPace)}
          </span>
        </div>
      </div>
    </div>
  );
}
