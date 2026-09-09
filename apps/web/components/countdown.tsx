"use client";

import { useEffect, useState } from "react";
import { event } from "@/lib/event";

const units = [
  { key: "days", label: "Dias" },
  { key: "hours", label: "Horas" },
  { key: "minutes", label: "Minutos" },
  { key: "seconds", label: "Segundos" },
] as const;

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  status: "upcoming" | "live" | "ended";
};

function getRemaining(now: number): Remaining {
  const start = new Date(event.startsAt).getTime();
  const end = new Date(event.endsAt).getTime();

  if (now >= end) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, status: "ended" };
  }
  if (now >= start) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, status: "live" };
  }

  const diff = start - now;
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
    status: "upcoming",
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function Countdown() {
  const [time, setTime] = useState<Remaining | null>(null);

  useEffect(() => {
    const tick = () => setTime(getRemaining(Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (time?.status === "live") {
    return (
      <p className="mt-8 rounded-xl bg-forest-deep/55 px-4 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-sky">
        O evento está acontecendo
      </p>
    );
  }

  if (time?.status === "ended") {
    return (
      <p className="mt-8 rounded-xl bg-forest-deep/55 px-4 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-sky">
        Obrigado por participar da {event.edition} edição
      </p>
    );
  }

  const display = time ?? { days: 0, hours: 0, minutes: 0, seconds: 0, status: "upcoming" as const };

  return (
    <div className="mt-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-sky">Começa em</p>
      <div
        className={`mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 ${time ? "" : "invisible"}`}
        role="timer"
        aria-label={`Faltam ${display.days} dias, ${display.hours} horas, ${display.minutes} minutos e ${display.seconds} segundos para o evento`}
      >
        {units.map((unit) => (
          <div key={unit.key} className="rounded-xl bg-forest-deep/55 px-1 py-3 md:px-3 md:py-4">
            <p className="font-display text-2xl leading-none text-sky tabular-nums md:text-4xl">
              {pad(display[unit.key])}
            </p>
            <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-mint md:text-xs">
              {unit.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
