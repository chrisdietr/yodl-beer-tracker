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
    <></>
  );
}
