from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import requests
from collections import Counter
from openai import OpenAI

from database import get_db
from models import User
from auth import get_current_user
from config import OPENAI_API_KEY

router = APIRouter(prefix="/research", tags=["Research"])

client = OpenAI(api_key=OPENAI_API_KEY)


@router.post("/search")
def search_research(
    topic: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 🔎 Fetch papers from CrossRef
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
                authors.append(name)
                authors_counter[name] += 1

        abstract = item.get("abstract", "No abstract available")

        if year:
            trend[str(year)] += 1

        for word in title.lower().split():
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

    # 🤖 AI Summary using OpenAI
    combined_text = " ".join([p["title"] for p in papers])

    try:
        ai_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a research analyst. Summarize trends professionally.",
                },
                {
                    "role": "user",
                    "content": f"Analyze research trends about {topic} based on these titles: {combined_text}",
                },
            ],
        )

        ai_summary = ai_response.choices[0].message.content

    except Exception as e:
        print("OpenAI Error:", e)
        ai_summary = "AI summary temporarily unavailable."

    return {
        "user": current_user.email,
        "topic": topic,
        "ai_summary": ai_summary,
        "trend_by_year": dict(trend),
        "top_authors": dict(authors_counter.most_common(5)),
        "top_keywords": dict(keywords_counter.most_common(10)),
        "results": papers,
    }