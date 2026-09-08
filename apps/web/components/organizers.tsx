import Image from "next/image";
import { event, organizers, publicSrc } from "@/lib/event";

export function Organizers() {
  return (
    <section id="organizacao" className="bg-mint px-4 py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-olive">Quem faz o evento</p>
        <h2 className="mt-3 font-display text-4xl text-forest md:text-5xl">Organização</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl bg-forest p-7 text-white">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky">Coordenação</p>
            <h3 className="mt-4 font-display text-2xl">{event.coordinator.name}</h3>
            <p className="mt-2 text-sm text-mint">{event.department}</p>
            <p className="mt-6 text-sm leading-6 text-white/80">
              GIQAV e PET QA, vinculados à UNESP/IBILCE, unem pesquisa em Química Analítica Verde e formação
              tutorial em Química Ambiental.
            </p>
          </article>
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
