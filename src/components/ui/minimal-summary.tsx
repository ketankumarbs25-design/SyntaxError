import { useEffect, useState } from "react";
import { LiveStats } from "@/components/stats/LiveStats";
import { useInView } from "react-intersection-observer";
import type { SimStats } from "@/sim/types";

type MinimalSummaryProps = {
  /** Simulation stats to display */
  stats: SimStats;
};

/**
 * Minimal UI that shows only the live‑stats card.
 * It fades in and slides up when it becomes visible.
 */
export function MinimalSummary({ stats }: MinimalSummaryProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView && !hasAnimated) setHasAnimated(true);
  }, [inView, hasAnimated]);

  return (
    <section
      ref={ref}
      className={`max-w-4xl mx-auto p-6 transition-all duration-700 ease-out ${
        hasAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <LiveStats stats={stats} totalCells={1} />
    </section>
  );
}
