"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function MarkerHighlight({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [highlighted, setHighlighted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => setHighlighted(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.55 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={`marker-highlight ${highlighted ? "is-visible" : ""}`}>
      {children}
    </span>
  );
}
