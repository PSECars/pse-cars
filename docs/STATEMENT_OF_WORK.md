# Statement of Work

## Tayo
**World Drive Trail** (pair programming with Patrick)
- Access to the InfluxDB
- REST API (`/coordinates/trail`) with OpenAPI documentation
- Parameterized HTTP calls in the frontend
    - Display of the trail in the Mapbox component

Figma —> UI / UX Design
- Atomic Design
- Design Library
- UI/ UX Design of the whole website (with UI/ UX Best Practices: Atomic Design, 12 column grid, kli8 pt grid system, WCAG Guidelines)
- Interactive Figma Prototype
- Visuals (Logo, Images: Car Models, colored Cars, Interior, Rims, Merchandise, …) —> Midjourney + Dall-E

## Luca

- **My PSE Car**
  - IoT Service
    - Implementation of the car state endpoints
    - Integration of the Mosquitto message broker
    - Implementation of the REST API and WebSocket
    - Implementation of the carstats service to mock car data and hold car states in memory
    - Setup of the compose.yaml
    - Kong Integration
  - Next.JS Frontend
    - Implementation of the /my-pse-car frontend page using the design from Tayo


- **NextJS Frontend**
  - Implementation of the NextJS frontend
  - Setup of the NextJs application
  - Implementation of the Tailwind CSS custom config for Styling
  - Implementation of the full homepage
  - Every page designed is fully responsive


- Other stuff:
  - Improve Dockerfile by changing step order
  - Documentation of my-pse-car and frontend in the /docs directory

## Kai

* Architekturdiagramm 
* Kong-Integration

## Patrick
- World Drive
  - implementation of `car-position-mock`
  - setup of `influxdb`
  - setup of `mosquitto` together with Luca
  - implementation of `world-drive` service
    - setup of backend 
    - setup of OpenAPI
    - setup of influxdb connection
    - setup of mosquitto connection
    - implementation of REST API and WebSocket
  - implementation of `world-drive` frontend
    - integration of the MapBox map
    - implementation of the weather component
  - setup of `world-drive` `Dockerfile` and `compose.yaml`
- General
  - documentation of the general architecture we discussed TOGETHER IN THE GROUP
  - (tried to deploy the whole project on Google Cloud Kubernetes and then on Google Cloud VM)
    - (sadly this didn't work because kubernetes needed too much changes in the project and I started the VM approach too short before the presentation to make the necessary hostname changes throughout the whole project)

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
