# PSE Cars
This is the repository for the PSE Cars project.
Please refer to the sections below on how to use this repo and for further information.

## Deploying the Application
Use the `compose.yaml` file in the root directory of the repository to start the complete application.
Simply open the root directory of the repository in a command line and type `docker compose up -d`.

[//]: # (TODO)
Then you should be able to access the application at `http://localhost:????`.

## How to use this Repo
Each component of the application is located in its own subdirectory.
The subdirectories are named after the component they contain.

Each subdirectory should contain a `compose.yaml` file that is included into the root-level `compose.yaml`.
The subdirectory `compose.yaml` files should contain all necessary services for the component to run, as well as the component itself.