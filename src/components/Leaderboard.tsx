import React, { useRef, useEffect } from "react";
import { DrinkerWithStats } from "@shared/schema";
import { formatDistanceToNow } from "../lib/timeUtils";

interface LeaderboardProps {
  drinkers: DrinkerWithStats[];
  isLoading: boolean;
}

export default function Leaderboard({ drinkers, isLoading }: LeaderboardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Animation logic
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let direction: "down" | "up" = "down";
    let interval: NodeJS.Timeout | null = null;
    let pauseTimeout: NodeJS.Timeout | null = null;

    const scrollStep = 3; // px per tick
    const tick = 20; // ms per tick
    const pauseDuration = 2000; // ms to pause at top/bottom

    function animateScroll() {
      if (!scrollContainer) return;
      if (direction === "down") {
        if (
          scrollContainer.scrollTop + scrollContainer.clientHeight <
          scrollContainer.scrollHeight
        ) {
          scrollContainer.scrollTop += scrollStep;
        } else {
          direction = "up";
          pauseTimeout = setTimeout(() => {
            interval = setInterval(animateScroll, tick);
          }, pauseDuration);
          if (interval) clearInterval(interval);
        }
      } else {
        if (scrollContainer.scrollTop > 0) {
          scrollContainer.scrollTop -= scrollStep;
        } else {
          direction = "down";
          pauseTimeout = setTimeout(() => {
            interval = setInterval(animateScroll, tick);
          }, pauseDuration);
          if (interval) clearInterval(interval);
        }
      }
    }

    interval = setInterval(animateScroll, tick);

    return () => {
      if (interval) clearInterval(interval);
      if (pauseTimeout) clearTimeout(pauseTimeout);
    };
  }, [drinkers.length]);

  // Get trend icon based on trend value
  const getTrendIcon = (trend: string | undefined) => {
    switch(trend) {
      case 'up':
        return <div className="ml-2 text-hops-green"><i className="ri-arrow-up-fill"></i></div>;
      case 'down':
        return <div className="ml-2 text-red-500"><i className="ri-arrow-down-fill"></i></div>;
      default:
        return <div className="ml-2 text-beer-amber"><i className="ri-subtract-line"></i></div>;
    }
  };

  return (
    <div className="lg:col-span-1">
      <section
        className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-beer-amber"
        aria-labelledby="leaderboard-title"
      >
        <div className="px-6 py-4 bg-beer-amber">
          <h2 id="leaderboard-title" className="text-2xl font-bungee text-white">
            Leaderboard
          </h2>
        </div>

        {isLoading ? (
          <div
            id="leaderboard-loading"
            className="p-8 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="inline-block animate-spin mr-2" aria-hidden="true">
              <i className="ri-loader-4-line text-3xl text-beer-amber"></i>
            </div>
            <p className="text-barrel-light">Fetching drinkers...</p>
          </div>
        ) : drinkers.length === 0 ? (
          <div
            id="leaderboard-empty"
            className="p-8 text-center"
            role="status"
          >
            <div className="mb-4" aria-hidden="true">
              <i className="ri-beer-line text-5xl text-beer-amber"></i>
            </div>
            <p className="text-barrel-light">
              No drinks recorded yet. Time to start the party!
            </p>
          </div>
        ) : (
          <>
            <div className="px-6 py-2 bg-beer-light text-barrel-dark text-sm font-bold flex items-center justify-between border-b border-beer-amber">
              <span>All Drinkers</span>
              <span
                className="rounded-full bg-beer-amber text-white px-2 py-0.5 text-xs font-bungee"
                aria-label={`${drinkers.length} total drinkers`}
              >
                {drinkers.length}
              </span>
            </div>
            <div
              ref={scrollRef}
              className="divide-y divide-beer-light"
              style={{ maxHeight: "450px", minHeight: "450px", overflowY: "auto" }}
              role="list"
              aria-label="Ranked list of drinkers"
            >
              {drinkers.map((drinker, index) => (
                <article
                  key={drinker.id}
                  className="leaderboard-item p-4 hover:bg-beer-light transition-colors relative"
                  role="listitem"
                  aria-label={`Rank ${index + 1}: ${drinker.username} with ${drinker.count} beers`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="text-xl font-bungee text-beer-amber w-8"
                      aria-label={`Rank ${index + 1}`}
                    >
                      {index + 1}
                    </div>
                    <div
                      className="w-10 h-10 bg-beer-amber rounded-full flex items-center justify-center border-2 border-beer-dark relative"
                      role="img"
                      aria-label={`Avatar for ${drinker.username}`}
                    >
                      <span className="text-lg font-bold text-white">
                        {drinker.initial}
                      </span>
                      <div className="barrel-shine" aria-hidden="true"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{drinker.username}</h3>
                      <p className="text-sm text-barrel-light">
                        <span className="sr-only">Last consumed </span>
                        Last beer:{" "}
                        <time dateTime={drinker.lastBeer}>
                          {drinker.lastBeer
                            ? formatDistanceToNow(new Date(drinker.lastBeer))
                            : "Never"}
                        </time>
                      </p>
                    </div>
                    <div
                      className="text-2xl font-bungee text-beer-amber"
                      aria-label={`${drinker.count} beers consumed`}
                    >
                      {drinker.count}
                    </div>
                    <div aria-label={`Trend: ${drinker.trend || 'neutral'}`}>
                      {getTrendIcon(drinker.trend)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
