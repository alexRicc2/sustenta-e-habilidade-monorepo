import Image from "next/image";
import { event, publicSrc } from "@/lib/event";
import { EventTagline } from "./ods-link";
import { MarkerHighlight } from "./marker-highlight";
import { Wave } from "./wave";

const polaroids = [
  { src: "/poster.jpg", alt: "Cartaz do II Sustenta & Habilidade", rotate: "-8deg", top: "8%", left: "6%", fit: "cover" },
  { src: "/logo.png", alt: "Logotipo Sustenta & Habilidade", rotate: "7deg", top: "18%", right: "8%", fit: "contain" },
  { src: "/logos/Logo GIQAV.jpeg", alt: "Logotipo GIQAV", rotate: "4deg", bottom: "10%", left: "14%", fit: "contain" },
  { src: "/logos/pet-quimica.avif", alt: "Logotipo PET Química Ambiental", rotate: "-6deg", bottom: "12%", right: "12%", fit: "contain" },
] as const;

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-forest-deep">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-forest-deep [clip-path:ellipse(70%_100%_at_50%_0%)] md:h-24" />
      <div className="hex-grid relative min-h-[80vh] md:min-h-[92vh]">
        <div className="absolute inset-0 bg-forest-deep/25" />
        {polaroids.map((card) => (
          <div
            key={`${card.alt}-${card.rotate}`}
            className="polaroid absolute hidden w-40 md:block lg:w-52"
            style={{
              transform: `rotate(${card.rotate})`,
              top: "top" in card ? card.top : undefined,
              left: "left" in card ? card.left : undefined,
              right: "right" in card ? card.right : undefined,
              bottom: "bottom" in card ? card.bottom : undefined,
            }}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-mint">
              <Image
                src={publicSrc(card.src)}
                alt={card.alt}
                fill
                className={card.fit === "contain" ? "object-contain p-3" : "object-cover"}
                sizes="220px"
              />
            </div>
          </div>
        ))}

        <div className="relative z-10 mx-auto flex  min-h-[70vh] md:min-h-[92vh] max-w-5xl flex-col items-center justify-center px-4 py-28 text-center">
          <div className="w-full rounded-sm bg-forest px-6 py-8 text-white shadow-[0_20px_50px_rgba(0,0,0,0.28)] md:px-14 md:py-10">
            <p className="text-sm font-extrabold tracking-[0.35em] text-sky">
              {event.edition} EDIÇÃO · {event.year}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-none md:text-6xl lg:text-7xl">
              Sustenta <span className="text-sky">&amp;</span> Habilidade
            </h1>
            <EventTagline
              className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-mint md:text-base"
              odsClassName="text-sky underline decoration-sky/80 decoration-2 underline-offset-4 transition hover:text-white"
            />
          </div>
          <p className="mt-8 max-w-xl text-sm font-bold uppercase tracking-[0.22em] text-forest-deep md:text-base">
            {event.datesShort} · {event.location}
          </p>
          <p className="mt-2 text-sm font-semibold text-forest/80">{event.campus}</p>
        </div>
      </div>
      <Wave className="relative z-10 -mb-px" fill="#f6faf3" />
    </section>
  );
}
