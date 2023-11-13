# 🎮 NestJS Pokemon Backend 🚀

Welcome to the NestJS Pokemon Backend! This project serves as the backend for a Pokémon game, providing a robust API and essential features for gameplay.

## Description

NestJS Pokemon Backend is a comprehensive solution for building the server-side functionality of a Pokémon game. It encompasses features such as secure authentication, dynamic Pokémon spawning, interactive catching mechanisms, evolution processes, trading capabilities, a sophisticated battle engine, real-time updates through websockets, and a microservices architecture for scalability. The project utilizes technologies like NestJS, MongoDB, RabbitMQ, Docker, and NestJS Workspaces to deliver a scalable and efficient backend infrastructure.

## 🎯 Features

- 🔐 **Authentication**: Secure user registration and login functionality using JWT (JSON Web Tokens). The authentication service validates user credentials and generates a JWT for authenticated users. This token is used to authenticate subsequent requests from the client.

- 🌍 **Pokémon Spawning**: The application generates initial Pokémon spawns for each city and schedules the spawning of new Pokémon after a specified delay. The spawning service uses a random number generator to determine the type and location of the spawned Pokémon.

- 🎣 **Pokémon Catching**: Users can catch Pokémon based on the provided spawn information and user data. The catching process involves a quiz-based encounter, where the user must answer a question correctly to catch the Pokémon.

- 🐛➡️🦋 **Pokémon Evolution**: Pokémon can evolve into more powerful forms. The evolution process is based on the Pokémon's level and specific evolution conditions. The evolution service updates the Pokémon's data when it evolves.

- 🔄 **Pokémon Trading**: Users can trade Pokémon with each other. The trading service facilitates the exchange of Pokémon between users. Users can offer their Pokémon for trade and accept trade offers from other users.

- ⚔️ **Battle Engine**: Users can battle each other using their Pokémon. The battle engine calculates the outcome of each battle based on the Pokémon's stats, moves, and types. The battle service updates the Pokémon's and user's data after each battle.

- 📡 **Websockets**: Real-time updates are provided to the users through websockets. The websocket service sends updates to the client whenever there is a change in the game state, such as a new Pokémon spawn or the outcome of a battle.

- 🏭 **Microservices**: The application is divided into multiple microservices, each responsible for a specific feature. This makes the application more scalable

## 🛠️ Technologies Used

- **NestJS**: A progressive Node.js framework for building scalable and efficient server-side applications.
- **MongoDB**: A popular NoSQL database for storing Pokémon and player data.
- **RabbitMQ**: A robust message broker for implementing a microservice architecture.
- **Docker**: A containerization platform for development and deployment.
- **NestJS Workspaces**: A monorepo structure for managing multiple NestJS services.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed the latest version of [Node.js](https://nodejs.org/en/download/)
- You have a Windows/Linux/Mac machine.
- You have access to a MongoDB database.
- You have RabbitMQ installed and running.
- You have Redis installed and running.

## 🚀 Installation and Setup

You can set up the project locally by following these steps:

1. Clone the repository to your local machine.
2. Install the required dependencies by running `npm install`.
3. Start the application in development mode by running `npm run start:dev`.

Alternatively, you can use Docker to set up the project:

1. Build the Docker image by running `docker build -t nestjs-pokemon-backend ..`.
2. Start the Docker container by running `docker-compose up`.

## Environment Variables

Each service in the application requires specific environment variables to be set. Here's a list of the required environment variables for each service:

### Auth Service

- `[PORT]`: The port on which the service will run.
- `[MONGO_URI]`: The URI of your MongoDB database.
- `[DB_NAME]`: The name of the database to use.
- `[JWT_SECRET]`: The secret key used for JWT authentication.
- `[RMQ_URL]`: The URL of your RabbitMQ server.
- `[RMQ_AUTH_QUEUE]`: The name of the RabbitMQ queue for the auth service.
- `[REDIS_HOST]`: The host of your Redis server.
- `[REDIS_PORT]`: The port of your Redis server.
- `[REDIS_USERNAME]`: The username for your Redis server.
- `[REDIS_PASSWORD]`: The password for your Redis server.

### Inventory Service

- Same as the Auth Service, with the addition of:
- `[RMQ_INVENTORY_QUEUE]`: The name of the RabbitMQ queue for the inventory service.

### Spawns Service

- Same as the Inventory Service, with the addition of:
- `[RMQ_SPAWNS_QUEUE]`: The name of the RabbitMQ queue for the spawns service.

### Battle Service

- Same as the Spawns Service, with the addition of:
- `[RMQ_BATTLE_QUEUE]`: The name of the RabbitMQ queue for the battle service.

### Pokemon Service

- Same as the Battle Service, with the addition of:
- `[RMQ_POKEMON_QUEUE]`: The name of the RabbitMQ queue for the pokemon service.

Remember to replace the placeholder values with your actual values before running the services.

## 📜 License

This project is licensed under the MIT License. Enjoy your journey in the world of Pokémon! 🎉🎉🎉
