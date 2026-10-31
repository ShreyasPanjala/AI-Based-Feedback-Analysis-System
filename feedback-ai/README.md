# FeedbackAI - AI-Based Feedback Analysis System

A modern feedback platform for collecting, managing, and analyzing student, customer, and employee feedback with intelligent sentiment categorization and reporting.

---

## 📁 Project Architecture

```
feedback-ai/
├── backend/            # Java Spring Boot REST API & MySQL / JPA persistence layer
├── frontend/           # React.js frontend interface (Phase 2)
├── sentiment-service/  # Python AI / NLP sentiment analysis service (Phase 3)
└── README.md           # Project documentation & execution guide
```

---

## 🛠️ Backend Technology Stack (Phase 1)

- **Language:** Java 17+ (Java 25 compatible)
- **Framework:** Spring Boot 3.3.5
- **REST APIs:** Spring MVC
- **Persistence & ORM:** Spring Data JPA / Hibernate
- **Database:** MySQL (Database name: `feedback_ai`) with seamless H2 in-memory testing profile
- **Security:** Spring Security (HTTP Basic Auth for admin/reporting, public feedback submission)
- **Validation:** Jakarta Validation (`spring-boot-starter-validation`)
- **Build Tool:** Apache Maven 3.9+

---

## 🗄️ Database Entities & Relationships

### 1. `User` (`users`)
- `id` (BIGINT, Primary Key, Auto Increment)
- `name` (VARCHAR, Not Null)
- `email` (VARCHAR, Unique, Not Null)
- `role` (ENUM: `USER`, `ADMIN`)
- **Relationship:** One-to-Many with `Feedback` (`1 User -> Many Feedbacks`)

### 2. `Category` (`categories`)
- `id` (BIGINT, Primary Key, Auto Increment)
- `name` (VARCHAR, Unique, Not Null)
  - Pre-seeded with: `Academic`, `Infrastructure`, `Faculty`, `Transport`, `Food`, `General`
- **Relationship:** One-to-Many with `Feedback` (`1 Category -> Many Feedbacks`)

### 3. `Feedback` (`feedbacks`)
- `id` (BIGINT, Primary Key, Auto Increment)
- `user_id` (BIGINT, Foreign Key -> `users.id`, Not Null)
- `category_id` (BIGINT, Foreign Key -> `categories.id`, Not Null)
- `message` (TEXT, Not Null)
- `rating` (INT, 1 to 5, Not Null)
- `sentiment` (VARCHAR, default `"PENDING"`)
- `created_at` (TIMESTAMP, Not Null)

---

## 🚀 Quick Start Guide

### Prerequisites
1. Java 17 or higher installed (`java -version`)
2. Maven installed (`mvn -version`)
3. MySQL Server 8.0+ running on `localhost:3306`

### 1. Configure MySQL Credentials
Open `feedback-ai/backend/src/main/resources/application.properties` and replace `YOUR_PASSWORD` with your actual MySQL password:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/feedback_ai?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 2. Build the Backend
From the `feedback-ai/backend/` directory:

```bash
mvn clean install
```

### 3. Run the Backend

**Standard MySQL Mode:**
```bash
mvn spring-boot:run
```

**Standalone / In-Memory H2 Mode (No MySQL setup needed for instant testing):**
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

---

## 🔒 Security & Admin Credentials

- **Public Endpoints:**
  - `GET /api/categories`
  - `POST /api/categories`
  - `POST /api/feedback`
  - `GET /api/feedback`
  - `GET /api/feedback/{id}`
  - `GET /api/feedback/category/{categoryId}`
  - `GET /api/feedback/sentiment/{sentiment}`
  - `GET /api/users`
  - `POST /api/users`
- **Protected Admin / Report Endpoints:**
  - `GET /api/reports/summary` (Requires HTTP Basic Auth)
  - `GET /api/reports/category` (Requires HTTP Basic Auth)
- **Administrator Account:**
  - Username: `admin`
  - Password: `admin123`

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/users` | Public | Create new user (`name`, `email`, `role`) |
| `GET` | `/api/users` | Public | List all registered users |
| `GET` | `/api/categories` | Public | List all feedback categories |
| `POST` | `/api/categories` | Public | Add a new feedback category (`name`) |
| `POST` | `/api/feedback` | Public | Submit feedback (`userId`, `categoryId`, `message`, `rating`) |
| `GET` | `/api/feedback` | Public | Retrieve all feedbacks |
| `GET` | `/api/feedback/{id}` | Public | Get feedback by ID |
| `GET` | `/api/feedback/category/{categoryId}` | Public | Filter feedback by Category ID |
| `GET` | `/api/feedback/sentiment/{sentiment}` | Public | Filter feedback by Sentiment (`PENDING`, `POSITIVE`, etc.) |
| `GET` | `/api/reports/summary` | Admin (`admin:admin123`) | Overall feedback metrics (total, avg rating, positive, neutral, negative) |
| `GET` | `/api/reports/category` | Admin (`admin:admin123`) | Feedback statistics grouped by category |

