# FeedbackAI setup and deployment

The public ChatGPT Sites version is a **browser-local demo** until a public Spring Boot API is configured. Sample records and new demo submissions live only in the visitor's browser. The real application always uses React → Spring Boot → MySQL, with Spring Boot calling Python for sentiment.

## 1. Create the MySQL database

### On this computer with MySQL Workbench

1. Start MySQL Server and open MySQL Workbench.
2. Open your local MySQL connection.
3. Click **New SQL Tab**, paste the statement below, and click the lightning-bolt **Execute** button.
4. Refresh **SCHEMAS** in the left sidebar. `feedback_ai` should appear.

```sql
CREATE DATABASE IF NOT EXISTS feedback_ai;
```

This database already exists on the development computer. Hibernate creates or updates tables when Spring Boot starts with working credentials. MySQL Workbench is an administration client, not a public database host.

### For a publicly deployed application

Create a managed MySQL instance with a hosting provider. Create the `feedback_ai` database there and create a dedicated database user with access to it. Record the **host**, **port**, **database name**, **username**, and **password**. Allow network access from the Spring Boot host, and use the provider's required TLS settings. Keep the password in the hosting provider's secret/environment-variable settings; never commit it.

## 2. Deploy the Python sentiment service

Deploy `sentiment-service/` as a Python web service. Install `requirements.txt` and start it with a public HTTP listener, for example:

```sh
uvicorn main:app --host 0.0.0.0 --port 8000
```

If the platform supplies a `PORT` variable, configure its start command to use that port. Verify `GET https://<python-host>/health` returns `{"status":"UP"}` and `POST https://<python-host>/analyze` accepts `{"text":"Excellent support"}`. Python needs no MySQL credentials.

For Render, create a **Web Service** from this repository with Dockerfile path `sentiment-service/Dockerfile` and Docker context `sentiment-service`. Use its `onrender.com` HTTPS URL as the Java service's `SENTIMENT_SERVICE_URL`.

## 3. Deploy Spring Boot

Build `backend/` with Java 17 or newer:

```sh
mvn clean install
java -jar target/feedback-ai-backend-0.0.1-SNAPSHOT.jar
```

Configure these environment variables on the Java host:

| Variable | Value |
|---|---|
| `DB_URL` | `jdbc:mysql://<mysql-host>:3306/feedback_ai` plus provider-required TLS options |
| `DB_USERNAME` | Dedicated database username |
| `DB_PASSWORD` | Database password, stored as a secret |
| `SENTIMENT_SERVICE_URL` | Python service HTTPS origin, without `/analyze` |
| `FRONTEND_ORIGINS` | Exact Sites origin, for example `https://<site>.chatgpt.site` |
| `ADMIN_USERNAME` | Private admin username |
| `ADMIN_PASSWORD` | Strong private admin password, stored as a secret |
| `PORT` | Host-provided HTTP port, if needed; otherwise 8080 |

Verify `GET https://<java-host>/api/categories` returns the seeded categories. Verify protected reports with HTTP Basic. The backend must have a **public HTTPS URL** reachable from judges' browsers. Python can be private to the backend if the hosting provider supports it. If Python is temporarily unavailable, Java stores new feedback as `NEUTRAL`.

For Render, create another **Web Service** from the same repository with Dockerfile path `backend/Dockerfile` and Docker context `backend`. Set the variables above in Render's environment settings. Change `ADMIN_PASSWORD` from the local demo default before the public API is reachable. Render gives the service a public `onrender.com` URL after deployment.

### Hosted MySQL without a paid Render disk

The MySQL server installed on this PC is accessible only locally. [Aiven offers a free hosted MySQL service](https://aiven.io/docs/products/mysql/concepts/mysql-free-tier) suitable for demos. Create a MySQL service in the [Aiven console](https://console.aiven.io/) and copy its host, port, username, password, and required TLS settings into the Render backend variables. Use the database name Aiven creates or create `feedback_ai` there first. Use Aiven's actual port in `DB_URL`; it might differ from `3306`.

The hosted database starts separately from the PC database. Hibernate can create its tables, but it does not copy existing rows. To preserve the local feedback records, export them from the local MySQL server and import them into the hosted service.

## 4. Connect the Sites frontend

The React build defaults to `http://localhost:8080/api` only on a local development browser. For a real public deployment, set the build-time variable:

```text
VITE_API_BASE_URL=https://<java-host>/api
```

Build `frontend/` with `npm install` and `npm run build`, then publish the resulting frontend through ChatGPT Sites. Set `FRONTEND_ORIGINS` on Spring Boot to the **exact** published Sites origin and restart/redeploy Spring Boot. In live API mode, the admin sign-in checks credentials against Spring Boot; the password is kept only in browser memory for that tab.

ChatGPT Sites does not run the Java process, Python process, or MySQL server. Do not point the public frontend at `localhost`: that would mean each visitor's own computer.

## 5. Verify the complete flow

1. Open the Sites URL and sign in with the configured admin credentials.
2. Submit feedback. The response should show `POSITIVE`, `NEUTRAL`, or `NEGATIVE` from Python.
3. Check the feedback list and dashboard reports.
4. Query MySQL: `SELECT id, sentiment, message FROM feedback ORDER BY id DESC LIMIT 5;`.
5. Stop Python temporarily and submit once more. The record should still save with sentiment `NEUTRAL`; restart Python afterward.

The browser-local demo does not perform steps 2–4 against Java/MySQL. It labels sample data and keeps new submissions `PENDING` so that it never claims to have run Python analysis.
