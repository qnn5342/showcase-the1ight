"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  duration?: number;
}

export function AnimatedCounter({
  target,
  suffix = "",
  duration = 1500,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          const startTime = performance.now();

          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) {
              requestAnimationFrame(tick);
            }
          };

          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}
