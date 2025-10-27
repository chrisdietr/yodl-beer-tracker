import { formatDistanceToNow } from "@/lib/timeUtils";

interface AppHeaderProps {
  lastUpdated: Date;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function AppHeader({ lastUpdated, isRefreshing, onRefresh }: AppHeaderProps) {
  return (
    <header className="mb-8 text-center" role="banner">
      <div className="flex items-center justify-center space-x-4 mb-2">
        {/* Beer mug logo */}
        <div className="relative" role="img" aria-label="Beer mug icon">
          <div className="w-16 h-16 bg-beer-amber rounded-b-lg rounded-t-xl border-2 border-barrel-brown relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-4 bg-beer-foam"></div>
            <div className="barrel-shine"></div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bungee text-beer-amber drop-shadow-md tracking-wider">
          CHOPP FLOW
        </h1>

        {/* Second beer mug logo */}
        <div className="relative" role="img" aria-label="Beer mug icon">
          <div className="w-16 h-16 bg-beer-amber rounded-b-lg rounded-t-xl border-2 border-barrel-brown relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-4 bg-beer-foam"></div>
            <div className="barrel-shine"></div>
          </div>
        </div>
      </div>

      <p className="text-xl text-barrel-brown font-medium" role="doc-subtitle">
        Bitcoin Pizza Day Beer Tracker
      </p>

      {/* Last updated indicator */}
      <div
        className="flex items-center justify-center mt-2 text-sm text-barrel-light"
        role="status"
        aria-live="polite"
      >
        <span>Last updated: </span>
        <time
          className="ml-1 font-bold"
          dateTime={lastUpdated.toISOString()}
        >
          {formatDistanceToNow(lastUpdated)}
        </time>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="ml-2 text-beer-amber hover:text-beer-dark focus:outline-none focus:ring-2 focus:ring-beer-dark focus:ring-offset-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          aria-label={isRefreshing ? "Refreshing data..." : "Refresh data"}
          aria-busy={isRefreshing}
        >
          <i className={`ri-refresh-line ${isRefreshing ? 'refresh-spin' : ''}`} aria-hidden="true"></i>
        </button>
      </div>
    </header>
  );
}
