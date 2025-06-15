import Button from "@/app/components/Button";
import Image from "next/image";
import CarView from "@/app/assets/car-view.webp";
import React from "react";
import Link from "next/link";

export function MakeItYours() {
  return (
    <section className={""}>
      <div className={"flex flex-col w-full py-16 gap-8 text-center"}>
        <h2 className={"text-4xl font-medium"}>Make it yours.</h2>
        <p className={"text-lg font-normal text-font-secondary"}>Customize every detail of your dream car -<br/>
          from inventory to color.</p>
        <Link href="/configurator">
          <Button className={"mx-auto"}>Start Configuring</Button>
        </Link>
      </div>
      <Image src={CarView} alt={""} className={"w-full h-auto"} />
    </section>
  );
}
