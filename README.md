# Event Booking System

A Mini Event Management System built with Node.js, Express.js, and MySQL. Users can browse events, book tickets, and record attendance.

## Features

- Browse upcoming events
- Create new events
- Book tickets with race-condition-safe transactions
- Unique booking codes (UUID)
- Record event attendance using booking codes
- View all bookings for a specific user
- OpenAPI/Swagger documentation
- Docker support for one-click deployment

---

## Folder Structure

event-booking-system/
├── docker-compose.yml
├── Dockerfile
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── schema.sql
├── swagger.yaml
├── postman_collection.json
└── src/
├── app.js
├── server.js
├── config/
│ └── database.js
├── controllers/
│ ├── eventController.js
│ ├── bookingController.js
│ └── userController.js
├── routes/
│ ├── eventRoutes.js
│ ├── bookingRoutes.js
│ └── userRoutes.js
├── middlewares/
│ └── validateInput.js
└── utils/
└── generateCode.js


---

## Prerequisites

- **Node.js** v16+ 
- **MySQL** 8.0+
- **npm** v8+
- (Optional) **Docker** & **Docker Compose**

---

## Setup - Manual

### 1. Clone the repository

```bash
git clone <repository-url>
cd event-booking-system