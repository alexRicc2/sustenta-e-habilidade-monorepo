import { HeaderCta, SideNav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Ods } from "@/components/ods";
import { Schedule } from "@/components/schedule";
import { Sponsors } from "@/components/sponsors";
import { Organizers } from "@/components/organizers";
import { InscriptionSection } from "@/components/inscription-section";
import { Instagram } from "@/components/instagram";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <SideNav />
      <HeaderCta />
      <Hero />
      <About />
      <Ods />
      <Schedule />
      <Sponsors />
      <Organizers />
      <InscriptionSection />
      <Instagram />
      <Footer />
    </>
  );
}
