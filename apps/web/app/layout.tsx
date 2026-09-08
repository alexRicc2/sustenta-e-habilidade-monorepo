import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import { publicSrc } from "@/lib/event";
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

export const metadata: Metadata = {
  title: "II Sustenta & Habilidade — 2026",
  description:
    "Ações e Inovações em Química na Busca dos ODS. 05 e 06 de outubro de 2026, Auditório A, UNESP/IBILCE.",
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
