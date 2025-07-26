# Let me Ask API

This is the backend API for the full-stack project [Let me Ask](https://github.com/lucastenani/let-me-ask-web). It powers the core logic and database for the front-end web app.

## 🔗 Frontend repository: [Let me Ask Web](https://github.com/lucastenani/let-me-ask-web)

## 🛠️ Tech Stack

- **Node.js** with **native TypeScript** (`--experimental-strip-types`)
- **Fastify** – Fast and low-overhead web framework
- **PostgreSQL** – Relational database
- **pgvector** – PostgreSQL extension for vector operations
- **Drizzle ORM** – Type-safe SQL query builder
- **Zod** – Schema validation for request inputs and environment variables
- **Docker + Docker Compose** – Containerized PostgreSQL database
- **Biome** – Code formatting and linting

## 🧱 Architecture

- Modular structure with clear separation of routes, schemas, and database
- Type-safe schema validation using Zod
- Type-safe database operations with Drizzle ORM
- Centralized environment variable validation

## ⚙️ Setup Instructions

### Prerequisites

- Node.js (version that supports `--experimental-strip-types`)
- Docker and Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/lucastenani/let-me-ask-api.git
cd let-me-ask-api
```

### 2. Start the database

```bash
docker-compose up -d
```

### 3. Configure environment variables

Create a .env file in the root directory:

```env
PORT=3333
DATABASE_URL=postgresql://docker:docker@localhost:5432/agents
```

### 4. Install dependencies

```bash
npm install
```

### 5. Run database migrations

```bash
npm run db:generate
npm run db:migrate
```

### 6. (Optional) Seed the database

```bash
npm run db:seed
```

### 7. Start the server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

## 🧪 Testing the API

You can use the client.http file located in the root directory to test API requests directly from VSCode using the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension.

## 📚 Available Scripts

- **npm run dev** – Starts server in development mode with hot reload
- **npm start** – Starts server in production mode
- **npm run db:seed** – Seeds the database with sample data

## 🌐 API Endpoints

- The API will be running at: http://localhost:3333

  - GET /health – Application health check
  - GET /rooms – List available rooms
  - POST /rooms – Create room
  - GET /rooms/:roomId/questions – List room questions
  - POST /rooms/:roomId/questions – Create room question
