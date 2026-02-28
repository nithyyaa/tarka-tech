from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import requests
from collections import Counter
from openai import OpenAI
import re
from datetime import datetime
import xml.etree.ElementTree as ET

from database import get_db
from models import User, Research
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

    # ===============================
    # CROSSREF (Analytics Source)
    # ===============================
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

        papers.append({
            "title": title,
            "authors": authors,
            "year": year,
            "summary": abstract
        })

    # ===============================
    # ARXIV (PDF Source)
    # ===============================
    arxiv_papers = []

    try:
        arxiv_url = f"http://export.arxiv.org/api/query?search_query=all:{topic}&start=0&max_results=5"
        arxiv_response = requests.get(arxiv_url, timeout=5)

        root = ET.fromstring(arxiv_response.content)
        namespace = {'atom': 'http://www.w3.org/2005/Atom'}

        for entry in root.findall('atom:entry', namespace):
            title = entry.find('atom:title', namespace).text.strip()
            summary = entry.find('atom:summary', namespace).text.strip()
            id_url = entry.find('atom:id', namespace).text
            pdf_url = id_url.replace("/abs/", "/pdf/") + ".pdf"

            authors = []
            for author in entry.findall('atom:author', namespace):
                authors.append(author.find('atom:name', namespace).text)

            arxiv_papers.append({
                "title": title,
                "authors": authors,
                "year": None,
                "summary": summary,
                "pdf_link": pdf_url
            })

    except Exception:
        arxiv_papers = []

    combined_text = " ".join([p["title"] for p in papers])

    try:
        ai_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """
You are a senior academic research analyst.

Your response MUST be structured as:

## Trend Summary
(text)

## Research Gaps
- gap

## Suggested Research Questions
1. question
"""
                },
                {
                    "role": "user",
                    "content": f"Topic: {topic}\n\nResearch Titles:\n{combined_text}"
                },
            ],
        )

        ai_analysis = ai_response.choices[0].message.content

    except Exception:
        ai_analysis = "AI analysis unavailable."

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
        "results": papers + arxiv_papers
    }
