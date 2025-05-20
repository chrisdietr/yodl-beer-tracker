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
      
      {/* Most active drinker card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-hops-green">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-barrel-dark">Top Chugger</h3>
          <i className="ri-trophy-fill text-2xl text-hops-green"></i>
        </div>
        {stats.topDrinker ? (
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-beer-amber rounded-full flex items-center justify-center border-2 border-beer-dark overflow-hidden relative">
              <span className="text-2xl font-bold text-white">{stats.topDrinker.initial}</span>
              <div className="barrel-shine"></div>
            </div>
            <div>
              <h4 className="text-xl font-bold text-hops-green">{stats.topDrinker.name}</h4>
              <div className="flex items-end">
                <span className="text-3xl font-bungee text-beer-amber">{stats.topDrinker.count}</span>
                <span className="text-sm text-barrel-light ml-2 mb-1">beers</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-barrel-light">No drinkers yet!</p>
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
