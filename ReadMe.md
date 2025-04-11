# Tritan Pastes

Tritan Pastes is a web application that allows users to securely share code, text, and messages with anyone. The application consists of a frontend built with Next.js and a backend built with Go and Fiber. The project is containerized using Docker and can be easily deployed using Docker Compose.

## Prerequisites

- Docker
- Docker Compose

## Getting Started

### Clone the Repository

```sh
git clone https://github.com/Team-Tritan/Tritan-Pastes.git
cd Tritan-Pastes/
```

### Environment Variables

Create a `.env` file in the backend directory by copying the example file:

`cp backend/.env.example backend/.env`

Update the `.env` file with your MongoDB URI and other necessary environment variables.

### Build and Run the Application

Use Docker Compose to build and run the application:

`docker-compose up --build`

This command will build the Docker images for the frontend and backend services and start the containers.

### Access the Application

- Frontend: http://localhost:3000

- Backend: http://localhost:8069
