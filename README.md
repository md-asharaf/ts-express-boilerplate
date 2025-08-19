# TypeScript Express Boilerplate

A scalable, production-ready backend template built with **Express.js** and **TypeScript**. Includes best practices for structure, security, logging, and microservices integration.

## Features

- **TypeScript** for type safety and maintainability
- **Express.js** for fast, flexible routing
- **Prisma ORM** for PostgreSQL database management
- **Redis** integration for caching and session management
- **Winston** logger for structured logging
- **Helmet** and **CORS** for security
- **Module aliasing** for clean imports
- **Docker** and **Docker Compose** for containerization
- **Environment variable management** with dotenv

## Project Structure

```
src/
	app.ts           # Express app setup
	index.ts         # Server entry point
	config/          # Configuration files
	controllers/     # Route controllers
	routes/          # API routes
	services/        # Business logic/services
	handlers/        # Error & async handlers
	tools/           # Utility tools
	utils/           # Custom error classes, helpers
prisma/
	schema.prisma    # Prisma DB schema
logs/              # Winston log files
Dockerfile         # Production Docker build
compose.yaml       # Docker Compose for local dev
```

## Getting Started

### Prerequisites

- Node.js v20+
- Docker & Docker Compose (for containerized setup)

### Local Development

1. Install dependencies:
    ```bash
    npm install
    ```
2. Set up environment variables in `.env` (see example below).
3. Start the development server:
    ```bash
    npm run dev
    ```
4. Access the API at [http://localhost:3000](http://localhost:3000)

### Dockerized Development

1. Build and start services:
    ```bash
    docker compose up --build
    ```
2. The app runs at [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env` file in the root directory:

```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret
```

## API Endpoints

### Health Check

- `GET /health` — Returns server status

### Auth (v1)

- `POST /v1/auth/user/login` — User login
- `POST /v1/auth/user/register` — Start registration
- `POST /v1/auth/user/register/verify` — Verify registration
- `POST /v1/auth/user/otp` — Resend OTP to email
- `POST /v1/auth/user/password/forgot` — Forgot password
- `POST /v1/auth/user/password/reset` — Reset password
- `POST /v1/auth/user/token/refresh` — Refresh JWT tokens
- `POST /v1/auth/admin/login` — Admin login
- `POST /v1/auth/admin/login/verify` — Verify admin login

## Logging

Logs are stored in the `logs/` directory using Winston. You can configure log levels and formats in `src/config/logger.ts`.

## Database

Uses Prisma ORM with PostgreSQL. Define models in `prisma/schema.prisma` and run migrations as needed.

## Testing & Linting

- Format & lint code with [Biome](https://biomejs.dev/):
    ```bash
    npm run lint
    npm run format
    ```

## Deployment

See `README.Docker.md` for Docker build and cloud deployment instructions.

## License

ISC
