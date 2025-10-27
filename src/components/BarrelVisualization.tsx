import { StatsResponse, DrinkerWithStats } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useEffect, useState } from "react";
import { Beer, Trophy, TrendingUp } from "lucide-react";

interface BarrelVisualizationProps {
  todayBarrel: StatsResponse['todayBarrel'];
  recordBarrel: StatsResponse['recordBarrel'];
  drinkers: DrinkerWithStats[];
}

/**
 * Visual barrel component with filling animation
 */
function Barrel({
  count,
  capacity,
  label,
  color = "beer-amber",
  icon: Icon
}: {
  count: number;
  capacity: number;
  label: string;
  color?: string;
  icon: any;
}) {
  const [animatedCount, setAnimatedCount] = useState(0);
  const percentage = Math.min((count / capacity) * 100, 100);

  // Animate count up
  useEffect(() => {
    let start = animatedCount;
    const end = count;
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      setAnimatedCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [count]);

  // Get fill level message
  const getFillMessage = () => {
    if (percentage === 0) return "Empty barrel";
    if (percentage < 25) return "Just getting started";
    if (percentage < 50) return "Building momentum";
    if (percentage < 75) return "Going strong";
    if (percentage < 90) return "Almost there!";
    if (percentage < 100) return "Nearly full!";
    return "Barrel is full! 🎉";
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Label */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Icon className="h-5 w-5 text-beer-dark" />
          <h3 className="text-lg font-semibold text-beer-dark">{label}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{getFillMessage()}</p>
      </div>

      {/* Barrel visualization */}
      <div className="relative w-32 h-48 sm:w-40 sm:h-56">
        {/* Barrel container */}
        <div className="absolute inset-0 bg-barrel-brown rounded-lg border-4 border-barrel-dark overflow-hidden shadow-lg">
          {/* Wooden texture lines */}
          <div className="absolute inset-0 opacity-20">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute w-full h-px bg-barrel-dark"
                style={{ top: `${20 * i + 10}%` }}
              />
            ))}
          </div>

          {/* Beer fill */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-${color} to-beer-light transition-all duration-1000 ease-out`}
            style={{
              height: `${percentage}%`,
              background: `linear-gradient(to top, hsl(var(--${color})), hsl(var(--beer-light)))`
            }}
          >
            {/* Foam/bubble effect at top of beer */}
            {percentage > 0 && (
              <div className="absolute top-0 left-0 right-0 h-4 bg-beer-foam/80 animate-pulse" />
            )}
          </div>

          {/* Barrel hoops */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-barrel-dark" />
          <div className="absolute top-1/4 left-0 right-0 h-2 bg-barrel-dark" />
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-barrel-dark" />
          <div className="absolute top-3/4 left-0 right-0 h-2 bg-barrel-dark" />
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-barrel-dark" />
        </div>

        {/* Count display - centered in barrel */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border-2 border-beer-dark">
            <div className="text-2xl sm:text-3xl font-bold text-beer-dark font-['Bungee']">
              {animatedCount}
            </div>
            <div className="text-xs text-muted-foreground text-center">
              / {capacity}
            </div>
          </div>
        </div>
      </div>

      {/* Percentage */}
      <div className="text-center">
        <div className="text-2xl font-bold text-beer-dark font-['Bungee']">
          {percentage.toFixed(1)}%
        </div>
        <div className="text-xs text-muted-foreground">Capacity</div>
      </div>
    </div>
  );
}

/**
 * Recent activity feed
 */
function RecentActivity({ drinkers }: { drinkers: DrinkerWithStats[] }) {
  // Get top 5 most recent drinkers
  const recentDrinkers = [...drinkers]
    .filter(d => d.lastBeer)
    .sort((a, b) => {
      if (!a.lastBeer || !b.lastBeer) return 0;
      return new Date(b.lastBeer).getTime() - new Date(a.lastBeer).getTime();
    })
    .slice(0, 5);

  if (recentDrinkers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Beer className="h-12 w-12 mx-auto mb-2 opacity-20" />
        <p>No activity yet. Be the first to grab a beer!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentDrinkers.map((drinker, index) => (
        <div
          key={drinker.id}
          className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-beer-foam to-transparent hover:from-beer-light transition-colors"
          style={{
            animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
          }}
        >
          {/* Avatar */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-beer-amber to-beer-dark flex items-center justify-center text-white font-bold shadow-md barrel-shine">
            {drinker.initial}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{drinker.username}</div>
            <div className="text-xs text-muted-foreground">
              {drinker.lastBeer && new Date(drinker.lastBeer).toLocaleTimeString()}
            </div>
          </div>

          {/* Beer count badge */}
          <div className="flex-shrink-0 px-2 py-1 bg-beer-dark text-white rounded-full text-xs font-bold">
            {drinker.count} 🍺
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BarrelVisualization({
  todayBarrel,
  recordBarrel,
  drinkers
}: BarrelVisualizationProps) {
  return (
    <Card className="bg-gradient-to-br from-beer-foam via-white to-beer-light/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-beer-dark font-['Bungee']">
          <Beer className="h-6 w-6" />
          Barrel Status
        </CardTitle>
        <CardDescription>
          Track the barrels filling up throughout the day
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Barrels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-6 border-b border-beer-dark/20">
          <Barrel
            count={todayBarrel.count}
            capacity={todayBarrel.capacity}
            label="Today's Barrel"
            color="beer-amber"
            icon={TrendingUp}
          />
          <Barrel
            count={recordBarrel.count}
            capacity={recordBarrel.capacity}
            label="Record Holder"
            color="hops-green"
            icon={Trophy}
          />
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-semibold text-beer-dark mb-4 font-['Bungee'] flex items-center gap-2">
            <Beer className="h-5 w-5" />
            Recent Activity
          </h3>
          <RecentActivity drinkers={drinkers} />
        </div>
      </CardContent>
    </Card>
  );
}

// Add slide-in animation to global styles if not already present
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
if (!document.head.querySelector('style[data-barrel-viz]')) {
  style.setAttribute('data-barrel-viz', 'true');
  document.head.appendChild(style);
}
