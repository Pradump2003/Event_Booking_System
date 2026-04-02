# Event Booking System

A backend API for managing events, users, bookings, and attendance.
Built with Node.js, Express, and MySQL.

## What This Project Does

- Creates and lists events
- Registers users
- Books tickets for users
- Generates a unique booking code for each booking
- Records attendance using booking code + event id
- Returns bookings for a specific user
- Exposes Swagger UI documentation

## Tech Stack

- Node.js
- Express.js
- MySQL 8
- mysql2
- Swagger UI
- Docker and Docker Compose (optional)

## Project Structure

```text
Event-Booking-System/
├── .env
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package-lock.json
├── package.json
├── postman_collection.json
├── README.md
├── schema.sql
├── swagger.yaml
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    │   └── database.js
    ├── controllers/
    │   ├── bookingController.js
    │   ├── eventController.js
    │   └── userController.js
    ├── middlewares/
    │   └── validateInput.js
    ├── routes/
    │   ├── bookingRoutes.js
    │   ├── eventRoutes.js
    │   └── userRoutes.js
    └── utils/
        └── generateCode.js
```

## Prerequisites

### For local run (without Docker)

- Node.js 16+ (recommended: 18+)
- npm 8+
- MySQL 8+

### For Docker run

- Docker Desktop
- Docker Compose

## Environment Variables

Create or update .env in the project root:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=admin
DB_NAME=event_booking
PORT=3000
```

Important:

- DB_HOST and DB_PORT must point to your MySQL instance for local run.
- Docker run uses values from docker-compose.yml, not your local .env for the app container.

## Database Setup (Local MySQL)

### Step 1: Start MySQL

Make sure MySQL server is running on your machine.

### Step 2: Create database and tables

Run schema.sql in MySQL.

Option A: MySQL command line

```bash
mysql -u root -p < schema.sql
```

Option B: MySQL Workbench

1. Open MySQL Workbench
2. Open schema.sql
3. Execute the script

This script does the following:

- Creates database event_booking
- Creates tables: users, events, bookings, event_attendance
- Inserts sample users and events

## Install Dependencies

From project root:

```bash
npm install
```

## Run the Server (Local)

### Development mode (auto-restart)

```bash
npm run dev
```

### Production mode

```bash
npm start
```

If everything is correct, server logs show:

- Database connected successfully
- Server running at http://localhost:3000
- API docs at http://localhost:3000/api-docs

## Run with Docker (Recommended for quick setup)

From project root:

```bash
docker compose up --build
```

Or detached mode:

```bash
docker compose up -d --build
```

What Docker setup does:

- Starts MySQL container on host port 3307
- Starts API container on host port 3000
- Auto-imports schema.sql into MySQL container

Stop containers:

```bash
docker compose down
```

View logs:

```bash
docker compose logs -f
```

## API Base URL

- http://localhost:3000

## Swagger Documentation

- http://localhost:3000/api-docs

## Main API Endpoints

### Event routes

- GET /events
- POST /events
- POST /events/:id/attendance

### Booking routes

- POST /bookings

### User routes

- GET /users
- POST /users
- GET /users/:id
- GET /users/:id/bookings

## Suggested Test Flow

1. GET /users to view seeded users
2. GET /events to view available events
3. POST /bookings to create a booking
4. POST /events/:id/attendance with booking_code
5. GET /users/:id/bookings to verify booking history

## Example Request Bodies

### Create user

```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Create event

```json
{
  "title": "Node Meetup",
  "description": "Community meetup",
  "date": "2030-12-01T10:00:00Z",
  "total_capacity": 100
}
```

### Create booking

```json
{
  "user_id": 1,
  "event_id": 1,
  "num_tickets": 2
}
```

### Record attendance

```json
{
  "booking_code": "<booking-code-from-create-booking-response>"
}
```

## Common Issues and Fixes

### MySQL connection failed in local run

- Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in .env
- Confirm MySQL is running
- Confirm schema.sql has been executed

### Port already in use

- Change PORT in .env for app
- Stop any process using port 3000

### Docker app cannot connect to DB

- Start with docker compose up --build
- Wait until db service becomes healthy
- Check logs with docker compose logs -f

## Scripts

- npm start: run server normally
- npm run dev: run server with nodemon

## Notes

- Local run and Docker run use different DB connection sources.
- For local run, .env controls database credentials.
- For Docker run, docker-compose.yml sets container credentials and networking.
