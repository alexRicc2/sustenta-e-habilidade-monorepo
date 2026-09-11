"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  days,
  kindLabels,
  publicSrc,
  schedule,
  type DayId,
  type Session,
  type SessionKind,
} from "@/lib/event";
import { MarkerHighlight } from "./marker-highlight";

const kindFilters: (SessionKind | "todos")[] = [
  "todos",
  "conferencia",
  "palestra",
  "minicurso",
  "mesa",
];

function sessionPortraits(session: Session) {
  if (session.speakers?.length) {
    return session.speakers
      .filter((person) => person.photo)
      .map((person) => ({ src: person.photo as string, alt: person.name }));
  }
  if (session.photo) {
    return [{ src: session.photo, alt: session.speaker ?? session.title }];
  }
  return [];
}

function SpeakerPhoto({ src, alt, size = 56 }: { src: string; alt: string; size?: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full bg-forest-deep ring-2 ring-white/25"
      style={{ width: size, height: size }}
    >
      <Image
        src={publicSrc(src)}
        alt={alt}
        fill
        className="object-cover object-top"
        sizes={`${size}px`}
      />
    </div>
  );
}

function SessionSpeakers({ session }: { session: Session }) {
  if (session.speakers?.length) {
    return (
      <ul className="mt-3 space-y-3">
        {session.speakers.map((person) => (
          <li key={person.name} className="flex items-start gap-3">
            {person.photo ? <SpeakerPhoto src={person.photo} alt={person.name} size={48} /> : null}
            <div className="min-w-0">
              {person.topic ? (
                <p className="text-sm font-semibold leading-snug text-white/90">{person.topic}</p>
              ) : null}
              <p className="mt-0.5 text-sm text-white/75">
                {person.name}
                {person.affiliation ? ` · ${person.affiliation}` : ""}
                {person.remote ? " · remoto" : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (!session.speaker) return null;

  return (
    <p className="mt-1 text-sm text-white/75">
      {session.speaker}
      {session.affiliation ? ` · ${session.affiliation}` : ""}
    </p>
  );
}

export function Schedule() {
  const [day, setDay] = useState<DayId | "todos">("segunda");
  const [kind, setKind] = useState<(typeof kindFilters)[number]>("todos");

  const sessions = useMemo(
    () =>
      schedule.filter((session) => {
        const dayOk = day === "todos" || session.day === day;
        const kindOk = kind === "todos" || session.kind === kind;
        return dayOk && kindOk;
      }),
    [day, kind],
  );

  const heading =
    day === "todos"
      ? "PROGRAMAÇÃO COMPLETA"
      : day === "segunda"
        ? "SEGUNDA-FEIRA · 05/10"
        : "TERÇA-FEIRA · 06/10";

  return (
    <section id="programacao" className="bg-forest px-4 py-20 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-sky">Agenda</p>
        <h2 className="mt-3 font-display text-4xl md:text-6xl">
          <MarkerHighlight>{heading}</MarkerHighlight>
        </h2>

        <div className="mt-8 flex flex-wrap gap-3">
          {days.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setDay(item.id)}
              className={`cursor-pointer rounded-full px-5 py-2 text-sm font-extrabold uppercase tracking-widest ${
                day === item.id ? "bg-olive text-white" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setDay("todos")}
            className={`cursor-pointer rounded-full px-5 py-2 text-sm font-extrabold uppercase tracking-widest ${
              day === "todos" ? "bg-olive text-white" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            Todos
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {kindFilters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setKind(item)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${
                kind === item ? "bg-sky text-forest-deep" : "border border-white/20 hover:bg-white/10"
              }`}
            >
              {item === "todos" ? "Todos os tipos" : kindLabels[item]}
            </button>
          ))}
        </div>

        <ul className="mt-10 space-y-4">
          {sessions.map((session) => {
            const portraits = session.speakers?.length ? [] : sessionPortraits(session);

            return (
              <li
                key={session.id}
                className="flex flex-col gap-4 rounded-3xl bg-white/8 p-5 sm:flex-row sm:items-center"
              >
                <p className="font-display text-2xl text-sky sm:w-22">{session.time}</p>
                {portraits.length ? (
                  <div className="flex shrink-0">
                    {portraits.map((portrait) => (
                      <SpeakerPhoto key={portrait.src} src={portrait.src} alt={portrait.alt} />
                    ))}
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-olive">
                    {kindLabels[session.kind]}
                    {session.remote ? " · remoto" : ""}
                  </p>
                  <h3 className="mt-1 text-lg font-bold leading-snug">{session.title}</h3>
                  <SessionSpeakers session={session} />
                </div>
                <span className="hidden shrink-0 rounded-full border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/70 md:inline">
                  {session.day === "segunda" ? "05/10" : "06/10"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
