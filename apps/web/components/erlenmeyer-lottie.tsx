"use client";

import { LottieSvg } from "lottie-react";
import { useEffect, useState } from "react";
import animationData from "../public/animation/erienmeyer.json";

export function ErlenmeyerLottie({ className }: { className?: string }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return (
    <LottieSvg
      src={animationData}
      loop={!reduceMotion}
      autoplay={!reduceMotion}
      aria-hidden
      className={className}
    />
  );
}
