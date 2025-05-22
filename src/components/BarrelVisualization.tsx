import { StatsResponse, DrinkerWithStats } from "@shared/schema";
import { ScrollArea } from "./ui/scroll-area";
import { formatDistanceToNow } from "../lib/timeUtils";
import { useEffect, useRef } from "react";

interface BarrelVisualizationProps {
  todayBarrel: StatsResponse['todayBarrel'];
  drinkers: DrinkerWithStats[];
}

export default function BarrelVisualization({ todayBarrel, drinkers }: BarrelVisualizationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [drinkers]);

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
      
      {/* User stats scrollable list */}
      <div className="relative bg-white rounded-xl shadow-lg p-6 border-2 border-barrel-light overflow-hidden flex flex-col">
        <h3 className="text-lg font-bold text-barrel-dark mb-4">All Drinkers</h3>
        <ScrollArea className="h-64 w-full">
          <div ref={scrollRef} className="divide-y divide-barrel-light h-64 overflow-y-auto">
            {drinkers.length === 0 ? (
              <div className="text-center text-barrel-light py-8">No drinkers yet!</div>
            ) : (
              drinkers.map((drinker) => (
                <div key={drinker.id} className="flex items-center py-3 px-2">
                  <div className="w-10 h-10 bg-beer-amber rounded-full flex items-center justify-center border-2 border-beer-dark mr-3">
                    <span className="text-lg font-bold text-white">{drinker.initial}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-barrel-dark">{drinker.username}</div>
                    <div className="text-xs text-barrel-light">
                      Last beer: {drinker.lastBeer ? formatDistanceToNow(new Date(drinker.lastBeer)) : 'Never'}
                    </div>
                  </div>
                  <div className="text-xl font-bungee text-beer-amber ml-2">{drinker.count}</div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
