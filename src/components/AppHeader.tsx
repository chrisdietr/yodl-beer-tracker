import { formatDistanceToNow } from "@/lib/timeUtils";

interface AppHeaderProps {
  lastUpdated: Date;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function AppHeader({ lastUpdated, isRefreshing, onRefresh }: AppHeaderProps) {
  return (
    <header className="mb-8 text-center">
      <div className="flex items-center justify-center space-x-4 mb-2">
        {/* Beer mug logo */}
        <div className="relative">
          <div className="w-16 h-16 bg-beer-amber rounded-b-lg rounded-t-xl border-2 border-barrel-brown relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-4 bg-beer-foam"></div>
            <div className="barrel-shine"></div>
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bungee text-beer-amber drop-shadow-md tracking-wider">CHOPP FLOW</h1>
        
        {/* Second beer mug logo */}
        <div className="relative">
          <div className="w-16 h-16 bg-beer-amber rounded-b-lg rounded-t-xl border-2 border-barrel-brown relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-4 bg-beer-foam"></div>
            <div className="barrel-shine"></div>
          </div>
        </div>
      </div>
      
      <p className="text-xl text-barrel-brown font-medium">Bitcoin Pizza Day Beer Tracker</p>
      
      {/* Last updated indicator */}
      <div className="flex items-center justify-center mt-2 text-sm text-barrel-light">
        <span>Last updated: </span>
        <span className="ml-1 font-bold">
          {formatDistanceToNow(lastUpdated)}
        </span>
        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="ml-2 text-beer-amber hover:text-beer-dark focus:outline-none"
          aria-label="Refresh data"
        >
          <i className={`ri-refresh-line ${isRefreshing ? 'refresh-spin' : ''}`}></i>
        </button>
      </div>
    </header>
  );
}
