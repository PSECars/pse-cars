import {CarConfigurator} from "@/app/configurator/CarConfigurator";
import {getOpenApiClient} from "@/app/http-client/open-api-client";
import {OfferedCar} from "@/app/http-client/openapi";

// disable pre-rendering because backend is not available at build time -> render & cache at runtime on server-side
export const dynamic = "force-dynamic";

// cache infinitely (SSR) because this kind of data does not change often
let offeredCarCache: OfferedCar | undefined;

const getOfferedCar = async () => {
  if (offeredCarCache) {
    return offeredCarCache;
  }

  const openApiClient = await getOpenApiClient();
  const response = await openApiClient!.getOfferedCarById({id: 1});
  offeredCarCache = response.data;
  return offeredCarCache!;
}

export  default async function ConfiguratorPage() {
  const offeredCar = await getOfferedCar();
  return (
    <div className="overflow-x-hidden overflow-y-hidden">
      <main className="flex flex-col items-center px-10 max-w-400 mx-auto bg-surface-primary">
        <section className="flex flex-col items-center justify-center w-full h-screen z-10 gap-5">
          <CarConfigurator features={offeredCar.features!} />
        </section>
      </main>
    </div>
  )
}
