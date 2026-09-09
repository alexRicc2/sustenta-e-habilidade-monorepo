import Image from "next/image";
import { instagram, publicSrc } from "@/lib/event";
import { MarkerHighlight } from "./marker-highlight";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.35" cy="6.65" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Instagram() {
  return (
    <section id="instagram" className="scroll-mt-8 bg-cream px-4 py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-olive">Redes sociais</p>
        <h2 className="mt-3 font-display text-4xl text-forest md:text-5xl">
          <MarkerHighlight>Instagram</MarkerHighlight>
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/75">
          Acompanhe os bastidores, avisos e a programação no{" "}
          <a
            href={instagram.url}
            target="_blank"
            rel="noreferrer"
            className="font-extrabold text-forest underline decoration-olive/80 underline-offset-4 transition hover:text-leaf"
          >
            @{instagram.handle}
          </a>
          .
        </p>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {instagram.posts.map((post) => (
            <a
              key={post.src}
              href={instagram.url}
              target="_blank"
              rel="noreferrer"
              aria-label={post.alt}
              className="group relative aspect-square overflow-hidden rounded-3xl bg-paper shadow-sm shadow-forest/10"
            >
              <Image
                src={publicSrc(post.src)}
                alt={post.alt}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-forest-deep/0 opacity-0 transition group-hover:bg-forest-deep/45 group-hover:opacity-100">
                <InstagramIcon className="h-8 w-8 text-white" />
              </span>
            </a>
          ))}
        </div>

        <a
          href={instagram.url}
          target="_blank"
          rel="noreferrer"
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-olive px-6 py-3 text-sm font-extrabold uppercase tracking-[0.16em] text-white shadow-lg shadow-forest/15 transition hover:bg-leaf"
        >
          <InstagramIcon className="h-5 w-5" />
          Seguir no Instagram
        </a>
      </div>
    </section>
  );
}
