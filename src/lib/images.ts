/* Static image imports: Next.js reads their sizes at build time, then serves resized WebP/AVIF
   versions and a blurred placeholder automatically. Photos: Unsplash. */
import type { StaticImageData } from "next/image";
import bar from "@/assets/img/bar.jpg";
import butterChicken from "@/assets/img/butter-chicken.jpg";
import chefChopping from "@/assets/img/chef-chopping.jpg";
import chefPlating from "@/assets/img/chef-plating.jpg";
import chettinad from "@/assets/img/chettinad.jpg";
import curryNaan from "@/assets/img/curry-naan.jpg";
import dumBiryani from "@/assets/img/dum-biryani.jpg";
import filterCoffee from "@/assets/img/filter-coffee.jpg";
import finePlate from "@/assets/img/fine-plate.jpg";
import fishCurry from "@/assets/img/fish-curry.jpg";
import guests from "@/assets/img/guests.jpg";
import heroPoster from "@/assets/img/hero-poster.jpg";
import idliVada from "@/assets/img/idli-vada.jpg";
import interiorHall from "@/assets/img/interior-hall.jpg";
import interiorMain from "@/assets/img/interior-main.jpg";
import interiorWindow from "@/assets/img/interior-window.jpg";
import kahwa from "@/assets/img/kahwa.jpg";
import kokumCooler from "@/assets/img/kokum-cooler.jpg";
import northThali from "@/assets/img/north-thali.jpg";
import paneerMakhani from "@/assets/img/paneer-makhani.jpg";
import paneerTikka from "@/assets/img/paneer-tikka.jpg";
import pavBhaji from "@/assets/img/pav-bhaji.jpg";
import ragdaChaat from "@/assets/img/ragda-chaat.jpg";
import royalThali from "@/assets/img/royal-thali.jpg";
import sadyaThali from "@/assets/img/sadya-thali.jpg";
import samosaPlatter from "@/assets/img/samosa-platter.jpg";
import samosa from "@/assets/img/samosa.jpg";
import seekhGrill from "@/assets/img/seekh-grill.jpg";
import shrikhandCups from "@/assets/img/shrikhand-cups.jpg";
import tableSpread from "@/assets/img/table-spread.jpg";
import tandooriChicken from "@/assets/img/tandoori-chicken.jpg";
import terrace from "@/assets/img/terrace.jpg";
import vegBiryani from "@/assets/img/veg-biryani.jpg";

export const IMG = {
  bar,
  "butter-chicken": butterChicken,
  "chef-chopping": chefChopping,
  "chef-plating": chefPlating,
  chettinad,
  "curry-naan": curryNaan,
  "dum-biryani": dumBiryani,
  "filter-coffee": filterCoffee,
  "fine-plate": finePlate,
  "fish-curry": fishCurry,
  guests,
  "hero-poster": heroPoster,
  "idli-vada": idliVada,
  "interior-hall": interiorHall,
  "interior-main": interiorMain,
  "interior-window": interiorWindow,
  kahwa,
  "kokum-cooler": kokumCooler,
  "north-thali": northThali,
  "paneer-makhani": paneerMakhani,
  "paneer-tikka": paneerTikka,
  "pav-bhaji": pavBhaji,
  "ragda-chaat": ragdaChaat,
  "royal-thali": royalThali,
  "sadya-thali": sadyaThali,
  "samosa-platter": samosaPlatter,
  samosa,
  "seekh-grill": seekhGrill,
  "shrikhand-cups": shrikhandCups,
  "table-spread": tableSpread,
  "tandoori-chicken": tandooriChicken,
  terrace,
  "veg-biryani": vegBiryani,
} satisfies Record<string, StaticImageData>;

export type ImageName = keyof typeof IMG;
