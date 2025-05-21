import { StatsResponse } from "@shared/schema";

interface BarrelVisualizationProps {
  todayBarrel: StatsResponse['todayBarrel'];
  recordBarrel: StatsResponse['recordBarrel'];
}

export default function BarrelVisualization({ todayBarrel, recordBarrel }: BarrelVisualizationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Today's barrel */}
      <div className="relative bg-white rounded-xl shadow-lg p-6 border-2 border-barrel-light overflow-hidden">
        <h3 className="text-lg font-bold text-barrel-dark mb-4">Today's Beer Barrel</h3>
        
        {/* Barrel visualization */}
        <div className="barrel-container relative h-48 flex justify-center">
          {/* Barrel body */}
          <div className="w-40 h-48 bg-barrel-light rounded-lg border-2 border-barrel-dark relative overflow-hidden">
            {/* Beer level */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-beer-amber transition-all duration-1000 ease-out" 
              style={{ height: `${(todayBarrel.count / todayBarrel.capacity) * 100}%` }}
            ></div>
            
            {/* Barrel rings */}
            <div className="absolute top-1/4 left-0 right-0 h-2 bg-barrel-dark"></div>
            <div className="absolute top-3/4 left-0 right-0 h-2 bg-barrel-dark"></div>
            
            {/* Barrel studs */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-barrel-dark rounded-full -translate-y-1/2"></div>
            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-barrel-dark rounded-full -translate-y-1/2"></div>
            <div className="absolute top-3/4 left-1/4 w-2 h-2 bg-barrel-dark rounded-full -translate-y-1/2"></div>
            <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-barrel-dark rounded-full -translate-y-1/2"></div>
            
            {/* Barrel tap */}
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-6 bg-barrel-dark rounded-r"></div>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <span className="text-2xl font-bungee text-beer-amber">{todayBarrel.count}</span>
          <span className="text-lg text-barrel-dark"> / {todayBarrel.capacity} beers</span>
          <p className="text-sm text-barrel-light mt-1">Today's consumption</p>
        </div>
      </div>
      
      {/* Record barrel */}
      <div className="relative bg-white rounded-xl shadow-lg p-6 border-2 border-barrel-light overflow-hidden">
        <h3 className="text-lg font-bold text-barrel-dark mb-4">Bitcoin Pizza Day Record</h3>
        
        {/* Barrel visualization */}
        <div className="barrel-container relative h-48 flex justify-center">
          {/* Barrel body */}
          <div className="w-40 h-48 bg-barrel-light rounded-lg border-2 border-barrel-dark relative overflow-hidden">
            {/* Beer level */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-beer-amber transition-all duration-1000 ease-out" 
              style={{ height: `${(recordBarrel.count / recordBarrel.capacity) * 100}%` }}
            ></div>
            
            {/* Barrel rings */}
            <div className="absolute top-1/4 left-0 right-0 h-2 bg-barrel-dark"></div>
            <div className="absolute top-3/4 left-0 right-0 h-2 bg-barrel-dark"></div>
            
            {/* Barrel studs */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-barrel-dark rounded-full -translate-y-1/2"></div>
            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-barrel-dark rounded-full -translate-y-1/2"></div>
            <div className="absolute top-3/4 left-1/4 w-2 h-2 bg-barrel-dark rounded-full -translate-y-1/2"></div>
            <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-barrel-dark rounded-full -translate-y-1/2"></div>
            
            {/* Barrel tap */}
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-6 bg-barrel-dark rounded-r"></div>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <span className="text-2xl font-bungee text-beer-amber">{recordBarrel.count}</span>
          <span className="text-lg text-barrel-dark"> / {recordBarrel.capacity} beers</span>
          <p className="text-sm text-barrel-light mt-1">Record set in 2022</p>
        </div>
      </div>
    </div>
  );
}
