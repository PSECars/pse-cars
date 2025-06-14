"use client";

import Image from "next/image";

import Hero from "./assets/hero.webp";
import Button from "@/app/components/Button";
import ModelPreview from "@/app/components/ModelPreview";
import Card2 from "./assets/card-2.webp";
import Card3 from "./assets/card-3.webp";
import Card4 from "./assets/card-4.webp";
import Card1 from "./assets/card-1.webp";
import CarView from "./assets/car-view.webp";
import Map from "./assets/map.webp";
import App from "./assets/app.webp";
import MerchPreview from "./assets/merch-preview.webp";
import {IconSun} from "@tabler/icons-react";
import TextInput from "@/app/components/TextInput";
import Logo from "@/app/assets/logo.webp";
import Link from "next/link";
import React from "react";

export default function Home() {
  const ConfiguratorLink = ({children}: {children: React.ReactNode}) => (
    <Link href="./configurator" >
      {children}
    </Link>
  )

  return (
    <div className="overflow-x-hidden">
      <main className="flex flex-col items-center px-10 max-w-400 mx-auto bg-surface-primary">
        <section aria-label={"Hero Section"} className="flex flex-col items-center justify-center w-full h-screen z-10">
            <Image className="absolute object-cover w-screen h-screen -z-10" src={Hero} alt="PSE Cars Hero Image" fill />
            <div className="flex flex-col items-center justify-center w-full h-full">
                <h1 className="text-5xl text-font-primary text-center font-medium leading-16">THE FUTURE OF DRIVING<br/>STARTS WITH PSECARS</h1>
                <h4 className={"text-xl text-font-primary text-center font-normal leading-18"}>Where innovation meets elegance.</h4>
                <div className={"flex flex-row gap-8"}>
                  <ConfiguratorLink>
                    <Button>Configure now</Button>
                  </ConfiguratorLink>
                    <Button onClick={() => {}}>
                        Explore Models
                    </Button>
                </div>
            </div>
        </section>
          <section className={"flex flex-col w-full py-16 gap-8"}>
              <div className={"flex flex-row justify-between"}>
                  <h2 className={"text-4xl font-medium"}>Models</h2>
                  <Button onClick={() => {}}>Discover all Models</Button>
              </div>
              <div className={"flex flex-row gap-8"}>
                  <ModelPreview image={Card1} modelName={"Tempest"} modelDescription={"Pure Performance"} />
                    <ModelPreview image={Card2} modelName={"Emissary"} modelDescription={"Elegant Power"} />
                    <ModelPreview image={Card3} modelName={"Velocity"} modelDescription={"Redefining Speed"} />
                    <ModelPreview image={Card4} modelName={"Apex"} modelDescription={"Exceptional Luxury"} />
              </div>
          </section>
          <section className={""}>
                <div className={"flex flex-col w-full py-16 gap-8 text-center"}>
                    <h2 className={"text-4xl font-medium"}>Make it yours.</h2>
                    <p className={"text-lg font-normal text-font-secondary"}>Customize every detail of your dream car -<br/>
                        from inventory to color.</p>
                  <ConfiguratorLink>
                    <Button className={"mx-auto"}>Start Configuring</Button>
                  </ConfiguratorLink>
                </div>
              <Image src={CarView} alt={""} className={"w-full h-auto"} />
          </section>
          <section className={"relative flex flex-col items-center justify-center w-full h-screen mt-16"}>
                <Image src={Map} alt={""} className={"absolute object-cover w-screen h-screen"} fill />
                <div className={"absolute flex flex-col items-center justify-center w-full h-full gap-8"}>
                    <div className={"flex flex-row gap-4"}>
                        <div className={"p-4 border border-outline-primary rounded-full bg-surface-secondary h-16 w-16 flex items-center justify-center"}>
                            <IconSun/>
                        </div>
                        <div className={"flex flex-col"}>
                            <h3 className={"text-3xl font-normal text-font-primary"}>Ljublijana</h3>
                            <p className={"text-lg font-light text-font-secondary"}>22°C</p>
                        </div>
                    </div>
                    <h2 className={"text-4xl font-medium text-font-primary"}>Follow the global journey of our<br/>legendary prototype - PSECAR0</h2>
                    <Button className={"mx-auto"} onClick={() => {}}>Track PSCAR0</Button>
                </div>
          </section>
          <section className={"relative flex flex-col items-center justify-center w-full h-screen mt-16"}>
              <div className={"flex flex-row gap-16 w-full text-start"}>
                    <div className={"flex flex-col items-start justify-center w-full h-full gap-8 flex-1"}>
                        <div className={"flex flex-col gap-4"}>
                        <h2 className={"text-4xl font-medium text-font-primary"}>Remote access, climate
                            control and full customization</h2>
                        <p className={"text-lg font-light text-font-secondary"}>Everything you need right from your Phone.</p>
                        </div>
                        <Button className={"mr-auto"} onClick={() => {}}>Open Control Panel</Button>
                    </div>
                    <Image src={App} alt={""} className={"w-100 flex-0"} />
              </div>
          </section>
          <section className={"w-screen"}>
              <Image src={MerchPreview} alt={"Merch Preview"} className={"w-screen h-auto"} />
                <div className={"flex flex-col w-full py-16 gap-8 text-center"}>
                    <div className={"flex flex-col gap-4"}>
                    <h2 className={"text-4xl font-medium"}>PSE Lifestyle Collection</h2>
                    <p className={"text-lg font-normal text-font-secondary"}>Discover the exclusive PSECar Merchandise.</p>
                    </div>
                    <Button className={"mx-auto"} onClick={() => {}}>Shop Now</Button>
                </div>
          </section>
          <section className={"flex flex-col w-full py-16 gap-8"}>
              <div className={"flex flex-col w-full py-16 gap-8 text-center"}>
                  <div className={"flex flex-col gap-4"}>
                      <h2 className={"text-4xl font-medium"}>Stay in the loop.</h2>
                      <p className={"text-lg font-normal text-font-secondary"}>Get early access to new models, events, and PSECar0 stories.</p>
                  </div>
                <TextInput className={"mx-auto"} onSubscribe={() => {}}/>
              </div>
          </section>
      </main>
        <footer className={"flex flex-col items-center justify-center w-full h-32 bg-surface-secondary text-font-primary border-t-2 border-t-outline-tertiary py-48"}>
            <div className={"flex flex-row gap-8"}>
                <Image src={Logo} alt="PSE Cars Logo" className="w-24 h-8" /> {/* TODO: Original aspect ratio */}
                <p className={"text-lg font-normal"}>Cars</p>
                <p className={"text-lg font-normal"}>Configurator</p>
                <p className={"text-lg font-normal"}>WorldDrive</p>
                <p className={"text-lg font-normal"}>Merchandise</p>
                <p className={"text-lg font-normal"}>MyPSECar</p>
            </div>
            <div className={"flex flex-row gap-8 mt-4"}>
                <p className={"text-sm font-normal text-font-secondary"}>Privacy Policy</p>
                <p className={"text-sm font-normal text-font-secondary"}>Imprint</p>
            </div>
            <div className={"flex flex-row gap-8 mt-16"}>
                <p className={"text-sm font-light text-font-secondary"}>© 2025 PSE Cars. All rights reserved.</p>
            </div>
        </footer>
    </div>
  );
}
