import Image from "next/image";
import { odsCopy, publicSrc } from "@/lib/event";
import { MarkerHighlight } from "./marker-highlight";

const goalAccents = ["bg-[#e5243b]", "bg-[#dd1367]", "bg-[#3f7e44]"];

export function Ods() {
  return (
    <section id="ods" className="scroll-mt-8 bg-mint px-4 py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-olive">Agenda 2030</p>
        <h2 className="mt-3 max-w-4xl font-display text-3xl leading-tight text-forest md:text-5xl">
          Os <MarkerHighlight>Objetivos de Desenvolvimento Sustentável</MarkerHighlight>
        </h2>
        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-lg leading-8 text-ink/80">{odsCopy.intro}</p>
            <ol className="mt-6 space-y-3">
              {odsCopy.goals.map((goal, index) => (
                <li key={goal} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white ${goalAccents[index]}`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-base font-semibold leading-7 text-forest">{goal}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-lg leading-8 text-ink/80">{odsCopy.body}</p>
          </div>
          <figure className="overflow-hidden rounded-3xl bg-paper p-3 shadow-sm shadow-forest/10 lg:p-4">
            <Image
              src={publicSrc("/objetivos_port.png")}
              alt="Os 17 Objetivos de Desenvolvimento Sustentável da ONU"
              width={1155}
              height={728}
              className="h-auto w-full"
              sizes="(max-width: 1024px) 100vw, 720px"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
