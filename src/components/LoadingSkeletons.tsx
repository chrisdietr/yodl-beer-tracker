import { Card, CardContent, CardHeader } from "./ui/card";

/**
 * Generic skeleton component for loading states
 */
export function Skeleton({
  className = "",
  animate = true,
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <div
      className={`bg-gray-200 rounded ${animate ? 'animate-pulse' : ''} ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton for stat cards in StatsOverview
 */
export function StatCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for the StatsOverview grid
 */
export function StatsOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  );
}

/**
 * Skeleton for individual leaderboard entries
 */
export function LeaderboardEntrySkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/80 rounded-lg">
      {/* Rank */}
      <Skeleton className="h-6 w-6 rounded" />

      {/* Avatar */}
      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>

      {/* Count */}
      <Skeleton className="h-6 w-12 rounded-full" />
    </div>
  );
}

/**
 * Skeleton for the Leaderboard component
 */
export function LeaderboardSkeleton() {
  return (
    <Card className="overflow-hidden h-[450px]">
      <CardHeader className="space-y-2 pb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <LeaderboardEntrySkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for the ConsumptionChart
 */
export function ConsumptionChartSkeleton() {
  return (
    <Card className="mb-8 overflow-hidden">
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <div className="relative h-[450px] w-full">
          {/* Simulated chart axes */}
          <div className="absolute inset-0 flex items-end justify-between px-8 pb-8">
            {[...Array(8)].map((_, i) => (
              <Skeleton
                key={i}
                className="w-8"
                style={{ height: `${Math.random() * 60 + 20}%` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for BarrelVisualization component
 */
export function BarrelVisualizationSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Barrels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-6 border-b">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-48 w-32 sm:h-56 sm:w-40 rounded-lg" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for the entire HomePage content
 */
export function HomePageSkeleton() {
  return (
    <div className="space-y-8">
      <StatsOverviewSkeleton />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <LeaderboardSkeleton />

        <div className="lg:col-span-2 space-y-8">
          <ConsumptionChartSkeleton />
          <BarrelVisualizationSkeleton />
        </div>
      </div>
    </div>
  );
}
