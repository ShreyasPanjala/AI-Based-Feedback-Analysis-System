# FeedbackAI

## Problem Statement

AI-Based Feedback Analysis System

## Problem

Organizations receive feedback from students, employees, and customers. Manually reading every response and identifying sentiment and trends is slow and inconsistent.

## Solution

FeedbackAI collects categorized feedback with a 1–5 rating, analyzes the text with VADER, stores the result in MySQL, and shows live reports in a React dashboard.

## Features

- Create and list users; create and list categories
- Submit feedback with a user, category, message, and 1–5 rating
- Automatic `POSITIVE`, `NEUTRAL`, or `NEGATIVE` sentiment classification
- Save feedback as `NEUTRAL` if Python is unavailable; retain legacy `PENDING` records in reports
- Browse feedback and filter by sentiment, category, or ID through REST APIs
- Dashboard with feedback totals, average rating, sentiment distribution, and category counts
- Jakarta Validation, clear HTTP errors, CORS for Vite, and Spring Security HTTP Basic for management reads and reports

## Architecture

```text
React frontend
       |
       v
Java Spring Boot REST API
       |                  \
       v                   v
MySQL database       Python FastAPI sentiment service
```

Spring Boot is the primary backend. It owns REST APIs, business logic, validation, security, database operations, and reports. React calls only Spring Boot. Python receives feedback text from Spring Boot, applies VADER sentiment analysis, and returns a classification; it does not access MySQL.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Axios, React Router, Recharts, CSS |
| Backend | Java 17+, Spring Boot, Spring MVC, Spring Security, Maven |
| Persistence | MySQL, Spring Data JPA, Hibernate |
| Sentiment | Python 3, FastAPI, Uvicorn, VADER (`vaderSentiment`) |

## Project Structure

```text
feedback-ai/
├── backend/            Spring Boot API, services, entities, repositories, tests
├── frontend/           React pages, API client, charts, styles
├── sentiment-service/  FastAPI VADER analyzer
└── README.md
```

The repository-level `.gitignore` sits one directory above `feedback-ai/` in this checkout.

## Installation and Startup

Start MySQL first. Create the database once; Hibernate creates or updates the tables:

```sql
CREATE DATABASE feedback_ai;
```

Set `DB_USERNAME` and `DB_PASSWORD` in the backend's environment. `backend/src/main/resources/application.properties` defaults the username to `root` and uses a non-secret placeholder for the password. Do not put a real password in that file. The backend calls `http://localhost:8000` by default; set `SENTIMENT_SERVICE_URL` if Python runs elsewhere.

### Python (PowerShell)

```powershell
cd feedback-ai/sentiment-service
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Spring Boot (a second terminal)

```powershell
cd feedback-ai/backend
$env:DB_USERNAME = 'root'
$env:DB_PASSWORD = '<your MySQL password>'
mvn clean install
mvn spring-boot:run
```

Use Java 17 or newer. On the verified Windows machine, Maven is available in IntelliJ IDEA's bundled `plugins/maven/lib/maven3/bin/mvn.cmd` rather than on `PATH`.

### React (a third terminal)

```powershell
cd feedback-ai/frontend
npm install
npm run dev
npm run build
```

`npm run build` verifies the production bundle; it does not start the development server. The frontend defaults to `http://localhost:8080/api`; optionally set `VITE_API_BASE_URL` before starting Vite.

| Component | URL |
|---|---|
| React | http://localhost:5173 |
| Spring Boot | http://localhost:8080 |
| Python | http://localhost:8000 |
| Python health | http://localhost:8000/health |

## API Documentation

Protected endpoints use HTTP Basic demo credentials `admin:admin123`. The frontend uses these credentials to load reports, users, and feedback. They are intended for a local hackathon demo only.

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| POST | `/api/users` | Create a user | Public |
| GET | `/api/users` | List users | Admin |
| GET | `/api/categories` | List categories | Public |
| POST | `/api/categories` | Create a category | Admin |
| POST | `/api/feedback` | Submit feedback | Public |
| GET | `/api/feedback` | List feedback | Admin |
| GET | `/api/feedback/{id}` | Get one response | Admin |
| GET | `/api/feedback/category/{categoryId}` | Filter by category | Admin |
| GET | `/api/feedback/sentiment/{sentiment}` | Filter by sentiment | Admin |
| GET | `/api/reports/summary` | Totals, average rating, sentiment counts | Admin |
| GET | `/api/reports/category` | Count and average rating by category | Admin |
| GET | `http://localhost:8000/health` | Python health check | Public |
| POST | `http://localhost:8000/analyze` | Analyze `{ "text": "..." }` | Public, called by Spring Boot |

Example feedback request:

```json
{"userId":1,"categoryId":1,"message":"The lecture was clear and helpful.","rating":5}
```

## Demo Flow

1. Select a user and category in the React form, choose a rating, and enter feedback.
2. React sends the request to Spring Boot, which validates it and resolves the user and category.
3. Spring Boot sends only the message text to Python; VADER returns a sentiment.
4. Spring Boot persists the feedback and sentiment in MySQL and returns the saved record.
5. The feedback list and dashboard load data and calculated reports from Spring Boot.

## Future Improvements

Possible later work includes transformer-based and multilingual sentiment, topic extraction, automatic summaries, email alerts, stronger authentication and role management, and deployment. These are not part of this MVP.
