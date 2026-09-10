import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import { event, publicSrc, siteSeo } from "@/lib/event";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: siteSeo.title,
    template: "%s · II Sustenta & Habilidade",
  },
  description: siteSeo.description,
  applicationName: `${event.edition} ${event.name}`,
  keywords: [
    "Sustenta e Habilidade",
    "UNESP",
    "IBILCE",
    "Química",
    "ODS",
    "inscrição",
    "evento científico",
    "São José do Rio Preto",
  ],
  authors: [{ name: `${event.edition} ${event.name}` }],
  creator: `${event.edition} ${event.name}`,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: `${event.edition} ${event.name}`,
    title: `${event.edition} ${event.name} — ${event.datesLabel}`,
    description: siteSeo.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${event.edition} ${event.name} — ${event.datesLabel}`,
    description: siteSeo.description,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: publicSrc("/favicon-sustenta.png"), type: "image/png" }],
    apple: publicSrc("/favicon-sustenta.png"),
    shortcut: publicSrc("/favicon-sustenta.png"),
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${nunito.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">{children}</body>
    </html>
  );
}
