"use client";

import { useState } from "react";
import { InscriptionForm } from "@/components/inscription-form";
import { MarkerHighlight } from "./marker-highlight";

export function InscriptionSection() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="inscricao" className="scroll-mt-24 bg-forest-deep px-4 py-20 md:px-8">
      <div className="mx-auto max-w-3xl">
        {submitted ? null : (
          <>
            <p className="text-center text-sm font-extrabold uppercase tracking-[0.28em] text-sky">Participe</p>
            <h2 className="mt-3 text-center font-display text-4xl text-white md:text-5xl">
              <MarkerHighlight>Inscrição</MarkerHighlight>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-lg leading-8 text-white/75">
              Escolha sua categoria e finalize o pagamento via Pix. A organização confirma a vaga após validar o
              comprovante.
            </p>
          </>
        )}
        <div className={submitted ? undefined : "mt-10"}>
          <InscriptionForm onSuccess={() => setSubmitted(true)} />
        </div>
      </div>
    </section>
  );
}
