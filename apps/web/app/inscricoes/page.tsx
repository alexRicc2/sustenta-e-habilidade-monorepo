import Link from "next/link";
import { InscriptionForm } from "@/components/inscription-form";

export default function InscricoesPage() {
  return (
    <main className="hex-grid min-h-screen bg-forest-deep px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex rounded-full border border-white/20 bg-forest/70 px-4 py-2 text-sm font-bold text-white hover:bg-forest"
        >
          ← Voltar
        </Link>
        <div className="mt-8">
          <InscriptionForm />
        </div>
      </div>
    </main>
  );
}
