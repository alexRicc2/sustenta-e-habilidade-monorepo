import Image from "next/image";
import { coordination, organizers, publicSrc } from "@/lib/event";
import { ComissaoCarousel } from "./comissao-carousel";
import { MarkerHighlight } from "./marker-highlight";

export function Organizers() {
  return (
    <section id="organizacao" className="bg-mint px-4 py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-olive">Quem faz o evento</p>
        <h2 className="mt-3 font-display text-4xl text-forest md:text-5xl">
          <MarkerHighlight>Organização</MarkerHighlight>
        </h2>

        <p className="mt-10 text-xs font-extrabold uppercase tracking-[0.2em] text-olive">Coordenação</p>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          {coordination.map((person) => (
            <article
              key={person.id}
              className="overflow-hidden rounded-3xl bg-forest text-white shadow-sm shadow-forest/15"
            >
              <div className="relative aspect-4/5 bg-forest-deep">
                <Image
                  src={publicSrc(person.photo)}
                  alt={person.name}
                  fill
                  className="object-cover"
                  style={{ objectPosition: person.imagePosition }}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky">{person.role}</p>
                <h3 className="mt-2 min-h-16 font-display text-xl leading-snug md:min-h-20 md:text-2xl">
                  {person.name}
                </h3>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-14 text-xs font-extrabold uppercase tracking-[0.2em] text-olive">Comissão Organizadora</p>
        <ComissaoCarousel />

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {organizers.map((group) => (
            <article key={group.id} className="rounded-3xl bg-paper p-7 shadow-sm">
              <Image
                src={publicSrc(group.logo)}
                alt={`Logotipo ${group.name}`}
                width={160}
                height={64}
                className="mb-4 h-16 w-auto max-w-44 object-contain object-left"
              />
              <h3 className="font-display text-2xl text-forest">{group.name}</h3>
              <p className="mt-1 text-sm font-bold text-olive">{group.fullName}</p>
              <p className="mt-4 leading-7 text-ink/75">{group.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
