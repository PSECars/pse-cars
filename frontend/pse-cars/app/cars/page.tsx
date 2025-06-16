import Image from "next/image";
import Button from "@/app/components/Button";
import {MakeItYours} from "@/app/components/MakeItYours";
import Link from "next/link";
import {openApiClient} from "@/app/http-client/open-api-client";
import {OfferedCar} from "@/app/http-client/openapi";

// disable pre-rendering because backend is not available at build time -> render & cache at runtime on server-side
export const dynamic = "force-dynamic";

// cache infinitely (SSR) because this kind of data does not change often
let offeredCarsCache: OfferedCar[] | undefined;

const getOfferedCars = async () => {
  if (offeredCarsCache) {
    return offeredCarsCache;
  }

  const response = await openApiClient!.getAllOfferedCars();
  offeredCarsCache = response.data;
  return offeredCarsCache!;
}

export default async function CarsPage() {
  const offeredCars = await getOfferedCars();
  return (
    <main className="flex flex-col items-center px-10 max-w-400 mx-auto bg-surface-primary pt-30">
      <section className="flex flex-col items-center justify-center w-full z-10 mb-50">
        <h2 className="text-4xl font-semibold self-start mb-5">Models</h2>
        <div className="flex flex-row flex-wrap gap-8 justify-center">
          {
            // @ts-ignore
            offeredCars.map((car) => (
            <div key={car.id} className="relative min-w-[36rem] min-h-[23.59rem] rounded-xl overflow-hidden grow" style={{ aspectRatio: 2780 / 1822}}>
              <Image src={car.imageUrl!} alt={car.name!} width={2780} height={1822}
                     className="absolute min-full min-full top-0 left-0 inset-0 object-cover"
              />
              <div className="relative flex flex-row justify-between items-end p-4 w-full h-full">
                <div className="flex flex-col">
                  <span className="text-white text-3xl font-medium">{car.name}</span>
                  <span className="text-white text-lg">{car.slogan}</span>
                </div>
                {car.available ? (
                  <Link href="/configurator"><Button>View Details</Button></Link>
                ) : (
                  <Button className="cursor-not-allowed!">View Details</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      <MakeItYours />
    </main>
  );
}
