# PSE Cars
This is the repository for the PSE Cars project.
Please refer to the sections below on how to use this repo and for further information.

## Deploying the Application
First, copy the `.env.example` file to `.env` in the root directory of the repository.
Fill in the necessary environment variables in the `.env` file.

Then you can use the `compose.yaml` file in the root directory of the repository to start the complete application.
Simply open the root directory of the repository in a command line and type `docker compose up -d`.

You should be able to access the application at `http://localhost:80`.

## How to use this Repo
Each component of the application is located in its own subdirectory.
The subdirectories are named after the component they contain.

Each subdirectory should contain a `compose.yaml` file that is included into the root-level `compose.yaml`.
d The subdirectory `compose.yaml` files should contain all necessary services for the component to run, as well as the component itself.

## Documentation
For detailed documentation of the project and its architecture, please refer to the `docs` directory.
