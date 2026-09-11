"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { comissao, publicSrc, teamLogos } from "@/lib/event";
import { ErlenmeyerLottie } from "./erlenmeyer-lottie";

const AUTOPLAY_MS = 5000;

function useSlidesPerView() {
  const [perView, setPerView] = useState(1);

  useEffect(() => {
    const tablet = window.matchMedia("(min-width: 768px)");
    const desktop = window.matchMedia("(min-width: 1024px)");
    const sync = () => setPerView(desktop.matches ? 3 : tablet.matches ? 2 : 1);
    sync();
    tablet.addEventListener("change", sync);
    desktop.addEventListener("change", sync);
    return () => {
      tablet.removeEventListener("change", sync);
      desktop.removeEventListener("change", sync);
    };
  }, []);

  return perView;
}

export function ComissaoCarousel() {
  const people = comissao.people;
  const perView = useSlidesPerView();
  const maxIndex = Math.max(0, people.length - perView);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const directionRef = useRef(1);

  useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (paused || maxIndex === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setTimeout(() => {
      setIndex((current) => {
        let direction = directionRef.current;
        if (current >= maxIndex) direction = -1;
        else if (current <= 0) direction = 1;
        directionRef.current = direction;
        return current + direction;
      });
    }, AUTOPLAY_MS);

    return () => window.clearTimeout(id);
  }, [index, maxIndex, paused]);

  const go = useCallback(
    (direction: number) => {
      setIndex((current) => Math.min(maxIndex, Math.max(0, current + direction)));
    },
    [maxIndex],
  );

  return (
    <div className="mt-4">
      <div
        className="relative z-9999"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          const next = event.relatedTarget;
          if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
            setPaused(false);
          }
        }}
        onTouchStart={(event) => {
          setPaused(true);
          setTouchStart(event.changedTouches[0]?.clientX ?? null);
        }}
        onTouchEnd={(event) => {
          if (touchStart == null) return;
          const delta = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart;
          if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
          setTouchStart(null);
          setPaused(false);
        }}
      >
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
          >
            {people.map((person) => (
              <article
                key={`${person.name}-${person.photo}`}
                className="shrink-0 px-1.5 sm:px-2"
                style={{ width: `${100 / perView}%` }}
              >
                <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-forest-deep text-white shadow-sm shadow-forest/15">
                  <Image
                    src={publicSrc(person.photo)}
                    alt={person.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="pointer-events-none absolute -top-8 -left-8 z-10 h-28 w-28 md:h-32 md:w-32">
                    <ErlenmeyerLottie className="h-full w-full" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-forest-deep/92 via-forest-deep/70 to-transparent px-5 pt-16 pb-5">
                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky">
                          {person.role}
                        </p>
                        <h3 className="mt-1 font-display text-xl leading-snug drop-shadow-sm md:text-2xl">
                          {person.name}
                        </h3>
                      </div>
                      <Image
                        src={publicSrc(teamLogos[person.team])}
                        alt={`Logo ${person.team}`}
                        width={72}
                        height={40}
                        className="h-12 w-auto max-w-20 shrink-0 rounded-md bg-white/90 object-contain p-1"
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <button
          type="button"
          aria-label="Membro anterior"
          disabled={index === 0}
          onClick={() => go(-1)}
          className="absolute top-1/2 left-2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-olive text-lg font-extrabold text-white shadow-lg shadow-forest/20 transition hover:bg-leaf disabled:opacity-35 md:left-3"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Próximo membro"
          disabled={index === maxIndex}
          onClick={() => go(1)}
          className="absolute top-1/2 right-2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-olive text-lg font-extrabold text-white shadow-lg shadow-forest/20 transition hover:bg-leaf disabled:opacity-35 md:right-3"
        >
          ›
        </button>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <p className="shrink-0 whitespace-nowrap text-sm font-bold text-forest/70">
          {perView === 1
            ? `${index + 1} de ${people.length}`
            : `${index + 1}–${Math.min(index + perView, people.length)} de ${people.length}`}
        </p>
        <div className="flex max-w-[min(100%,18rem)] gap-1.5 overflow-x-auto px-1">
          {people.slice(0, maxIndex + 1).map((_, dot) => (
            <button
              key={dot}
              type="button"
              aria-label={`Ir para o cartão ${dot + 1}`}
              onClick={() => setIndex(dot)}
              className={`h-2.5 shrink-0 rounded-full transition ${
                dot === index ? "w-6 bg-olive" : "w-2.5 bg-forest/25 hover:bg-forest/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
