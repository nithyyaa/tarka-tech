from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import requests
from collections import Counter
from openai import OpenAI
import re
from datetime import datetime

from database import get_db
from models import User, Research
from auth import get_current_user
from config import OPENAI_API_KEY

router = APIRouter(prefix="/research", tags=["Research"])

client = OpenAI(api_key=OPENAI_API_KEY)


# ==================================================
# SEARCH ROUTE
# ==================================================
@router.post("/search")
def search_research(
    topic: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    url = f"https://api.crossref.org/works?query={topic}&rows=15"
    response = requests.get(url)
    data = response.json()

    papers = []
    trend = Counter()
    authors_counter = Counter()
    keywords_counter = Counter()

    for item in data["message"]["items"]:
        title = item.get("title", ["No title"])[0]

        year = item.get("published-print", {}).get(
            "date-parts", [[None]]
        )[0][0]

        authors = []
        if "author" in item:
            for a in item["author"]:
                name = f"{a.get('given','')} {a.get('family','')}".strip()
                if name:
                    authors.append(name)
                    authors_counter[name] += 1

        abstract = item.get("abstract", "No abstract available")
        abstract = re.sub("<.*?>", "", abstract)

        if year:
            trend[str(year)] += 1

        clean_title = re.sub(r"[^\w\s]", "", title.lower())
        for word in clean_title.split():
            if len(word) > 4:
                keywords_counter[word] += 1

        papers.append(
            {
                "title": title,
                "authors": authors,
                "year": year,
                "summary": abstract,
            }
        )

    combined_text = " ".join([p["title"] for p in papers])

    try:
        ai_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """
You are a senior academic research analyst.

Your response MUST be detailed and structured exactly as:

## Trend Summary
(Multi-paragraph academic analysis)

## Research Gaps
- Gap 1
- Gap 2

## Suggested Research Questions
1. Question 1
2. Question 2

Be analytical and thorough.
"""
                },
                {
                    "role": "user",
                    "content": f"""
Topic: {topic}

Research Titles:
{combined_text}
"""
                },
            ],
        )

        ai_analysis = ai_response.choices[0].message.content

    except Exception as e:
        print("OpenAI Error:", e)
        ai_analysis = """## Trend Summary
AI analysis temporarily unavailable.

## Research Gaps
- Unable to generate research gaps.

## Suggested Research Questions
1. Unable to generate research questions.
"""

    new_entry = Research(
        topic=topic,
        ai_summary=ai_analysis,
        user_id=current_user.id,
        created_at=datetime.utcnow()
    )

    db.add(new_entry)
    db.commit()

    return {
        "user": current_user.email,
        "topic": topic,
        "ai_analysis": ai_analysis,
        "trend_by_year": dict(trend),
        "top_authors": dict(authors_counter.most_common(5)),
        "top_keywords": dict(keywords_counter.most_common(10)),
        "results": papers,
    }


# ==================================================
# HISTORY ROUTE
# ==================================================
@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    history = (
        db.query(Research)
        .filter(Research.user_id == current_user.id)
        .order_by(Research.created_at.desc())
        .all()
    )

    return [
        {
            "id": item.id,
            "topic": item.topic,
            "ai_summary": item.ai_summary,
            "created_at": item.created_at,
        }
        for item in history
    ]


# ==================================================
# INSIGHTS ROUTE
# ==================================================
@router.get("/insights")
def get_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    history = (
        db.query(Research)
        .filter(Research.user_id == current_user.id)
        .order_by(Research.created_at.asc())
        .all()
    )

    if not history:
        return {"message": "No research history available."}

    total_searches = len(history)

    topic_counts = Counter([item.topic for item in history])
    most_common_topic = topic_counts.most_common(1)[0][0]

    first_date = history[0].created_at
    last_date = history[-1].created_at
    span_days = (last_date - first_date).days + 1

    avg_gap = span_days / total_searches if total_searches else 0

    if total_searches >= 20:
        behavior = "Intensive Investigator"
    elif total_searches >= 10:
        behavior = "Focused Researcher"
    else:
        behavior = "Curious Explorer"

    intensity_score = round(total_searches / max(span_days, 1), 2)

    return {
        "total_searches": total_searches,
        "most_common_topic": most_common_topic,
        "research_span_days": span_days,
        "average_gap_days": round(avg_gap, 2),
        "activity_intensity": intensity_score,
        "behavior_type": behavior,
    }


# ==================================================
# OPPORTUNITY RADAR ROUTE
# ==================================================
@router.get("/opportunities")
def get_research_opportunities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    history = (
        db.query(Research)
        .filter(Research.user_id == current_user.id)
        .all()
    )

    if not history:
        return {"opportunities": []}

    topics = [item.topic for item in history]
    combined_topics = ", ".join(topics)

    try:
        ai_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """
You are a research strategist.

Suggest 5 emerging or adjacent research opportunity topics
based on the user's past research interests.

Return ONLY a list.
Each item on a new line.
No numbering.
No explanation.
"""
                },
                {
                    "role": "user",
                    "content": f"User research history: {combined_topics}"
                },
            ],
        )

        content = ai_response.choices[0].message.content

        lines = [
            line.strip("-• ").strip()
            for line in content.split("\n")
            if line.strip()
        ]

        opportunities = lines[:5]

    except Exception as e:
        print("AI Opportunity Error:", e)
        opportunities = []

    return {"opportunities": opportunities}