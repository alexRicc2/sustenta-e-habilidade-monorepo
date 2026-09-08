import Image from "next/image";
import { publicSrc, sponsorTiers } from "@/lib/event";

export function Sponsors() {
  return (
    <section id="patrocinadores" className="bg-cream px-4 py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-olive">Parcerias</p>
        <h2 className="mt-3 font-display text-4xl text-forest md:text-5xl">Patrocinadores</h2>
        <p className="mt-4 max-w-2xl text-lg text-ink/75">
          O evento é feito por estudantes e pesquisadores. Empresas e instituições que queiram apoiar a
          Química Verde e a formação acadêmica são bem-vindas.
        </p>
        <div className="mt-10 space-y-10">
          {sponsorTiers.map((tier) => (
            <div key={tier.name}>
              <h3 className="text-sm font-extrabold uppercase tracking-[0.24em] text-forest">{tier.name}</h3>
              <div
                className={`mt-3 grid gap-3 ${
                  tier.name === "Diamante"
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-2 md:grid-cols-3"
                }`}
              >
                {tier.sponsors.map((sponsor) => (
                  <div
                    key={sponsor.src}
                    className="flex h-28 items-center justify-center rounded-2xl border border-forest/10 bg-paper px-5 py-4 shadow-sm shadow-forest/5 md:h-32"
                  >
                    <Image
                      src={publicSrc(sponsor.src)}
                      alt={sponsor.name}
                      width={220}
                      height={96}
                      className="max-h-20 w-auto max-w-full object-contain md:max-h-24"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
