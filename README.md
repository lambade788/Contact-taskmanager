# CRM Contact & Task Manager (Backend)

## Project overview

A simple CRM-style backend that lets users register and login, manage contacts and contact addresses, create tasks linked to contacts, and log simulated emails. Built as a RESTful API using Node.js / Express and MySQL. The assessment includes the full project source and a MySQL dump (`crm_app.sql`) of the database schema + triggers.

## Tech stack

* Node.js (Express)
* MySQL (mysql2)
* JSON Web Tokens (JWT) for authentication
* bcryptjs for password hashing
* Nodemon for development

## Repository contents

```
crm-backend/
├── crm_app.sql                # MySQL dump (schema + triggers + data if any)
├── .env                      # (NOT in repo — local only)
├── .gitignore
├── package.json
├── src/
│   ├── app.js
│   ├── db.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── contacts.js
│   │   ├── tasks.js
│   │   └── emails.js
│   └── middleware/
│       └── authMiddleware.js
└── README.md
```

## Setup & installation (local development)

> Make sure MySQL server is installed and running locally.

1. Clone the repository (or unzip/copy files):

```bash
git clone <your-repo-url>
cd crm-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root (DO NOT commit `.env`):

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=crm_app
JWT_SECRET=your_jwt_secret_here
PORT=4000
```

Replace `YOUR_MYSQL_PASSWORD` and `your_jwt_secret_here` with your values.

4. Import the database dump (`crm_app.sql`) into your MySQL server:

### Option A — MySQL Workbench (recommended)

* Open MySQL Workbench → Server → Data Import
* Select **Import from Self-Contained File** and pick `crm_app.sql`
* Select **Default Target Schema** (or let the file create the schema if `CREATE DATABASE` included)
* Start Import

### Option B — Command-line (mysqldump restore)

```bash
mysql -u root -p < crm_app.sql
# or to restore specific DB:
mysql -u root -p -e "SOURCE C:/path/to/crm_app.sql;"
```

5. Start the server (development):

```bash
npm run dev
```

6. Test the server:
   Open browser or Postman:

```
GET http://localhost:4000/
# Example response: { "ok": true, "db": 2 }
```

## Database configuration

* Database name used: `crm_app`
* Tables included: `users`, `users_contact`, `contact_address`, `users_task`, `email_logs`
* Triggers: `trg_users_full_name_before_insert`, `trg_users_full_name_before_update`, `trg_users_contact_full_name_before_insert`, `trg_users_contact_full_name_before_update`
* The included dump `crm_app.sql` contains table creation, triggers and (optionally) sample data.

## API Endpoints (summary)

### Auth

* `POST /api/auth/register`
  Body: `{ first_name, last_name, email, phone, password }`
* `POST /api/auth/login`
  Body: `{ emailOrPhone, password }` → Returns `{ token, expiresIn }` (JWT, 15 minutes)

### Contacts (authenticated)

All requests require header: `Authorization: Bearer <token>`

* `POST /api/contacts` — create contact
* `GET /api/contacts` — list contacts (with addresses)
* `GET /api/contacts/:id` — get single contact
* `PUT /api/contacts/:id` — update contact
* `DELETE /api/contacts/:id` — delete contact
* `POST /api/contacts/:id/address` — add address for a contact

### Tasks (authenticated)

* `POST /api/tasks` — create task (optional `contact_id`)
* `GET /api/tasks` — list tasks for user
* `GET /api/tasks/:id` — get a task
* `PUT /api/tasks/:id` — update a task
* `DELETE /api/tasks/:id` — delete a task

### Email logs (authenticated)

* `POST /api/email/send` — insert an email_log entry (`to_email`, `subject`, `body`)
* `GET /api/email` — list recent email logs

## Running & testing tips

* Use Postman or curl for testing endpoints.
* Register a user first, then login to get the JWT token for protected routes.
* The JWT expiry is 15 minutes — the token will become invalid afterwards.
* Passwords are stored hashed (bcryptjs).

## What I added / assumptions

* `bcryptjs` used for hashing (works on Windows without native build issues).
* The `users` table has `email` and `phone` unique (email length set to 191 for compatibility).
* Triggers automatically fill `full_name` and `contact_full_name`.
* `created_by` and `updated_by` fields are set to the user id when creating/updating via API.
* The API enforces that contact/task operations only affect objects owned by the authenticated user.

## How to export the database (for your records)

* Using Workbench: Server → Data Export → select `crm_app` → Export to Self-contained file → include triggers/procedures/events → Start Export.
* The exported file is included in this repo as `crm_app.sql`.


## Additional notes or clarifications

* The repository intentionally excludes `.env` and `node_modules`. See `.gitignore`.
* If you want a frontend (React) to interact with this backend, I can provide a starter React app that uses the same endpoints and stores the JWT in `localStorage`.



# CRM Contact & Task Manager (Frontend)

## Project Overview

This application serves as the user interface for the CRM system. It is a single-page application (SPA) built with **Next.js** and **React**, responsible for:

1.  Handling user authentication (Login/Register).
2.  Managing the secure JWT token in `localStorage`.
3.  Providing full CRUD functionality for contacts, addresses, and tasks.
4.  Strictly adhering to the **"No UI libraries allowed"** requirement by using only custom CSS for a clean UI.

## Tech Stack

* **Framework:** Next.js (App Router)
* **View Layer:** React
* **Styling:** Custom CSS / CSS Modules
* **State Management:** React local state and context (or similar)
* **API Client:** Axios (or native `fetch`) for API communication
* **Security:** JSON Web Tokens (JWT) stored in `localStorage`

## Repository Contents (File Structure)

The frontend uses the Next.js App Router pattern for routing and organization:

