import OpenAPIClientAxios from "openapi-client-axios";

const configuratorBackendHost = process.env.CONFIGURATOR_BACKEND_HOST;
console.log(`Configurator Backend Host: ${configuratorBackendHost}`);
const api = new OpenAPIClientAxios({definition: `${configuratorBackendHost}/v3/api-docs`});
await api.init();
export const openApiClient = await api.getClient();
console.log("OpenAPI Client initialized successfully.");
