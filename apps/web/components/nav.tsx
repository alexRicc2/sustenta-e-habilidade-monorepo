"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { navItems } from "@/lib/event";

const darkSectionIds = new Set(["programacao"]);

function currentSectionId() {
  const activationLine = window.innerHeight * 0.32;
  let current = navItems[0].id;
  for (const item of navItems) {
    const section = document.getElementById(item.id);
    if (section && section.getBoundingClientRect().top <= activationLine) {
      current = item.id;
    }
  }
  return current;
}

function isTocOverDark() {
  const y = window.innerHeight / 2;
  const elements = [
    ...navItems.map((item) => document.getElementById(item.id)),
    document.querySelector("footer"),
  ].filter((el): el is HTMLElement => Boolean(el));

  for (let i = elements.length - 1; i >= 0; i -= 1) {
    const rect = elements[i].getBoundingClientRect();
    if (rect.top <= y && rect.bottom > y) {
      const id = elements[i].tagName === "FOOTER" ? "footer" : elements[i].id;
      return id === "footer" || darkSectionIds.has(id);
    }
  }
  return false;
}

export function SideNav() {
  const [active, setActive] = useState("inicio");
  const [onDark, setOnDark] = useState(false);
  const syncRef = useRef<() => void>(() => {});

  useEffect(() => {
    let frame = 0;
    const timeouts: number[] = [];

    const update = () => {
      setActive(currentSectionId());
      setOnDark(isTocOverDark());
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    const syncAfterScroll = () => {
      scheduleUpdate();
      [80, 200, 400, 700].forEach((delay) => {
        timeouts.push(window.setTimeout(update, delay));
      });
    };

    syncRef.current = syncAfterScroll;

    const observer = new IntersectionObserver(scheduleUpdate, {
      threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
    });
    navItems.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) observer.observe(section);
    });
    const footer = document.querySelector("footer");
    if (footer) observer.observe(footer);

    update();
    document.addEventListener("scroll", scheduleUpdate, { passive: true, capture: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", syncAfterScroll);
    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      timeouts.forEach((id) => window.clearTimeout(id));
      document.removeEventListener("scroll", scheduleUpdate, { capture: true });
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", syncAfterScroll);
    };
  }, []);

  return (
    <nav
      aria-label="Navegação por seções"
      className="pointer-events-none fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
    >
      <ul className="pointer-events-auto flex flex-col gap-3">
        {navItems.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="group flex items-center gap-3"
              aria-current={active === item.id ? "true" : undefined}
              onClick={() => {
                setActive(item.id);
                setOnDark(item.id === "programacao");
                window.setTimeout(() => syncRef.current(), 0);
              }}
            >
              <span
                className={`h-3 w-3 rounded-full border-2 transition ${
                  active === item.id
                    ? onDark
                      ? "border-white bg-white"
                      : "border-leaf bg-leaf"
                    : onDark
                      ? "border-white/55 bg-transparent group-hover:border-white"
                      : "border-forest/40 bg-transparent group-hover:border-leaf"
                }`}
              />
              <span
                className={`text-xs font-extrabold uppercase tracking-[0.18em] transition ${
                  active === item.id
                    ? onDark
                      ? "text-white"
                      : "text-forest"
                    : onDark
                      ? "text-white/0 group-hover:text-white/80"
                      : "text-forest/0 group-hover:text-forest/70"
                }`}
              >
                {item.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function HeaderCta() {
  return (
    <Link
      href="/inscricoes"
      className="fixed right-4 top-4 z-50 rounded-full bg-olive px-5 py-2.5 text-sm font-extrabold uppercase tracking-[0.16em] text-white shadow-lg shadow-forest/20 transition hover:bg-leaf md:right-8 md:top-6"
    >
      Inscreva-se
    </Link>
  );
}
