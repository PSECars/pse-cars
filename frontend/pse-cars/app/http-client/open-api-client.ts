import OpenAPIClientAxios from "openapi-client-axios";
import {Client as ConfiguratorClient} from "@/app/http-client/openapi";

export let openApiClient: ConfiguratorClient | undefined;

if (!openApiClient) {
  const configuratorBackendHost = process.env.NEXT_PUBLIC_CONFIGURATOR_BACKEND_HOST;
  console.log(`Configurator Backend Host: ${configuratorBackendHost}`);
  const api = new OpenAPIClientAxios({definition: `${configuratorBackendHost}/v3/api-docs`});
  await api.init();
  openApiClient = await api.getClient<ConfiguratorClient>();
  console.log("OpenAPI Client initialized successfully.");
}
