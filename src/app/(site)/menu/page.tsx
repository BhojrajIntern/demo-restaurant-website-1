import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { OrderMenu } from "@/components/menu/OrderMenu";
import { OpenStatus } from "@/components/site/OpenStatus";
import { IMG } from "@/lib/images";

export const metadata: Metadata = {
  title: "Menu & Order Online",
  description: "Order delivery or pickup straight from the Ember & Saffron kitchen: tandoor, dum biryani, regional curries, thalis and desserts.",
  alternates: { canonical: "/menu" },
};

export default function MenuPage() {
  return (
    <div className="menu-page">
      <section className="page-hero">
        <Image className="bg" src={IMG["table-spread"]} alt="" fill priority sizes="100vw" />
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Menu &amp; order</span></nav>
          <h1 className="h-xl">Order <span className="italic">online</span></h1>
          <p className="lead">Straight from our kitchen to your table — delivery across east Bengaluru or pickup in about 25 minutes. <OpenStatus /></p>
        </div>
      </section>
      <OrderMenu />
    </div>
  );
}
