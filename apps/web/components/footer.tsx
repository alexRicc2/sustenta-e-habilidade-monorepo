import Link from "next/link";
import { event, navItems } from "@/lib/event";
import { EventTagline } from "./ods-link";

export function Footer() {
  return (
    <footer className="bg-forest-deep px-4 py-12 text-white md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-display text-3xl">
            {event.edition} {event.name}
          </p>
          <EventTagline
            className="mt-2 max-w-sm text-sm text-white/70"
            odsClassName="text-sky underline decoration-sky/70 underline-offset-4 transition hover:text-white"
          />
          <p className="mt-4 text-sm text-mint">
            {event.address}
            <br />
            {event.campus}
          </p>
        </div>
        <nav className="flex flex-col gap-2 text-sm font-bold uppercase tracking-widest text-white/80">
          {navItems.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="hover:text-sky">
              {item.label}
            </a>
          ))}
          <Link href="/inscricoes" className="hover:text-sky">
            Inscrições
          </Link>
        </nav>
      </div>
    </footer>
  );
}
