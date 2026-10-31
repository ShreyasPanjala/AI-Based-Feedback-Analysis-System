from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import re

app = FastAPI(title="FeedbackAI Sentiment Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SentimentRequest(BaseModel):
    text: str
    rating: Optional[int] = 3

class SentimentResponse(BaseModel):
    sentiment: str
    confidence: float
    reason: str

POSITIVE_WORDS = {
    "great", "good", "excellent", "superb", "helpful", "friendly", "amazing",
    "awesome", "love", "satisfied", "satisfaction", "fast", "prompt", "clean",
    "informative", "structured", "enjoyed", "supportive", "accessible", "perfect",
    "pleased", "valuable", "efficient", "well", "best", "brilliant", "nice"
}

NEGATIVE_WORDS = {
    "bad", "poor", "terrible", "awful", "worst", "broken", "drop", "dropped",
    "delay", "delayed", "slow", "issue", "issues", "problem", "problems", "unhappy",
    "hate", "complaint", "crowded", "dirty", "unreliable", "rude", "buggy", "hard",
    "difficult", "disappointing", "frustrating", "waste", "annoying", "fails", "failed"
}

@app.get("/")
def read_root():
    return {
        "service": "FeedbackAI NLP Sentiment Analysis Service",
        "status": "online",
        "engine": "Hybrid Lexical-Heuristic Classifier"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/analyze", response_model=SentimentResponse)
def analyze_sentiment(payload: SentimentRequest):
    text = payload.text.strip().lower()
    words = re.findall(r"\b[a-z0-9'-]+\b", text)

    pos_score = sum(1 for w in words if w in POSITIVE_WORDS)
    neg_score = sum(1 for w in words if w in NEGATIVE_WORDS)

    rating = payload.rating if payload.rating is not None else 3

    # Integrate rating weighting + textual lexical intensity
    composite_score = (pos_score - neg_score) * 1.5 + (rating - 3) * 2.0

    if composite_score > 0.8:
        sentiment = "POSITIVE"
        confidence = min(0.98, 0.70 + (pos_score * 0.05) + ((rating - 3) * 0.08))
        reason = "Positive tone and favorable rating indicator"
    elif composite_score < -0.8:
        sentiment = "NEGATIVE"
        confidence = min(0.98, 0.70 + (neg_score * 0.05) + ((3 - rating) * 0.08))
        reason = "Identified critical terminology and lower rating indicator"
    else:
        sentiment = "NEUTRAL"
        confidence = 0.85
        reason = "Balanced or moderate user expression"

    return SentimentResponse(
        sentiment=sentiment,
        confidence=round(confidence, 2),
        reason=reason
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=False)

