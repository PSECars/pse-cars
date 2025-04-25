import CarView from "@/app/assets/car-view.webp";
import Image from "next/image";
import {IconCarFan, IconCarFan2, IconFlame, IconLock, IconPropeller, IconSun} from "@tabler/icons-react";

export default function MyPseCarPage() {
    return (
        <div className="overflow-x-hidden">
            <main className="flex flex-col items-center px-10 max-w-400 mx-auto bg-surface-primary mt-24">
                <div className="flex flex-col items-center justify-center w-full z-10 m-16 gap-8 rounded-3xl border-1 border-outline-secondary p-10">
                    <Image src={CarView} alt="PSE Cars Hero Image" className="object-cover w-full h-auto max-w-200" />
                    <div className="flex flex-row justify-center w-full px-8 py-4 items-center gap-16 flex-wrap">
                        <div className="flex flex-col items-center gap-2">
                            <h1 className="text-3xl text-font-primary font-medium">265 <span className={"text-2xl"}>km</span></h1>
                            <h4 className="text-base text-font-primary font-normal">Range</h4>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <h1 className="text-3xl text-font-primary font-medium">82 <span className={"text-2xl"}>%</span></h1>
                            <h4 className="text-base text-font-primary font-normal">Battery</h4>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <h1 className="text-3xl text-font-primary font-medium">21 <span className={"text-2xl"}>°C</span> </h1>
                            <h4 className="text-base text-font-primary font-normal">Temperature</h4>
                        </div>
                    </div>
                </div>
                <section className="flex flex-col items-start w-full gap-8">
                    <h1 className={"text-3xl text-font-primary font-medium"}>Control Panel</h1>
                    <div className={"flex flex-row gap-8 w-full flex-wrap justify-between"}>
                        <div className={"flex flex-col items-center justify-center flex-1 z-10 gap-8 rounded-3xl border-1 border-outline-secondary min-w-30 p-8"}>
                            <IconFlame className={"h-16 w-16"} />
                            <h4 className="text-lg text-font-primary font-normal">Heating</h4>
                        </div>
                        <div className={"flex flex-col items-center justify-center flex-1 z-10 gap-8 rounded-3xl border-1 border-outline-secondary min-w-30 p-8"}>
                            <IconLock className={"h-16 w-16"} />
                            <h4 className="text-lg text-font-primary font-normal">Lock</h4>
                        </div>
                        <div className={"flex flex-col items-center justify-center flex-1 z-10 gap-8 rounded-3xl border-1 border-outline-secondary min-w-30 p-8"}>
                            <IconSun className={"h-16 w-16"} />
                            <h4 className="text-lg text-font-primary font-normal">Lights</h4>
                        </div><div className={"flex flex-col items-center justify-center flex-1 z-10 gap-8 rounded-3xl border-1 border-outline-secondary min-w-30 p-8"}>
                        <IconPropeller className={"h-16 w-16"} />
                        <h4 className="text-lg text-font-primary font-normal">Climate</h4>
                    </div>

                    </div>
                </section>
            </main>
        </div>
    );
}