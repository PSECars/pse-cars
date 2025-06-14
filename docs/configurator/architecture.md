# Architectural decisions on the configurator

## Chosen technologies

 - Springboot as the backend does not have specific requirements which would require a different framework or language and it's very well known and thus well extendable and maintainable in the future
 - Spring Web MVC over webflux as no streamed responses are needed because of huge data or something similar
 - PostgresSQL as we need to handle typical RDBMS data -> no specific requirements and postgresSQL is one of the most used databases
 - Spring Data JPA as it is the most used and well known way to access a database in Spring
