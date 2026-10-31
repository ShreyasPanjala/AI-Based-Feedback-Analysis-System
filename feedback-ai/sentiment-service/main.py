from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = FastAPI(title="FeedbackAI Sentiment Service")
analyzer = SentimentIntensityAnalyzer()


class AnalyzeRequest(BaseModel):
    text: str | None = None


class AnalyzeResponse(BaseModel):
    sentiment: str
    score: float


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "UP"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    if request.text is None or not request.text.strip():
        raise HTTPException(status_code=400, detail="text must not be blank")
    score = analyzer.polarity_scores(request.text)["compound"]
    sentiment = "POSITIVE" if score >= 0.05 else "NEGATIVE" if score <= -0.05 else "NEUTRAL"
    return AnalyzeResponse(sentiment=sentiment, score=score)
