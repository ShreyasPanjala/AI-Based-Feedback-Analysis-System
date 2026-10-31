# FeedbackAI sentiment service

This service analyzes text only. Spring Boot calls `POST /analyze` and owns persistence and all application APIs.

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

`GET /health` returns `{"status":"UP"}`. `POST /analyze` accepts `{"text":"..."}` and returns an uppercase VADER sentiment with its compound score.
