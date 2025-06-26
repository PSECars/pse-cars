# Statement of Work

## Tayo

## Luca

## Kai

* Architekturdiagramm 
* Kong-Integration

## Patrick

## Rasheed

## Axel

 - created basic Dockerfile for NextJS
 - created initial React Project and Github Pages deployment on the pse-cars.com domain (which I'm proud owner of)
   - (this was later replaced by a NextJS project and thus the deployment also removed)
 - created basic docker compose structure (later on refactored by Luca & Patrick)
 - configurator backend implemented with Spring Boot
 - PostgresSQL database for the configurator
 - NextJS frontend
   - /cars frontend page
   - /configurator frontend page
   - OpenAPI client used for backend communication
     - Special kong configuration for the API Gateway needed because the openapi.json file returned by Spring depends on the host header of the request
 - tried to host the whole software in the cloud (azure) for demo but was too high effort and not performant enough for the demo, because:
   - either DBs & gateway, etc. should be replaced with cloud native services from the hyperscaler (high effort, because all networking etc from docker compose is useless then)
   - or the whole software would be hosted in a VM (not performant enough for the demo)
