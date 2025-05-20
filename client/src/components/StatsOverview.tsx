import { StatsResponse } from "@shared/schema";

interface StatsOverviewProps {
  stats: StatsResponse;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  // Determine pace message based on current pace
  const getPaceMessage = (pace: number) => {
    if (pace === 0) return "No beers in the last hour!";
    if (pace < 2) return "Slow and steady wins the race! 🐢";
    if (pace < 5) return "That's a solid pace! 🍻";
    if (pace < 10) return "Now we're talking! Party on! 🔥";
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
      
      {/* BRZ token holders card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-hops-green">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-barrel-dark">Gib Beer Token</h3>
          <i className="ri-coin-fill text-2xl text-hops-green"></i>
        </div>
        <div className="overflow-y-auto max-h-32 pr-2">
          <div className="space-y-2">
            {/* Mock BRZ token holders - in a real app, this would fetch from Base blockchain */}
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-beer-amber rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">M</span>
                </div>
                <span className="ml-2 text-sm font-medium">Maria</span>
              </div>
              <span className="text-sm font-bold text-hops-green">1,250 BRZ</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-beer-amber rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">C</span>
                </div>
                <span className="ml-2 text-sm font-medium">Chris</span>
              </div>
              <span className="text-sm font-bold text-hops-green">980 BRZ</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-beer-amber rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">J</span>
                </div>
                <span className="ml-2 text-sm font-medium">Jorge</span>
              </div>
              <span className="text-sm font-bold text-hops-green">750 BRZ</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-beer-amber rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">A</span>
                </div>
                <span className="ml-2 text-sm font-medium">Ana</span>
              </div>
              <span className="text-sm font-bold text-hops-green">525 BRZ</span>
            </div>
          </div>
        </div>
        
        {/* Top chugger highlight section */}
        {stats.topDrinker && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-beer-amber rounded-full flex items-center justify-center border-2 border-beer-dark overflow-hidden relative">
                  <span className="text-lg font-bold text-white">{stats.topDrinker.initial}</span>
                </div>
                <div className="ml-2">
                  <span className="text-xs text-barrel-light">Top Chugger</span>
                  <h4 className="text-sm font-bold text-barrel-dark">{stats.topDrinker.name}</h4>
                </div>
              </div>
              <div className="flex items-end">
                <span className="text-xl font-bungee text-beer-amber">{stats.topDrinker.count}</span>
                <i className="ri-trophy-fill ml-1 text-yellow-500"></i>
              </div>
            </div>
          </div>
        )}
      </div>
      
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
          <span className="text-sm font-medium text-hops-green">
            {getPaceMessage(stats.currentPace)}
          </span>
        </div>
      </div>
    </div>
  );
}
