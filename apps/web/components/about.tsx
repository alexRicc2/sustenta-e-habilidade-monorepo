import { aboutCopy, event } from "@/lib/event";

const cards = [
  { title: "Quem somos", body: aboutCopy.quemSomos },
  { title: "O que oferecemos", body: aboutCopy.oQueOferecemos },
  { title: "O que buscamos", body: aboutCopy.oQueBuscamos },
];

export function About() {
  return (
    <section id="sobre" className="bg-cream px-4 py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-olive">Sobre o evento</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl text-forest md:text-5xl">
          Ciência, sustentabilidade e formação em um só encontro.
        </h2>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-ink/80">{aboutCopy.intro}</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-forest/10 bg-paper p-7 shadow-sm shadow-forest/5"
            >
              <h3 className="font-display text-2xl text-forest">{card.title}</h3>
              <p className="mt-4 leading-7 text-ink/75">{card.body}</p>
            </article>
          ))}
        </div>
        <p className="mt-10 text-sm font-semibold text-forest/70">
          Coordenação: {event.coordinator.name} · {event.department}
        </p>
      </div>
    </section>
  );
}
