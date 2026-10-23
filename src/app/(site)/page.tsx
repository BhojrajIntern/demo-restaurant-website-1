import { Events } from "@/components/home/Events";
import { Gallery } from "@/components/home/Gallery";
import { Hero } from "@/components/home/Hero";
import { KitchenFilm } from "@/components/home/KitchenFilm";
import { MenuPreview } from "@/components/home/MenuPreview";
import { Newsletter } from "@/components/home/Newsletter";
import { Offers } from "@/components/home/Offers";
import { PrivateDining } from "@/components/home/PrivateDining";
import { Reservation } from "@/components/home/Reservation";
import { Reviews } from "@/components/home/Reviews";
import { Signature } from "@/components/home/Signature";
import { Chef, Faq, Marquee, Paths, Story } from "@/components/home/StaticSections";
import { Visit } from "@/components/home/Visit";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Paths />
      <Story />
      <Signature />
      <MenuPreview />
      <Offers />
      <Chef />
      <KitchenFilm />
      <Gallery />
      <Reviews />
      <Events />
      <PrivateDining />
      <Reservation />
      <Visit />
      <Faq />
      <Newsletter />
    </>
  );
}
