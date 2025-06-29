# PSE Cars
This is the repository for the PSE Cars project.
Please refer to the sections below on how to use this repo and for further information.

## Deploying the Application
Usually, we would have an `.env.example` file in place, specifying all necessary environment variables with empty values.
Anyone who wants to use this repo should copy this file to `local.env` for local development or `.env` for Docker in the root directory of the repository.
They then would have to fill in the necessary environment variables in the respective file.
For the sake of this submission, we will commit the complete `.env` files.
Just let it be known that we know that this is **very bad practice**, and we would never do it in a real project!

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

The `STATEMENT_OF_WORK.md` file is also located in the `docs` directory.
