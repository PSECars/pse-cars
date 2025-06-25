import OpenAPIClientAxios from "openapi-client-axios";
import {Client as ConfiguratorClient} from "@/app/http-client/openapi";

let openApiClient: ConfiguratorClient | undefined;

export async function getOpenApiClient() {
  if (!process.env.NEXT_PUBLIC_CONFIGURATOR_BACKEND_HOST) {
    console.log("NEXT_PUBLIC_CONFIGURATOR_BACKEND_HOST is not set. Cannot initialize OpenAPI Client.");
    return;
  }
  if (!openApiClient) {
    const configuratorBackendHost = process.env.NEXT_PUBLIC_CONFIGURATOR_BACKEND_HOST;
    console.log(`Configurator Backend Host: ${configuratorBackendHost}`);
    try {
      const api = new OpenAPIClientAxios({definition: `${configuratorBackendHost}/v3/api-docs`});
      await api.init();
      openApiClient = await api.getClient<ConfiguratorClient>();
      console.log("OpenAPI Client initialized successfully.");
    } catch (error) {
      console.log("Failed to initialize OpenAPI Client:", error);
    }
  }
  return openApiClient;
}
