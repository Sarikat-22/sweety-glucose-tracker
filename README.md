\# Sweety – Blood Glucose Tracker ❤️



A full-stack blood glucose tracking application built using React, Node.js, Express.js and PostgreSQL.



\## Features



\### Authentication

\- User registration and login

\- Password hashing using bcrypt

\- JWT-based authentication

\- Protected API routes



\### Glucose Tracking

\- Add glucose readings

\- View reading history

\- Edit existing readings

\- Delete readings

\- Four daily reading slots:

&#x20; - Morning fasting

&#x20; - After breakfast

&#x20; - After lunch

&#x20; - After dinner



\### Validation

\- Glucose values must be whole numbers between 40 and 600 mg/dL.

\- Duplicate readings for the same user, date and slot are not allowed.

\- Future dates are not allowed.

\- Each user can access only their own readings.



\### Reports

\- Daily report

\- Month-to-date report

\- Previous-month report

\- Highest, lowest and average glucose levels

\- Total reading count



\## Technology Stack



| Layer | Technology |

|---|---|

| Frontend | React, JavaScript, CSS |

| Build tool | Vite |

| Backend | Node.js, Express.js |

| Database | PostgreSQL |

| Authentication | JWT |

| Password security | bcrypt |

| API requests | Axios |

| Charts | Recharts |



\## Project Structure



```text

sweety-glucose-tracker/

├── client/

│   ├── src/

│   │   ├── components/

│   │   ├── pages/

│   │   ├── services/

│   │   ├── App.jsx

│   │   └── index.css

│   └── package.json

├── server/

│   ├── config/

│   ├── controllers/

│   ├── middleware/

│   ├── routes/

│   ├── scripts/

│   ├── .env.example

│   ├── server.js

│   └── package.json

├── .gitignore

└── README.md

```



\## Prerequisites



\- Node.js

\- npm

\- PostgreSQL



\## Installation and Setup



\### 1. Clone the repository



```bash

git clone YOUR\_GITHUB\_REPOSITORY\_URL

cd sweety-glucose-tracker

```



\### 2. Set up the database



Create a PostgreSQL database named `sweety\_db`.



Create the following tables:



```sql

CREATE TABLE users (

&#x20;   id SERIAL PRIMARY KEY,

&#x20;   name VARCHAR(100) NOT NULL,

&#x20;   email VARCHAR(255) UNIQUE NOT NULL,

&#x20;   password\_hash TEXT NOT NULL,

&#x20;   created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);



CREATE TABLE glucose\_readings (

&#x20;   id SERIAL PRIMARY KEY,

&#x20;   user\_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

&#x20;   reading\_date DATE NOT NULL,

&#x20;   reading\_slot VARCHAR(30) NOT NULL,

&#x20;   glucose\_level INTEGER NOT NULL

&#x20;       CHECK (glucose\_level BETWEEN 40 AND 600),

&#x20;   CONSTRAINT valid\_reading\_slot CHECK (

&#x20;       reading\_slot IN (

&#x20;           'Morning fasting',

&#x20;           'After breakfast',

&#x20;           'After lunch',

&#x20;           'After dinner'

&#x20;       )

&#x20;   ),

&#x20;   CONSTRAINT unique\_daily\_slot

&#x20;       UNIQUE (user\_id, reading\_date, reading\_slot)

);

```



\### 3. Configure the backend



Navigate to the server folder:



```bash

cd server

npm install

```



Create a `.env` file using `.env.example` as a reference.



Configure your PostgreSQL credentials and a secure JWT secret.



\### 4. Start the backend



```bash

npm run dev

```



The backend runs at:



`http://localhost:5000`



\### 5. Start the frontend



Open another terminal:



```bash

cd client

npm install

npm run dev

```



Open the local Vite URL shown in the terminal, usually:



`http://localhost:5173`



\## API Endpoints



\### Authentication



| Method | Endpoint | Description |

|---|---|---|

| POST | /api/auth/register | Register a user |

| POST | /api/auth/login | Login |



\### Glucose Readings



| Method | Endpoint | Description |

|---|---|---|

| POST | /api/glucose | Add reading |

| GET | /api/glucose | Get user readings |

| PUT | /api/glucose/:id | Update reading |

| DELETE | /api/glucose/:id | Delete reading |



\### Reports



| Method | Endpoint | Description |

|---|---|---|

| GET | /api/reports/daily | Daily report |

| GET | /api/reports/month-to-date | Current month report |

| GET | /api/reports/previous-month | Previous month report |



Protected endpoints require a valid JWT Bearer token.



\## Assumptions



\- Glucose readings are stored in mg/dL.

\- A user can record one reading per daily time slot.

\- Each reading belongs to the authenticated user.

\- Daily and monthly reports are calculated using the user's own readings.

\- Empty reporting periods return zero readings.



\## Future Improvements



\- Add graphical glucose trends.

\- Add pagination for reading history.

\- Add automated frontend and backend tests.

\- Add Docker support.

\- Improve report visualisations.



\## Disclaimer



Sweety is a personal glucose tracking application for recording and reviewing readings. It does not provide medical diagnosis or replace professional medical advice.
