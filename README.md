# Dental Appointment Management System

A full-stack web application developed as an academic project to simplify dental appointment scheduling and management. Patients can register, sign in, book appointments, and manage their visits, while administrators can review appointments and monitor scheduling activity.

## Features

### Patient experience
- User registration and sign-in
- Browse dental treatments and clinic information
- Book appointments using 30-minute time slots
- View upcoming and previous appointments
- Cancel appointments
- Access and manage account information

### Administration
- View appointments across patients
- Filter appointments by date category (today, upcoming, or past)
- Sort and manage appointment records
- Cancel appointments
- Review daily and monthly appointment totals and upcoming bookings

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React.js, JavaScript, HTML5, CSS3 |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| API communication | Axios, REST APIs |

## Project Structure

```text
clinic_randevu/
├── public/             # Static assets
├── src/
│   ├── assets/         # Styles and images
│   ├── components/     # Reusable UI components
│   ├── data/           # Frontend data and translations
│   ├── layout/         # Shared page layouts
│   └── pages/          # Application pages
├── server/             # Express backend and database connection
├── package.json        # Frontend dependencies and scripts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- PostgreSQL

### 1. Clone the repository

```bash
git clone https://github.com/HilalPolat/dental-appointment-management-system.git
cd dental-appointment-management-system
```

### 2. Install dependencies

Install frontend and backend dependencies separately:

```bash
npm install
cd server
npm install
```

### 3. Configure the database

Create a PostgreSQL database and configure the backend's environment variables in `server/.env`. The database connection uses `PGPASSWORD` for the password; check `server/db.js` for the remaining required connection settings.

**Do not commit `.env` files or real credentials.** The database schema and any required seed data must be set up separately; this repository is not presented as a one-command database installation.

### 4. Run the application

Start the backend from the `server` directory using the start command defined in `server/package.json`. In another terminal, start the React frontend from the project root:

```bash
npm start
```

The frontend's development configuration expects its API at `http://localhost:5000` unless the source code is updated.


## Project Notes

This repository contains an **academic/portfolio project**, not a production-ready clinic platform. In particular, the demonstration administrator login is currently checked in frontend code; frontend storage flags are not secure authorization. Before any public deployment, administrator authentication and authorization must be implemented and enforced on the server, and all credentials and configuration should be reviewed.


